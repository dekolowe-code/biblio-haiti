import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Trophy, Zap, ChevronRight } from 'lucide-react'
import BookCard from '@/components/BookCard'
import CategoryPill from '@/components/CategoryPill'
import { books, categories, getStoredStars, quizzes } from '@/data/mockData'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [stars, setStars] = useState(getStoredStars())
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setStars(getStoredStars()), 1000)
    return () => clearInterval(interval)
  }, [])

  const featuredBooks = books.slice(0, 5)
  const recentBooks = books.slice(0, 6)

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <div className="relative h-[200px] overflow-hidden">
        <img
          src="/hero-banner.jpg"
          alt="Biblio-Haiti"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#9B1B30]/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="font-poppins font-semibold text-sm text-white text-shadow">
            Exploration & Culture Ha\u00eftienne
          </p>
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${i === heroIndex ? 'bg-[#FAA307] w-4' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </div>

      {/* Star Points Badge */}
      <div className="relative px-4 -mt-8 flex justify-end z-10">
        <motion.div
          whileTap={{ scale: 0.95 }}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FAA307] to-[#E85D04] border-[3px] border-white shadow-[0_4px_12px_rgba(250,163,7,0.3)] flex flex-col items-center justify-center cursor-pointer"
        >
          <span className="font-poppins font-extrabold text-lg text-white leading-none">{stars}</span>
          <span className="text-[9px] text-white font-inter mt-0.5">\u00c9toiles</span>
        </motion.div>
      </div>

      {/* Category Pills */}
      <div className="mt-4 px-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map(cat => (
            <CategoryPill key={cat.id} {...cat} />
          ))}
        </div>
      </div>

      {/* For You Section */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-semibold text-base text-[#1A1A2E]">Pour toi</h2>
          <button
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-0.5 text-[#C41E3A] text-xs font-poppins font-medium"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {featuredBooks.map(book => (
            <div key={book.id} className="snap-start">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* New Arrivals */}
      <div className="mt-6 px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-semibold text-base text-[#1A1A2E]">Nouveaut\u00e9s</h2>
          <button
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-0.5 text-[#C41E3A] text-xs font-poppins font-medium"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory">
          {recentBooks.map(book => (
            <div key={book.id} className="snap-start">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>

      {/* Quiz CTA Banner */}
      <div className="mt-6 px-4">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/quiz')}
          className="relative overflow-hidden rounded-2xl h-[100px] cursor-pointer"
        >
          <img src="/quiz-banner.jpg" alt="Quiz" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#3A0CA3]/80 to-[#7209B7]/60 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-[#FAA307]" />
              </div>
              <div>
                <p className="font-poppins font-bold text-sm text-white">Gagne des \u00c9toiles!</p>
                <p className="text-[10px] text-white/80">Joue et gagne des r\u00e9compenses</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#FAA307] to-[#E85D04] rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-lg">
              <Zap className="w-4 h-4 text-white" />
              <span className="font-poppins font-bold text-xs text-white">JOUER</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quizzes Available */}
      <div className="mt-6 px-4 pb-6">
        <h2 className="font-poppins font-semibold text-base text-[#1A1A2E] mb-3">Quiz disponibles</h2>
        <div className="space-y-2">
          {quizzes.map(quiz => (
            <motion.div
              key={quiz.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#3A86FF] to-[#7209B7] flex items-center justify-center flex-shrink-0">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E] truncate">{quiz.title}</h3>
                <p className="text-[10px] text-[#6B7280]">{quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'} \u2022 {quiz.questions.length} questions</p>
              </div>
              <div className="flex items-center gap-1 bg-[#FFF8F0] rounded-full px-2 py-1 flex-shrink-0">
                <Zap className="w-3 h-3 text-[#FAA307]" />
                <span className="text-[10px] font-poppins font-bold text-[#FAA307]">+{quiz.starReward}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
