import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Star, Settings, ChevronLeft, ChevronRight, Type, Sun, Moon } from 'lucide-react'
import { type Book } from '@/data/mockData'
import { useLibrary } from '@/context/LibraryContext'
import { getAllBooks } from '@/lib/bookService'
import TextReader from '@/components/readers/TextReader'
import PDFReader from '@/components/readers/PDFReader'
import EPUBReader from '@/components/readers/EPUBReader'
import '@/reader.css'

type Theme = 'white' | 'sepia' | 'dark'

export default function ReadingScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const [showControls, setShowControls] = useState(true)
  const [currentPage, setCurrentPage] = useState<number | string>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [theme, setTheme] = useState<Theme>('sepia')
  const [showSettings, setShowSettings] = useState(false)
  const [book, setBook] = useState<Book | null>(null)
  const { library, isLoading, updateProgress: syncProgress, isFavorite: checkFavorite, toggleFavorite } = useLibrary()
  const favorite = checkFavorite(bookId!)

  useEffect(() => {
    getAllBooks().then(all => {
      const found = all.find(b => b.id === bookId)
      setBook(found || null)
    })
  }, [bookId])

  useEffect(() => {
    if (book && !isLoading) {
      const entry = library.find(ub => ub.bookId === bookId)
      if (entry && entry.currentPage !== undefined) {
        setCurrentPage(entry.currentPage)
      }
      setIsLoaded(true)
    }
  }, [bookId, book, isLoading])

  useEffect(() => {
    if (book && isLoaded) {
      const isFinished = typeof currentPage === 'number' ? currentPage >= book.pages - 1 : false
      syncProgress(bookId!, currentPage as any, isFinished)
    }
  }, [currentPage, book, bookId, isLoaded])

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 4000)
    return () => clearTimeout(timer)
  }, [showControls])

  if (!book) {
    return <div className="flex items-center justify-center h-screen text-[#6B7280]">Livre non trouvé</div>
  }

  const currentPageNumber = typeof currentPage === 'number' ? currentPage : 0
  const totalPages = book.pages
  const progress = totalPages > 0 ? ((currentPageNumber + 1) / totalPages) * 100 : 0

  const themeStyles: Record<Theme, { bg: string; text: string }> = {
    white: { bg: 'bg-white', text: 'text-[#1A1A2E]' },
    sepia: { bg: 'bg-[#F5E6D3]', text: 'text-[#3D2B1F]' },
    dark: { bg: 'bg-[#1A1A2E]', text: 'text-[#E8E8E8]' },
  }

  const currentTheme = themeStyles[theme]

  return (
    <div className={`min-h-screen ${currentTheme.bg} ${currentTheme.text} relative overflow-hidden`}>
      {/* Top Toolbar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 ${currentTheme.bg} shadow-sm`}
            style={{ maxWidth: 430, margin: '0 auto' }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="font-poppins font-semibold text-sm truncate flex-1 mx-3 text-center">{book.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => toggleFavorite(book.id)}>
                  <Star className={`w-5 h-5 ${favorite ? 'text-[#FAA307] fill-[#FAA307]' : ''}`} />
                </button>
                <button onClick={() => setShowSettings(!showSettings)}>
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && showControls && (
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className={`fixed top-14 left-0 right-0 z-40 ${currentTheme.bg} shadow-lg px-4 py-4`}
            style={{ maxWidth: 430, margin: '0 auto' }}
          >
            {/* Font Size (Only for Text books) */}
            {book.type === 'text' && (
              <div className="flex items-center gap-3 mb-3">
                <Type className="w-4 h-4" />
                <span className="text-xs font-inter">Taille</span>
                <input
                  type="range"
                  min={14}
                  max={22}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="flex-1 accent-[#C41E3A]"
                />
                <span className="text-xs font-inter w-6">{fontSize}</span>
              </div>
            )}
            {/* Theme */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-inter">Thème</span>
              <div className="flex gap-2">
                {[
                  { value: 'white' as Theme, icon: Sun, label: 'Clair' },
                  { value: 'sepia' as Theme, icon: Sun, label: 'Sépia' },
                  { value: 'dark' as Theme, icon: Moon, label: 'Sombre' },
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-inter transition-colors ${theme === t.value ? 'bg-[#C41E3A] text-white' : 'bg-gray-100 text-[#1A1A2E]'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <div
        className="pt-16 pb-20 w-full h-screen flex items-center justify-center"
        onClick={() => setShowControls(!showControls)}
      >
        {book.type === 'pdf' && book.pdfUrl ? (
          <PDFReader 
            fileUrl={book.pdfUrl} 
            onPageChange={(page) => setCurrentPage(page)}
            initialPage={typeof currentPage === 'number' ? currentPage : 0}
          />
        ) : book.type === 'epub' && book.epubUrl ? (
          <EPUBReader 
            fileUrl={book.epubUrl} 
            onPageChange={(cfi) => setCurrentPage(cfi as any)}
            initialLocation={typeof currentPage === 'string' ? currentPage : undefined}
          />
        ) : (
          <div className="px-6 w-full max-w-lg">
            <TextReader 
              content={book.content} 
              currentPage={typeof currentPage === 'number' ? currentPage : 0} 
              fontSize={fontSize} 
            />
          </div>
        )}
      </div>

      {/* Bottom Toolbar */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className={`fixed bottom-0 left-0 right-0 z-50 ${currentTheme.bg} shadow-[0_-2px_10px_rgba(0,0,0,0.1)]`}
            style={{ maxWidth: 430, margin: '0 auto' }}
          >
            <div className="px-4 py-3">
              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-200 rounded-full mb-2">
                <motion.div
                  className="h-full bg-[#2EC4B6] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-inter">
                  {typeof currentPage === 'number' ? `Page ${currentPage + 1} sur ${totalPages}` : 'Lecture en cours'}
                </span>
                <div className="flex gap-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (typeof currentPage === 'number') setCurrentPage(Math.max(0, currentPage - 1)) }}
                    disabled={typeof currentPage !== 'number' || currentPage === 0}
                    className="w-8 h-8 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (typeof currentPage === 'number') setCurrentPage(Math.min(totalPages - 1, currentPage + 1)) }}
                    disabled={typeof currentPage !== 'number' || currentPage >= totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
