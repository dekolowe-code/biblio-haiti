import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { BookOpen, Heart, Lock, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLibrary } from '@/context/LibraryContext'
import { toast } from 'sonner'
import { type Book, books as mockBooks } from '@/data/mockData'
import { getAllBooks } from '@/lib/bookService'

type TabType = 'reading' | 'favorites' | 'unlocked'

export default function LibraryScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('reading')
  const { library } = useLibrary()
  const [books, setBooks] = useState<Book[]>(mockBooks)

  useEffect(() => {
    getAllBooks().then(setBooks)
  }, [])

  const readingBooks = library.filter(ub => !ub.isFinished && (ub.currentPage > 0 || ub.isUnlocked))
  const favoriteBooks = library.filter(ub => ub.isFavorite)
  const unlockedBooks = library.filter(ub => ub.isUnlocked)

  const getBook = (bookId: string) => books.find(b => b.id === bookId)

  const handleDelete = (_bookId: string) => {
    // Delete logic not yet synced to Supabase (can be added to LibraryContext if needed)
    toast.info('Fonctionnalité non disponible en mode synchro')
  }

  const tabs: { key: TabType; label: string }[] = [
    { key: 'reading', label: 'En cours' },
    { key: 'favorites', label: 'Favoris' },
    { key: 'unlocked', label: 'Débloqués' },
  ]

  const renderEmptyState = (type: TabType) => {
    const messages: Record<TabType, { title: string; desc: string }> = {
      reading: { title: "Tu n'as pas commencé de lecture", desc: 'Explore le catalogue pour commencer' },
      favorites: { title: 'Aucun favori', desc: 'Ajoute des livres à tes favoris' },
      unlocked: { title: 'Aucun livre débloqué', desc: 'Débloque des livres premium avec tes étoiles' },
    }
    const msg = messages[type]
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <img src="/empty-library.jpg" alt="Empty" className="w-32 h-32 rounded-2xl mb-4 opacity-60" />
        <p className="text-sm font-poppins font-semibold text-[#1A1A2E] text-center">{msg.title}</p>
        <p className="text-xs text-[#6B7280] font-inter text-center mt-1">{msg.desc}</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/catalogue')}
          className="mt-4 px-6 py-2.5 bg-gradient-to-r from-[#C41E3A] to-[#E85D04] rounded-xl text-white font-poppins font-semibold text-sm"
        >
          Explorer le catalogue
        </motion.button>
      </div>
    )
  }

  const renderBookList = (bookList: typeof library) => {
    if (bookList.length === 0) return renderEmptyState(activeTab)

    return (
      <div className="space-y-3">
        {bookList.map(ub => {
          const book = getBook(ub.bookId)
          if (!book) return null
          const progress = book.pages > 0 ? (ub.currentPage / book.pages) * 100 : 0

          return (
            <motion.div
              key={ub.bookId}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer"
            >
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-14 h-[72px] object-cover rounded-lg flex-shrink-0"
                onClick={() => navigate(`/livre/${book.id}`)}
              />
              <div className="flex-1 min-w-0" onClick={() => navigate(`/livre/${book.id}`)}>
                <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] truncate">{book.title}</h3>
                <p className="text-[10px] text-[#6B7280] font-inter">{book.author}</p>
                {activeTab === 'reading' && (
                  <div className="mt-1.5">
                    <div className="w-full h-1 bg-gray-100 rounded-full">
                      <div className="h-full bg-[#2EC4B6] rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="text-[9px] text-[#6B7280] font-inter mt-0.5">Page {ub.currentPage} sur {book.pages}</p>
                  </div>
                )}
                {activeTab === 'unlocked' && (
                  <p className="text-[10px] text-[#6B7280] font-inter mt-1">Débloqué récemment</p>
                )}
              </div>
              {activeTab === 'favorites' && (
                <Heart className="w-4 h-4 text-[#C41E3A] fill-[#C41E3A] flex-shrink-0" />
              )}
              {activeTab === 'reading' && (
                <div className="w-8 h-8 bg-[#2EC4B6]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-[#2EC4B6]" />
                </div>
              )}
              {activeTab === 'unlocked' && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(ub.bookId) }}
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-[#6B7280]" />
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <Lock className="w-12 h-12 text-[#6B7280] mb-4" />
        <p className="text-sm font-poppins text-[#1A1A2E] text-center">Connecte-toi pour accéder à ta bibliothèque</p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2.5 gradient-golden rounded-xl text-white font-poppins font-semibold text-sm"
        >
          Se connecter
        </motion.button>
      </div>
    )
  }

  return (
    <div className="min-h-full pb-4">
      {/* Header */}
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-poppins font-bold text-xl text-[#1A1A2E]">Ma Bibliothèque</h1>
      </div>

      {/* Reading Stats Card */}
      <div className="px-4 mt-2">
        <div className="gradient-top rounded-2xl p-4 flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 28 * (readingBooks.length * 20 / 100)} ${2 * Math.PI * 28}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white font-poppins font-bold text-xs">{Math.min(100, readingBooks.length * 20)}%</span>
            </div>
          </div>
          <div>
            <p className="text-white font-poppins font-semibold text-sm">{readingBooks.length} livre{readingBooks.length !== 1 ? 's' : ''} en cours</p>
            <p className="text-white/80 text-xs font-inter mt-0.5">Objectif: 5 livres ce mois</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 mt-4">
        <div className="flex bg-white rounded-xl p-1 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 rounded-lg text-xs font-poppins font-medium transition-colors relative ${activeTab === tab.key ? 'text-[#C41E3A]' : 'text-[#6B7280]'}`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <motion.div
                  layoutId="library-tab"
                  className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-[#C41E3A] rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4">
        {activeTab === 'reading' && renderBookList(readingBooks)}
        {activeTab === 'favorites' && renderBookList(favoriteBooks)}
        {activeTab === 'unlocked' && renderBookList(unlockedBooks)}
      </div>
    </div>
  )
}
