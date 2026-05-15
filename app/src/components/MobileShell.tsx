import { useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Bookmark, User, BookOpen, Star, SearchIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getStoredStars } from '@/data/mockData'
import { useEffect, useState } from 'react'

const tabs = [
  { path: '/', label: 'Accueil', icon: Home },
  { path: '/catalogue', label: 'Catalogue', icon: Search },
  { path: '/bibliotheque', label: 'Ma Bib', icon: Bookmark },
  { path: '/profil', label: 'Profil', icon: User },
]

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stars, setStars] = useState(getStoredStars())

  const isAuthScreen = location.pathname === '/login' || location.pathname === '/register'
  const isReadingScreen = location.pathname.includes('/read')

  useEffect(() => {
    const interval = setInterval(() => {
      setStars(getStoredStars())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  if (isAuthScreen || isReadingScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#9B1B30] via-[#C41E3A] via-[#E85D04] to-[#FAA307] flex justify-center">
        <div className="w-full max-w-[430px] min-h-screen bg-[#FFF8F0] relative overflow-hidden">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#9B1B30] via-[#C41E3A] via-[#E85D04] to-[#FAA307] flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen bg-[#FFF8F0] relative overflow-hidden flex flex-col">
        {/* Top Navigation */}
        <div className="gradient-top px-4 pt-3 pb-3 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-poppins font-bold text-xl text-white text-shadow">Biblio-Haiti</h1>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/profil')}
                className="flex items-center gap-1 bg-gradient-to-br from-[#FAA307] to-[#E85D04] rounded-full px-2.5 py-1 border-2 border-white/80"
              >
                <Star className="w-3.5 h-3.5 text-white fill-white" />
                <span className="text-white font-poppins font-bold text-xs">{stars}</span>
              </motion.button>
            )}
            <button onClick={() => navigate('/catalogue')} className="w-8 h-8 flex items-center justify-center">
              <SearchIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <nav className="gradient-nav shrink-0 h-16 rounded-t-3xl flex items-center justify-around relative z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.path}
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate(tab.path)}
                className="flex flex-col items-center justify-center gap-0.5 w-16 h-14 relative"
              >
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={`text-[10px] font-inter font-medium transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-[#FAA307] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
