import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendChatMessage, getLibraryContext, type Message } from '@/lib/aiService'

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [context, setContext] = useState<string>('')

  // Initialiser le contexte
  useEffect(() => {
    getLibraryContext().then(ctx => {
      setContext(ctx)
      setMessages([
        { role: 'assistant', content: 'Bonjour ! Je suis l\'assistant de Biblio-Haiti. Comment puis-je vous aider avec notre catalogue aujourd\'hui ?' }
      ])
    })
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = input.trim()
    setInput('')
    
    // Ajouter le message utilisateur immédiatement
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setIsLoading(true)

    try {
      // Construire la conversation complète avec le contexte "system"
      const conversation: Message[] = [
        { role: 'system', content: context },
        ...newMessages
      ]
      
      const response = await sendChatMessage(conversation)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Oups, une erreur s'est produite." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Bouton Flottant (Positionné en absolu par rapport au MobileShell) */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute bottom-24 right-4 z-[100] w-12 h-12 bg-[#FAA307] rounded-full flex items-center justify-center shadow-lg shadow-[#FAA307]/30 text-white"
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Fenêtre de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-24 right-4 left-4 z-[100] h-[450px] max-h-[60vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#9B1B30] to-[#E85D04] p-3 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle size={18} />
                <span className="font-poppins font-semibold text-sm">Assistant IA</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-[#FFF8F0]">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-[#FAA307] text-white self-end rounded-br-sm shadow-md shadow-[#FAA307]/20' 
                      : 'bg-white border border-gray-100 text-gray-800 self-start rounded-bl-sm shadow-sm'
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="bg-white border border-gray-100 text-gray-800 self-start p-3 rounded-2xl rounded-bl-sm shadow-sm text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAA307]" />
                  <span className="text-gray-500">L'assistant écrit...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-gray-100 shrink-0 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question sur nos livres..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-[#FAA307] focus:ring-1 focus:ring-[#FAA307] transition-all"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full bg-[#FAA307] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
