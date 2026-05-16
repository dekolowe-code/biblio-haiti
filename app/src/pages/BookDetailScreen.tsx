import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Heart, ArrowLeft, Lock, BookOpen, Check, Loader2 } from 'lucide-react'
import { type Book, books as mockBooks } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
import { useLibrary } from '@/context/LibraryContext'
import { getAllBooks } from '@/lib/bookService'

export default function BookDetailScreen() {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [book, setBook] = useState<Book | null>(mockBooks.find(b => b.id === bookId) || null)
  const [allBooks, setAllBooks] = useState<Book[]>(mockBooks)
  const [loading, setLoading] = useState(!book)
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    getAllBooks().then(all => {
      setAllBooks(all)
      const found = all.find(b => b.id === bookId)
      setBook(found || null)
      setLoading(false)
    })
  }, [bookId])

  const { isFavorite, isUnlocked: checkUnlocked, toggleFavorite, unlockBook } = useLibrary()
  const isUnlocked = checkUnlocked(bookId!) || !book?.isPremium
  const favorite = isFavorite(bookId!)
  const stars = user?.starsBalance || 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-3">
        <Loader2 className="w-8 h-8 text-[#C41E3A] animate-spin" />
        <p className="text-sm text-[#6B7280] font-inter">Chargement du livre...</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[#6B7280] font-inter">Livre non trouvé</p>
      </div>
    )
  }

  const handleUnlock = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (stars < book.unlockCost) {
      setToast({ message: 'Étoiles insuffisantes! Joue au quiz pour en gagner.', type: 'error' })
      setTimeout(() => setToast(null), 3000)
      return
    }
    const success = await unlockBook(book.id, book.unlockCost, book.title)
    if (success) {
      setShowUnlockAnimation(true)
      setTimeout(() => setShowUnlockAnimation(false), 2000)
    }
  }

  const handleFavorite = () => {
    if (!user) {
      navigate('/login')
      return
    }
    toggleFavorite(book.id)
    setToast({ message: favorite ? 'Retiré des favoris' : 'Ajouté aux favoris', type: 'success' })
    setTimeout(() => setToast(null), 2000)
  }

  const handleRead = () => {
    if (!user) {
      navigate('/login')
      return
    }
    // Reading progress is handled in ReadingScreen
    navigate(`/livre/${book.id}/read`)
  }

  const relatedBooks = allBooks.filter(b => b.id !== book.id && (b.category === book.category || b.country === book.country)).slice(0, 5)

  return (
    <div className="min-h-full pb-4">
      {/* Back Button */}
      <div className="px-4 pt-3 pb-2 flex items-center">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md"
        >
          <ArrowLeft className="w-4 h-4 text-[#1A1A2E]" />
        </motion.button>
      </div>

      {/* Book Cover */}
      <div className="flex justify-center px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative w-[60%] max-w-[200px]"
        >
          <img
            src={book.coverUrl}
            alt={book.title}
            className={`w-full rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] ${isUnlocked ? '' : 'grayscale-[0.4]'}`}
          />
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-3">
                <Lock className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
          {book.isPremium && (
            <div className="absolute top-2 right-2 bg-gradient-to-br from-[#FAA307] to-[#E85D04] rounded-full px-2 py-0.5 flex items-center gap-0.5 shadow-lg">
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="text-white font-poppins font-bold text-[10px]">{book.unlockCost}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Book Info */}
      <div className="px-4 mt-4 text-center">
        <h1 className="font-poppins font-bold text-xl text-[#1A1A2E]">{book.title}</h1>
        <p className="text-sm text-[#6B7280] font-inter mt-1">{book.author}</p>
        <div className="flex items-center justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Star
              key={i}
              className={`w-4 h-4 ${i <= Math.round(book.rating) ? 'text-[#FAA307] fill-[#FAA307]' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm font-poppins font-semibold text-[#1A1A2E] ml-1">{book.rating}</span>
          <span className="text-xs text-[#6B7280] font-inter">({book.totalRatings} avis)</span>
        </div>
      </div>

      {/* Metadata Tags */}
      <div className="px-4 mt-3 flex flex-wrap justify-center gap-2">
        <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-inter">{book.country}</span>
        <span className="bg-orange-50 text-orange-700 px-2.5 py-1 rounded-lg text-xs font-inter">{book.category}</span>
        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-inter">{book.style}</span>
        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs font-inter">{book.pages} pages</span>
      </div>

      {/* Description */}
      <div className="px-4 mt-4">
        <p className="text-sm text-[#1A1A2E] font-inter leading-relaxed">{book.description}</p>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <div className="mt-6 px-4">
          <h2 className="font-poppins font-semibold text-base text-[#1A1A2E] mb-3">Livres similaires</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {relatedBooks.map(b => (
              <motion.div
                key={b.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(`/livre/${b.id}`)}
                className="flex-shrink-0 w-[100px] cursor-pointer"
              >
                <img
                  src={b.coverUrl}
                  alt={b.title}
                  className="w-full rounded-xl shadow-md"
                  style={{ aspectRatio: '3/4' }}
                />
                <p className="text-[10px] font-poppins font-semibold text-[#1A1A2E] mt-1 truncate">{b.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="px-4 mt-6 space-y-2 pb-4">
        {isUnlocked ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleRead}
            className="w-full h-12 gradient-teal rounded-xl flex items-center justify-center gap-2 shadow-md"
          >
            <BookOpen className="w-5 h-5 text-white" />
            <span className="font-poppins font-bold text-sm text-white">LIRE</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleUnlock}
            className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 shadow-md ${stars >= book.unlockCost ? 'gradient-golden' : 'bg-gray-300'}`}
          >
            {stars >= book.unlockCost ? (
              <>
                <Lock className="w-5 h-5 text-white" />
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="font-poppins font-bold text-sm text-white">DÉBLOQUER ★ {book.unlockCost}</span>
              </>
            ) : (
              <span className="font-poppins font-bold text-sm text-white">★ INSUFFISANT</span>
            )}
          </motion.button>
        )}

        {stars < book.unlockCost && !isUnlocked && (
          <p className="text-center text-xs text-[#FAA307] font-inter">
            Gagne plus d'étoiles en jouant aux quiz!
          </p>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleFavorite}
          className={`w-full h-11 rounded-xl flex items-center justify-center gap-2 border-2 transition-colors ${favorite ? 'border-[#C41E3A] bg-red-50' : 'border-gray-200 bg-white'}`}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'text-[#C41E3A] fill-[#C41E3A]' : 'text-[#6B7280]'}`} />
          <span className={`font-poppins font-semibold text-xs ${favorite ? 'text-[#C41E3A]' : 'text-[#1A1A2E]'}`}>
            {favorite ? 'DANS LES FAVORIS' : 'AJOUTER AUX FAVORIS'}
          </span>
        </motion.button>
      </div>

      {/* Unlock Animation */}
      <AnimatePresence>
        {showUnlockAnimation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              className="bg-white rounded-3xl p-8 flex flex-col items-center shadow-2xl"
            >
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="w-16 h-16 text-green-500" />
              </motion.div>
              <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-poppins font-bold text-xl text-[#1A1A2E] mt-4"
              >
                DÉBLOQUÉ!
              </motion.h2>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm text-[#6B7280] font-inter mt-1"
              >
                Tu peux maintenant lire ce livre
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className={`fixed top-4 left-4 right-4 z-[100] rounded-xl px-4 py-3 flex items-center gap-2 shadow-lg ${toast.type === 'success' ? 'bg-[#2EC4B6]' : 'bg-[#C41E3A]'}`}
            style={{ maxWidth: 398, margin: '0 auto' }}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4 text-white" /> : <Lock className="w-4 h-4 text-white" />}
            <span className="text-white text-sm font-inter">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
