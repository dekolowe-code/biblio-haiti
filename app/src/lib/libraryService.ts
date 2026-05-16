import { supabase } from './supabase'
import { type UserBook } from '@/data/mockData'

export async function getUserLibrary(): Promise<UserBook[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('user_library')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching library:', error)
    return []
  }

  return data.map(item => ({
    bookId: item.book_id,
    isUnlocked: item.is_unlocked,
    isFavorite: item.is_favorite,
    currentPage: item.current_page,
    isFinished: item.is_finished
  }))
}

export async function toggleFavorite(bookId: string, isFavorite: boolean) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('user_library')
    .upsert({ 
      user_id: user.id, 
      book_id: bookId, 
      is_favorite: isFavorite 
    }, { onConflict: 'user_id, book_id' })

  return !error
}

export async function unlockBook(bookId: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('user_library')
    .upsert({ 
      user_id: user.id, 
      book_id: bookId, 
      is_unlocked: true 
    }, { onConflict: 'user_id, book_id' })

  return !error
}

export async function updateReadingProgress(bookId: string, page: number, finished: boolean = false) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { error } = await supabase
    .from('user_library')
    .upsert({ 
      user_id: user.id, 
      book_id: bookId, 
      current_page: page,
      is_finished: finished,
      is_unlocked: true 
    }, { onConflict: 'user_id, book_id' })

  return !error
}
