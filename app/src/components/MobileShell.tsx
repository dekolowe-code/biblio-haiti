import { useLocation, useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Search, Bookmark, User, BookOpen, Star, SearchIcon } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import ChatWidget from '@/components/chat/ChatWidget'

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
  const stars = user?.starsBalance || 0

  const isAuthScreen = location.pathname === '/login' || location.pathname === '/register'
  const isReadingScreen = location.pathname.includes('/read')

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
        <div className="gradient-top px-4 py-2 flex items-center justify-between shrink-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-poppins font-bold text-lg text-white text-shadow">Biblio-Haiti</h1>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => navigate('/profil')}
                className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full px-2 py-0.5 border border-white/20"
              >
                <Star className="w-3 h-3 text-[#FAA307] fill-[#FAA307]" />
                <span className="text-white font-poppins font-bold text-[10px]">{stars}</span>
              </motion.button>
            )}
            <button onClick={() => navigate('/catalogue')} className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full">
              <SearchIcon className="w-4 h-4 text-white" />
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

        <ChatWidget />

        {/* Bottom Navigation */}
        <div className="px-4 pb-4 shrink-0">
          <nav className="gradient-nav h-14 rounded-2xl flex items-center justify-around relative z-50 shadow-lg">
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.path}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(tab.path)}
                  className="flex flex-col items-center justify-center gap-0.5 w-16 h-full relative"
                >
                  <Icon
                    className={`w-4.5 h-4.5 transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}
                    strokeWidth={isActive ? 2.5 : 1.5}
                  />
                  <span className={`text-[9px] font-inter font-medium transition-colors ${isActive ? 'text-white' : 'text-white/60'}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -bottom-1 w-1 h-1 bg-white rounded-full"
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>
    </div>
  )
}
