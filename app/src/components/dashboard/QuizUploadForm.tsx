import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadQuiz, type QuizQuestion } from '@/lib/quizService'

export default function QuizUploadForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    category: 'Histoire',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    starReward: 10,
  })

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { text: '', options: ['', '', '', ''], correctIndex: 0 }
  ])

  const [jsonInput, setJsonInput] = useState('')
  const [uploadMode, setUploadMode] = useState<'manual' | 'json'>('manual')

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], correctIndex: 0 }])
  }

  const handleRemoveQuestion = (index: number) => {
    const newQ = [...questions]
    newQ.splice(index, 1)
    setQuestions(newQ)
  }

  const handleQuestionChange = (index: number, field: string, value: string | number) => {
    const newQ = [...questions]
    if (field === 'text') newQ[index].text = value as string
    if (field === 'correctIndex') newQ[index].correctIndex = value as number
    setQuestions(newQ)
  }

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQ = [...questions]
    newQ[qIndex].options[optIndex] = value
    setQuestions(newQ)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!formData.title || !formData.category) {
        throw new Error('Titre et catégorie sont obligatoires')
      }

      let finalQuestions = questions
      if (uploadMode === 'json') {
        try {
          finalQuestions = JSON.parse(jsonInput)
          if (!Array.isArray(finalQuestions) || finalQuestions.length === 0) {
            throw new Error('Le JSON doit être un tableau non vide')
          }
        } catch (e) {
          throw new Error('Format JSON invalide')
        }
      } else {
        // Validate manual questions
        for (const q of questions) {
          if (!q.text) throw new Error('Toutes les questions doivent avoir un texte')
          if (q.options.some(opt => !opt)) throw new Error('Toutes les options doivent être remplies')
        }
      }

      const { error: uploadError } = await uploadQuiz({
        ...formData,
        questions: finalQuestions
      })

      if (uploadError) throw uploadError

      toast.success('Quiz ajouté avec succès !')
      setSuccess(true)
      
      // Reset
      setFormData({ ...formData, title: '' })
      setQuestions([{ text: '', options: ['', '', '', ''], correctIndex: 0 }])
      setJsonInput('')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'upload')
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-inter">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-100 text-green-600 p-3 rounded-xl flex items-center gap-2 mb-4 text-xs font-inter">
          <Check className="w-4 h-4" /> Quiz ajouté avec succès!
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 ml-1">Titre *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-inter focus:ring-1 focus:ring-blue-600 outline-none"
            placeholder="Ex: L'Indépendance"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 ml-1">Catégorie</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-inter focus:ring-1 focus:ring-blue-600 outline-none"
            placeholder="Ex: Histoire"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 ml-1">Difficulté</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-inter focus:ring-1 focus:ring-blue-600 outline-none"
          >
            <option value="easy">Facile</option>
            <option value="medium">Moyen</option>
            <option value="hard">Difficile</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700 ml-1">Récompense (Étoiles)</label>
          <input
            type="number"
            min="0"
            value={formData.starReward}
            onChange={e => setFormData({ ...formData, starReward: parseInt(e.target.value) || 0 })}
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-inter focus:ring-1 focus:ring-blue-600 outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mt-6">
        <button
          type="button"
          onClick={() => setUploadMode('manual')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold font-inter transition-all ${uploadMode === 'manual' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          Saisie Manuelle
        </button>
        <button
          type="button"
          onClick={() => setUploadMode('json')}
          className={`flex-1 py-2 rounded-md text-xs font-semibold font-inter transition-all ${uploadMode === 'json' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
        >
          Format JSON
        </button>
      </div>

      {uploadMode === 'manual' ? (
        <div className="space-y-6 mt-4">
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
              {questions.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => handleRemoveQuestion(qIndex)}
                  className="absolute top-2 right-2 p-1.5 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <h4 className="font-poppins font-semibold text-sm mb-3">Question {qIndex + 1}</h4>
              
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Texte de la question..."
                  value={q.text}
                  onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)}
                  className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm"
                />
                
                <div className="grid grid-cols-1 gap-2 pl-4">
                  {q.options.map((opt, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name={`correct-${qIndex}`}
                        checked={q.correctIndex === optIndex}
                        onChange={() => handleQuestionChange(qIndex, 'correctIndex', optIndex)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                        value={opt}
                        onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                        className={`flex-1 h-9 px-3 border rounded-lg text-sm ${q.correctIndex === optIndex ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={handleAddQuestion}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-inter font-semibold text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Plus className="w-4 h-4" /> Ajouter une question
          </button>
        </div>
      ) : (
        <div className="space-y-1 mt-4">
          <label className="text-xs font-semibold text-gray-700 ml-1">Coller le JSON complet *</label>
          <textarea
            required
            value={jsonInput}
            onChange={e => setJsonInput(e.target.value)}
            className="w-full h-64 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono focus:ring-1 focus:ring-blue-600 outline-none"
            placeholder="[{&quot;text&quot;: &quot;...&quot;, &quot;options&quot;: [&quot;A&quot;, &quot;B&quot;], &quot;correctIndex&quot;: 0}]"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`w-full h-12 rounded-xl text-white font-poppins font-bold text-sm mt-6 flex items-center justify-center gap-2 ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
      >
        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Envoi en cours...</> : 'Publier le Quiz'}
      </button>
    </form>
  )
}
