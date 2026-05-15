import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { BookOpen, Star, Trophy, Heart, Settings, HelpCircle, Info, LogOut, ChevronRight, User, History } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { getStoredStars, getStoredLibrary, getQuizResults, clearAllData } from '@/data/mockData'

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stars, setStars] = useState(getStoredStars())
  const [libraryCount, setLibraryCount] = useState(0)
  const [quizCount, setQuizCount] = useState(0)
  const [favCount, setFavCount] = useState(0)

  useEffect(() => {
    const lib = getStoredLibrary()
    setLibraryCount(lib.filter(ub => ub.isFinished).length)
    setFavCount(lib.filter(ub => ub.isFavorite).length)
    setQuizCount(getQuizResults().length)
    const interval = setInterval(() => setStars(getStoredStars()), 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes vos données?')) {
      clearAllData()
      window.location.reload()
    }
  }

  if (!user) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-20">
        <div className="w-20 h-20 bg-gradient-to-br from-[#C41E3A] to-[#E85D04] rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-white" />
        </div>
        <h2 className="font-poppins font-bold text-xl text-[#1A1A2E] text-center">Bienvenue sur Biblio-Haiti</h2>
        <p className="text-sm text-[#6B7280] font-inter text-center mt-2">
          Connecte-toi pour accéder à ta bibliothèque et gagner des étoiles
        </p>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/login')}
          className="w-full mt-6 py-3 gradient-golden rounded-xl text-white font-poppins font-bold text-sm"
        >
          Se connecter
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/register')}
          className="w-full mt-3 py-3 border-2 border-[#C41E3A] rounded-xl text-[#C41E3A] font-poppins font-semibold text-sm"
        >
          Créer un compte
        </motion.button>
      </div>
    )
  }

  const stats = [
    { icon: BookOpen, value: libraryCount, label: 'Livres lus', color: '#2EC4B6' },
    { icon: Star, value: stars, label: 'Étoiles', color: '#FAA307' },
    { icon: Trophy, value: quizCount, label: 'Quiz', color: '#E85D04' },
    { icon: Heart, value: favCount, label: 'Favoris', color: '#9D4EDD' },
  ]

  const menuItems = [
    { icon: User, label: 'Mon Compte', action: () => {} },
    { icon: History, label: 'Historique des Étoiles', action: () => {} },
    { icon: Settings, label: 'Paramètres', action: () => {} },
    { icon: HelpCircle, label: 'Aide & Support', action: () => {} },
    { icon: Info, label: 'À Propos', action: () => {} },
  ]

  return (
    <div className="min-h-full pb-4">
      {/* User Info Card */}
      <div className="px-4 pt-4">
        <div className="gradient-top rounded-2xl p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden flex-shrink-0">
            <img src={user.avatarUrl || '/avatar-default.jpg'} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-poppins font-bold text-lg text-white">{user.displayName}</h2>
            <p className="text-xs text-white/80 font-inter truncate">{user.email}</p>
            <button className="text-xs text-white underline font-inter mt-1">Modifier</button>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              whileTap={{ scale: 0.98 }}
              className="bg-white rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex flex-col items-center"
            >
              <stat.icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
              <span className="font-poppins font-bold text-lg text-[#1A1A2E]">{stat.value}</span>
              <span className="text-[9px] text-[#6B7280] font-inter">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-[#6B7280]" />
              </div>
              <span className="flex-1 text-sm font-inter text-[#1A1A2E]">{item.label}</span>
              <ChevronRight className="w-4 h-4 text-[#6B7280]" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-100"
          >
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-[#C41E3A]" />
            </div>
            <span className="flex-1 text-sm font-inter text-[#C41E3A]">Se déconnecter</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
          >
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-red-600" />
            </div>
            <span className="flex-1 text-sm font-inter text-red-600">Réinitialiser les données</span>
          </motion.button>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center mt-6 pb-4">
        <p className="text-[10px] text-[#6B7280] font-inter">Biblio-Haiti v1.0.0</p>
      </div>
    </div>
  )
}
