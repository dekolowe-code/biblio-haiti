import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function AuthScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegister = location.pathname === '/register'
  const { login, register } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      setLoading(false)
      return
    }

    try {
      let success
      if (isRegister) {
        if (!displayName) {
          setError('Veuillez entrer un nom d\'utilisateur')
          setLoading(false)
          return
        }
        success = await register(email, password, displayName)
      } else {
        success = await login(email, password)
      }

      if (success) {
        navigate('/')
      } else {
        setError('Une erreur est survenue. Réessayez.')
      }
    } catch {
      setError('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#9B1B30] via-[#C41E3A] via-[#E85D04] to-[#FAA307] -z-10" />

      {/* Back Button */}
      <div className="px-4 pt-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </motion.button>
      </div>

      {/* Logo */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="font-poppins font-bold text-2xl text-white text-shadow">Biblio-Haiti</h1>
          <p className="text-sm text-white/80 font-inter mt-1">Ta bibliothèque culturelle</p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-xl"
        >
          <h2 className="font-poppins font-bold text-lg text-[#1A1A2E] text-center mb-4">
            {isRegister ? 'Créer un compte' : 'Se connecter'}
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
              <p className="text-xs text-red-600 font-inter">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {isRegister && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full h-11 pl-10 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter text-[#1A1A2E] placeholder:text-[#6B7280] focus:outline-none focus:border-[#C41E3A] focus:ring-1 focus:ring-[#C41E3A]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4 text-[#6B7280]" /> : <Eye className="w-4 h-4 text-[#6B7280]" />}
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full h-11 gradient-teal rounded-xl text-white font-poppins font-bold text-sm disabled:opacity-50"
            >
              {loading ? 'Chargement...' : isRegister ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}
            </motion.button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-[#6B7280] font-inter">OU</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <button
            onClick={() => navigate(isRegister ? '/login' : '/register')}
            className="w-full text-center text-sm text-[#C41E3A] font-inter font-medium"
          >
            {isRegister ? 'Déjà un compte? Se connecter' : 'Créer un compte'}
          </button>

          {!isRegister && (
            <button className="w-full text-center text-xs text-[#6B7280] font-inter mt-2">
              Mot de passe oublié?
            </button>
          )}
        </motion.div>
      </div>

      {/* Bottom space */}
      <div className="h-8" />
    </div>
  )
}
