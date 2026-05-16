import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Upload, Book, Check, AlertCircle, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router'
import { uploadBook } from '@/lib/bookService'
import { countries, categories } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
import QuizUploadForm from '@/components/dashboard/QuizUploadForm'

export default function DashboardScreen() {
  const navigate = useNavigate()
  const { user, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'book' | 'quiz'>('book')

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    country: 'Haïti',
    category: 'Littérature',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 0,
    pages: 0,
    type: 'pdf' as 'text' | 'pdf' | 'epub',
  })

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [manualPages, setManualPages] = useState<string[]>([''])

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      navigate('/')
    }
  }, [user, isLoading, navigate])

  const handleAddPage = () => setManualPages([...manualPages, ''])
  const handleRemovePage = (index: number) => {
    const newPages = [...manualPages]
    newPages.splice(index, 1)
    setManualPages(newPages)
  }
  const handlePageChange = (index: number, value: string) => {
    const newPages = [...manualPages]
    newPages[index] = value
    setManualPages(newPages)
  }

  if (isLoading || !user || !user.isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!formData.title || !formData.author) {
        throw new Error('Veuillez remplir les champs obligatoires')
      }

      const finalData = {
        ...formData,
        content: formData.type === 'text' ? manualPages : [],
        pages: formData.type === 'text' ? manualPages.length : formData.pages
      }

      const { error: uploadError } = await uploadBook(finalData, coverFile || undefined, bookFile || undefined)
      
      if (uploadError) throw uploadError
      
      toast.success('Livre ajouté avec succès !')
      setSuccess(true)
      // Reset form
      setFormData({
        title: '',
        author: '',
        description: '',
        country: 'Haïti',
        category: 'Littérature',
        style: 'Fiction',
        isPremium: false,
        unlockCost: 0,
        pages: 0,
        type: 'pdf',
      })
      setCoverFile(null)
      setBookFile(null)
      setManualPages([''])
    } catch (err: any) {
      const msg = err.message || 'Une erreur est survenue lors de l\'upload'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
        </button>
        <h1 className="font-poppins font-bold text-lg text-[#1A1A2E]">Tableau de Bord</h1>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-base text-[#1A1A2E]">Ajouter du contenu</h2>
              <p className="text-xs text-[#6B7280] font-inter">Envoyez vos ouvrages et quiz sur la plateforme</p>
            </div>
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-6">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold font-inter transition-all ${activeTab === 'book' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Livre
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex-1 py-2 rounded-md text-sm font-semibold font-inter transition-all ${activeTab === 'quiz' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Quiz
            </button>
          </div>

          {activeTab === 'quiz' ? (
            <QuizUploadForm />
          ) : (
            <>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-inter">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-inter">
                  <Check className="w-4 h-4" /> Livre ajouté avec succès!
                </div>
              )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Titre *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Titre du livre"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Auteur *</label>
                <input
                  type="text"
                  required
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                  placeholder="Nom de l'auteur"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 ml-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full h-24 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                placeholder="Brève description de l'ouvrage..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Pays</label>
                <select
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isPremium" className="text-xs font-semibold text-gray-700">Premium</label>
              </div>
              {formData.isPremium && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Coût (Étoiles)</label>
                  <input
                    type="number"
                    value={formData.unlockCost}
                    onChange={e => setFormData({ ...formData, unlockCost: parseInt(e.target.value) })}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 ml-1">Type de contenu</label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                >
                  <option value="pdf">Fichier PDF</option>
                  <option value="epub">Fichier EPUB</option>
                  <option value="text">Écrire une histoire (Texte)</option>
                </select>
              </div>
              {formData.type !== 'text' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 ml-1">Nombre de pages</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={e => setFormData({ ...formData, pages: parseInt(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="Ex: 120"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                {formData.type === 'text' ? 'Contenu de l\'histoire' : 'Fichiers'}
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Couverture (Image)</label>
                  <div className="relative group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => setCoverFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                      {coverFile ? (
                        <p className="text-[10px] text-green-600 font-medium px-2 truncate w-full text-center">{coverFile.name}</p>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-[10px] text-gray-500 mt-1">Choisir la couverture</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {formData.type !== 'text' ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Fichier ({formData.type.toUpperCase()})</label>
                    <div className="relative group">
                      <input
                        type="file"
                        accept={formData.type === 'pdf' ? '.pdf' : '.epub'}
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file) setBookFile(file)
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="h-20 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                        {bookFile ? (
                          <p className="text-[10px] text-blue-600 font-medium px-2 truncate w-full text-center">{bookFile.name}</p>
                        ) : (
                          <>
                            <Book className="w-4 h-4 text-gray-400" />
                            <span className="text-[10px] text-gray-500 mt-1">Choisir le fichier {formData.type.toUpperCase()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {manualPages.map((content, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center px-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Page {idx + 1}</label>
                          {manualPages.length > 1 && (
                            <button 
                              type="button" 
                              onClick={() => handleRemovePage(idx)}
                              className="text-red-500 text-[10px] font-bold"
                            >
                              SUPPRIMER
                            </button>
                          )}
                        </div>
                        <textarea
                          value={content}
                          onChange={e => handlePageChange(idx, e.target.value)}
                          className="w-full h-32 p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-inter focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                          placeholder={`Contenu de la page ${idx + 1}...`}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddPage}
                      className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> AJOUTER UNE PAGE
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full h-12 rounded-xl text-white font-poppins font-bold text-sm mt-6 flex items-center justify-center gap-2 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {loading ? 'Envoi en cours...' : 'Publier le livre'}
            </button>
          </form>
          </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
