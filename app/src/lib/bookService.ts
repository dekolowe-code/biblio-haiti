import { supabase } from './supabase'
import { books as mockBooks, type Book } from '@/data/mockData'

export async function getAllBooks(): Promise<Book[]> {
  try {
    const { data: remoteBooks, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching books from Supabase:', error)
      return mockBooks
    }

    const mappedRemoteBooks: Book[] = (remoteBooks || []).map(rb => ({
      id: rb.id,
      title: rb.title,
      author: rb.author,
      description: rb.description,
      coverUrl: rb.cover_url,
      country: rb.country,
      category: rb.category,
      style: rb.style,
      isPremium: rb.is_premium,
      unlockCost: rb.unlock_cost,
      rating: rb.rating || 0,
      totalRatings: rb.total_ratings || 0,
      pages: rb.pages || 0,
      content: rb.content || [],
      type: rb.type as 'text' | 'pdf' | 'epub',
      pdfUrl: rb.pdf_url,
      epubUrl: rb.epub_url,
    }))

    return [...mockBooks, ...mappedRemoteBooks]
  } catch (err) {
    console.error('Unexpected error fetching books:', err)
    return mockBooks
  }
}

export async function uploadBook(bookData: Partial<Book>, coverFile?: File, bookFile?: File) {
  let coverUrl = bookData.coverUrl
  let pdfUrl = bookData.pdfUrl
  let epubUrl = bookData.epubUrl

  if (coverFile) {
    const { data, error } = await supabase.storage
      .from('book-assets')
      .upload(`covers/${Date.now()}_${coverFile.name}`, coverFile)
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('book-assets').getPublicUrl(data.path)
      coverUrl = publicUrl
    }
  }

  if (bookFile) {
    const folder = bookData.type === 'pdf' ? 'pdfs' : 'epubs'
    const { data, error } = await supabase.storage
      .from('book-assets')
      .upload(`${folder}/${Date.now()}_${bookFile.name}`, bookFile)
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('book-assets').getPublicUrl(data.path)
      if (bookData.type === 'pdf') pdfUrl = publicUrl
      else epubUrl = publicUrl
    }
  }

  const { data, error } = await supabase
    .from('books')
    .insert([{
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      cover_url: coverUrl,
      country: bookData.country,
      category: bookData.category,
      style: bookData.style,
      is_premium: bookData.isPremium,
      unlock_cost: bookData.unlockCost,
      pages: bookData.pages,
      type: bookData.type,
      pdf_url: pdfUrl,
      epub_url: epubUrl,
      content: bookData.content || [],
    }])
    .select()

  return { data, error }
}
