import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Star, Trophy, Heart, Settings, HelpCircle, Info, LogOut, ChevronRight, User, History, X, Check, ExternalLink, MessageCircle } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useLibrary } from '@/context/LibraryContext'
import { clearAllData } from '@/data/mockData'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm"
        />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl p-6"
          style={{ maxWidth: 430, margin: '0 auto' }}
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-poppins font-bold text-lg text-[#1A1A2E]">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          {children}
        </motion.div>
      </>
    )}
  </AnimatePresence>
)

export default function ProfileScreen() {
  const navigate = useNavigate()
  const { user, logout, updateProfile, isLoading } = useAuth()
  const { library, isLoading: isLibLoading } = useLibrary()
  const stars = user?.starsBalance || 0
  const libraryCount = library.filter(ub => ub.isFinished).length
  const quizCount = 0 // Quiz results not yet synced to Supabase
  const favCount = library.filter(ub => ub.isFavorite).length

  // Modals state
  const [activeModal, setActiveModal] = useState<'account' | 'history' | 'about' | null>(null)
  const [editName, setEditName] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setEditName(user.displayName)
    }
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview)
    }
  }, [user, avatarPreview])

  const handleLogout = () => {
    logout()
    toast.info('Déconnecté')
    navigate('/')
  }

  const handleReset = () => {
    if (window.confirm('Voulez-vous vraiment réinitialiser toutes vos données?')) {
      clearAllData()
      window.location.reload()
    }
  }

  const handleSupport = () => {
    window.open('https://wa.me/50933970083', '_blank')
  }

  const handleSaveAccount = async () => {
    setIsSaving(true)
    setUploadStatus('Préparation...')
    let avatarUrl = user?.avatarUrl || ''

    try {
      if (avatarFile) {
        if (avatarFile.size > 5 * 1024 * 1024) {
          throw new Error('Image trop lourde (max 5Mo)')
        }
        setUploadStatus('Envoi de l\'image...')
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user?.id}_${Math.random()}.${fileExt}`
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)
        avatarUrl = publicUrl
      }

      setUploadStatus('Finalisation...')
      const success = await updateProfile({ displayName: editName, avatarUrl })
      if (success) {
        toast.success('Profil mis à jour !')
        setActiveModal(null)
        setAvatarFile(null)
        setAvatarPreview(null)
      } else {
        toast.error('Erreur lors de la mise à jour du profil')
      }
    } catch (err: any) {
      console.error('Upload error:', err)
      toast.error(`Erreur: ${err.message || 'Problème lors de l\'enregistrement'}`)
    } finally {
      setIsSaving(false)
      setUploadStatus('')
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center py-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-10 h-10 border-4 border-[#C41E3A] border-t-transparent rounded-full mb-4"
        />
        <p className="text-sm text-[#6B7280] font-inter">Vérification de la session...</p>
      </div>
    )
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
          className="w-full mt-6 py-3 gradient-golden rounded-xl text-white font-poppins font-bold text-sm shadow-md"
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
    { icon: User, label: 'Mon Compte', action: () => setActiveModal('account') },
    { icon: History, label: 'Historique des Étoiles', action: () => setActiveModal('history') },
    ...(user.isAdmin ? [{ icon: Settings, label: 'Tableau de Bord Admin', action: () => navigate('/dashboard') }] : []),
    { icon: MessageCircle, label: 'Aide & Support (WhatsApp)', action: handleSupport, isExternal: true },
    { icon: Info, label: 'À Propos', action: () => setActiveModal('about') },
  ]

  return (
    <div className="min-h-full pb-4">
      {/* User Info Card */}
      <div className="px-4 pt-4">
        <div className="gradient-top rounded-2xl p-5 flex items-center gap-4 shadow-lg shadow-red-900/10">
          <div className="w-16 h-16 rounded-full border-[3px] border-white overflow-hidden flex-shrink-0 bg-white/20 flex items-center justify-center">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-poppins font-bold text-lg text-white">{user.displayName}</h2>
            <p className="text-xs text-white/80 font-inter truncate">{user.email}</p>
            <button 
              onClick={() => setActiveModal('account')}
              className="text-xs text-white bg-white/20 px-2 py-0.5 rounded mt-2 hover:bg-white/30 transition-colors"
            >
              Modifier le profil
            </button>
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
              className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex flex-col items-center"
            >
              <stat.icon className="w-5 h-5 mb-1" style={{ color: stat.color }} />
              <span className="font-poppins font-bold text-lg text-[#1A1A2E]">{stat.value}</span>
              <span className="text-[9px] text-[#6B7280] font-inter uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              whileTap={{ scale: 0.98 }}
              onClick={item.action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors ${i < menuItems.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <item.icon className="w-4 h-4 text-[#6B7280]" />
              </div>
              <span className="flex-1 text-sm font-inter text-[#1A1A2E]">{item.label}</span>
              {item.isExternal ? <ExternalLink className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b border-gray-100 active:bg-red-50 transition-colors"
          >
            <div className="w-9 h-9 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <LogOut className="w-4 h-4 text-[#C41E3A]" />
            </div>
            <span className="flex-1 text-sm font-inter text-[#C41E3A] font-medium">Se déconnecter</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
          >
            <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <History className="w-4 h-4 text-gray-400" />
            </div>
            <span className="flex-1 text-sm font-inter text-gray-500">Réinitialiser les données locales</span>
          </motion.button>
        </div>
      </div>

      {/* App Version */}
      <div className="text-center mt-8 pb-4">
        <p className="text-[10px] text-[#6B7280] font-inter uppercase tracking-[2px]">Biblio-Haiti v1.0.0</p>
      </div>

      {/* MODALS */}
      
      {/* Account Modal */}
      <Modal isOpen={activeModal === 'account'} onClose={() => setActiveModal(null)} title="Modifier mon Profil">
        <div className="space-y-4 pb-6">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                {avatarPreview || user.avatarUrl ? (
                  <img src={avatarPreview || user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-[#C41E3A] text-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-red-700 transition-colors">
                <Settings className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Nom d'affichage</label>
            <input 
              type="text" 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-[#C41E3A] outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 ml-1">Email (Non modifiable)</label>
            <input 
              type="text" 
              value={user.email} 
              disabled
              className="w-full h-12 px-4 bg-gray-100 border border-gray-200 rounded-xl text-sm font-inter text-gray-500"
            />
          </div>
          <button 
            onClick={handleSaveAccount}
            disabled={isSaving}
            className="w-full h-12 bg-[#1A1A2E] text-white rounded-xl font-poppins font-bold text-sm mt-4 flex items-center justify-center gap-2"
          >
            {isSaving ? 'Enregistrement...' : <><Check className="w-4 h-4" /> Enregistrer les modifications</>}
          </button>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal isOpen={activeModal === 'history'} onClose={() => setActiveModal(null)} title="Historique des Étoiles">
        <div className="space-y-3 pb-6 max-h-[60vh] overflow-y-auto">
          {[
            { label: 'Bonus de bienvenue', stars: 50, date: 'Aujourd\'hui', type: 'plus' },
            { label: 'Quiz complété: Histoire', stars: 25, date: 'Hier', type: 'plus' },
            { label: 'Livre débloqué: La Danse', stars: 0, date: 'Hier', type: 'neutral' },
            ... (quizCount > 0 ? [{ label: 'Récompense Quiz', stars: 15, date: 'Récemment', type: 'plus' }] : [])
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-poppins font-semibold text-[#1A1A2E]">{item.label}</p>
                <p className="text-[10px] text-gray-400 font-inter">{item.date}</p>
              </div>
              <div className={`flex items-center gap-1 font-poppins font-bold text-sm ${item.type === 'plus' ? 'text-green-500' : 'text-gray-400'}`}>
                {item.type === 'plus' ? '+' : ''}{item.stars} <Star className="w-3 h-3 fill-current" />
              </div>
            </div>
          ))}
          {quizCount === 0 && (
            <p className="text-center text-xs text-gray-400 font-inter py-4">Joue à des quiz pour gagner plus d'étoiles !</p>
          )}
        </div>
      </Modal>

      {/* About Modal */}
      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title="À Propos de Biblio-Haiti">
        <div className="space-y-4 pb-6">
          <div className="flex justify-center mb-2">
            <img src="/logo.png" alt="Biblio-Haiti" className="h-16 w-auto" onError={(e) => e.currentTarget.style.display='none'} />
          </div>
          <p className="text-sm text-gray-600 font-inter leading-relaxed text-center">
            Biblio-Haiti est une plateforme de lecture numérique dédiée à la promotion de la culture et de la littérature haïtienne. 
          </p>
          <div className="bg-gray-50 p-4 rounded-xl space-y-2">
            <p className="text-xs text-gray-500 font-inter"><strong>Version:</strong> 1.0.0 (Bêta)</p>
            <p className="text-xs text-gray-500 font-inter"><strong>Développeur:</strong> Equipe Biblio-Haiti</p>
            <p className="text-xs text-gray-500 font-inter"><strong>Contact:</strong> contact@bibliohaiti.ht</p>
          </div>
          <p className="text-xs text-[#C41E3A] font-inter text-center italic">
            "Rendre le savoir accessible à tous les enfants d'Haïti."
          </p>
        </div>
      </Modal>
    </div>
  )
}
