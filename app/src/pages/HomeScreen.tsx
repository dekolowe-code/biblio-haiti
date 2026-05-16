import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router'
import { Trophy, Zap, ChevronRight } from 'lucide-react'
import BookCard from '@/components/BookCard'
import CategoryPill from '@/components/CategoryPill'
import { categories, getStoredStars, quizzes, type Book, books as mockBooks } from '@/data/mockData'
import { getAllBooks } from '@/lib/bookService'

export default function HomeScreen() {
  const navigate = useNavigate()
  const [stars, setStars] = useState(getStoredStars())
  const [heroIndex, setHeroIndex] = useState(0)
  const [books, setBooks] = useState<Book[]>(mockBooks)
  const pourToiRef = useRef<HTMLDivElement>(null)
  const recentBooksRef = useRef<HTMLDivElement>(null)
  const categoryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getAllBooks().then(setBooks)
  }, [])

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

  // Auto-scroll logic for horizontal lists
  useEffect(() => {
    const interval = setInterval(() => {
      // Scroll "Pour toi"
      if (pourToiRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = pourToiRef.current
        if (scrollLeft + clientWidth >= scrollWidth - 5) {
          pourToiRef.current.scrollTo({ left: 0, behavior: 'smooth' })
        } else {
          pourToiRef.current.scrollBy({ left: 150, behavior: 'smooth' })
        }
      }
      
      // Scroll "Nouveautés" (with a slight delay or different timing for variety)
      setTimeout(() => {
        if (recentBooksRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = recentBooksRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 5) {
            recentBooksRef.current.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            recentBooksRef.current.scrollBy({ left: 150, behavior: 'smooth' })
          }
        }
      }, 1000)

      // Scroll "Categories" (faster)
      setTimeout(() => {
        if (categoryRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = categoryRef.current
          if (scrollLeft + clientWidth >= scrollWidth - 5) {
            categoryRef.current.scrollTo({ left: 0, behavior: 'smooth' })
          } else {
            categoryRef.current.scrollBy({ left: 120, behavior: 'smooth' })
          }
        }
      }, 500)
    }, 4000) // Slightly faster overall interval
    return () => clearInterval(interval)
  }, [])

  const heroImages = [
    '/hero-banner.jpg',
    'https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=2071&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop'
  ]

  const featuredBooks = books.slice(0, 5)
  const recentBooks = books.slice(0, 6)

  return (
    <div className="pb-4">
      {/* Hero Banner */}
      <div className="relative h-[220px] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={heroIndex}
            src={heroImages[heroIndex]}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            alt="Biblio-Haiti"
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#9B1B30]/80 via-transparent to-black/20" />
        <div className="absolute bottom-6 left-5 right-5">
          <motion.p 
            key={`text-${heroIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-poppins font-bold text-lg text-white text-shadow leading-tight"
          >
            {heroIndex === 0 ? "Découvrez l'héritage d'Haïti" : heroIndex === 1 ? "La littérature à portée de main" : "Gagnez des étoiles en lisant"}
          </motion.p>
        </div>
        {/* Carousel dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {heroImages.map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${i === heroIndex ? 'bg-[#FAA307] w-4' : 'bg-white/40'}`}
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
          <span className="text-[9px] text-white font-inter mt-0.5">Étoiles</span>
        </motion.div>
      </div>

      {/* Category Pills */}
      <div className="mt-4 px-4">
        <div 
          ref={categoryRef}
          className="flex gap-2 overflow-x-auto no-scrollbar pb-1 scroll-smooth"
        >
          {categories.map(cat => (
            <CategoryPill key={cat.id} {...cat} />
          ))}
        </div>
      </div>

      {/* For You Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-semibold text-base text-[#1A1A2E]">Pour toi</h2>
          <button
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-0.5 text-[#C41E3A] text-xs font-poppins font-medium"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div 
          ref={pourToiRef}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory scroll-smooth"
        >
          {featuredBooks.map(book => (
            <div key={book.id} className="snap-start">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* New Arrivals */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-6 px-4"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-poppins font-semibold text-base text-[#1A1A2E]">Nouveautés</h2>
          <button
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-0.5 text-[#C41E3A] text-xs font-poppins font-medium"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div 
          ref={recentBooksRef}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x snap-mandatory scroll-smooth"
        >
          {recentBooks.map(book => (
            <div key={book.id} className="snap-start">
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </motion.div>

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
                <p className="font-poppins font-bold text-sm text-white">Gagne des Étoiles!</p>
                <p className="text-[10px] text-white/80">Joue et gagne des récompenses</p>
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
                <p className="text-[10px] text-[#6B7280]">{quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'} • {quiz.questions.length} questions</p>
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
