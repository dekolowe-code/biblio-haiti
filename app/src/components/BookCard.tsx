import { motion } from 'framer-motion'
import { Star, Lock } from 'lucide-react'
import type { Book } from '@/data/mockData'
import { getStoredLibrary } from '@/data/mockData'
import { useNavigate } from 'react-router'

interface BookCardProps {
  book: Book
  compact?: boolean
}

export default function BookCard({ book, compact = false }: BookCardProps) {
  const navigate = useNavigate()
  const library = getStoredLibrary()
  const userBook = library.find(ub => ub.bookId === book.id)
  const isUnlocked = userBook?.isUnlocked || !book.isPremium

  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/livre/${book.id}`)}
      className={`flex-shrink-0 cursor-pointer ${compact ? 'w-[110px]' : 'w-[120px]'}`}
    >
      <div className="relative">
        <img
          src={book.coverUrl}
          alt={book.title}
          className={`w-full object-cover rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] ${isUnlocked ? '' : 'grayscale-[0.3]'}`}
          style={{ aspectRatio: '3/4' }}
        />
        {!isUnlocked && book.isPremium && (
          <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
            <div className="bg-gradient-to-br from-[#FAA307] to-[#E85D04] rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
              <Lock className="w-3 h-3 text-white" />
              <Star className="w-3 h-3 text-white fill-white" />
              <span className="text-white font-poppins font-bold text-xs">{book.unlockCost}</span>
            </div>
          </div>
        )}
      </div>
      <h3 className="font-poppins font-semibold text-xs text-[#1A1A2E] mt-2 line-clamp-2 leading-tight">
        {book.title}
      </h3>
      <p className="text-[10px] text-[#6B7280] mt-0.5 truncate">{book.author}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <Star className="w-3 h-3 text-[#FAA307] fill-[#FAA307]" />
        <span className="text-[10px] font-poppins font-semibold text-[#1A1A2E]">{book.rating}</span>
      </div>
    </motion.div>
  )
}
