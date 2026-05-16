import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getUserLibrary, toggleFavorite as dbToggleFavorite, unlockBook as dbUnlockBook, updateReadingProgress as dbUpdateProgress } from '@/lib/libraryService'
import { type UserBook } from '@/data/mockData'
import { toast } from 'sonner'

interface LibraryContextType {
  library: UserBook[]
  isLoading: boolean
  isFavorite: (bookId: string) => boolean
  isUnlocked: (bookId: string) => boolean
  getReadingProgress: (bookId: string) => number
  toggleFavorite: (bookId: string) => Promise<void>
  unlockBook: (bookId: string, cost: number, title?: string) => Promise<boolean>
  updateProgress: (bookId: string, page: number, finished?: boolean) => Promise<void>
  refreshLibrary: () => Promise<void>
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined)

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { user, updateStars } = useAuth()
  const [library, setLibrary] = useState<UserBook[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshLibrary = async () => {
    if (!user) {
      setLibrary([])
      setIsLoading(false)
      return
    }
    const data = await getUserLibrary()
    setLibrary(data)
    setIsLoading(false)
  }

  useEffect(() => {
    refreshLibrary()
  }, [user])

  const isFavorite = (bookId: string) => library.find(ub => ub.bookId === bookId)?.isFavorite || false
  const isUnlocked = (bookId: string) => library.find(ub => ub.bookId === bookId)?.isUnlocked || false
  const getReadingProgress = (bookId: string) => library.find(ub => ub.bookId === bookId)?.currentPage || 0

  const toggleFavorite = async (bookId: string) => {
    if (!user) return
    const entry = library.find(ub => ub.bookId === bookId)
    const newStatus = !entry?.isFavorite
    
    // Optimistic update
    setLibrary(prev => {
      const existing = prev.find(ub => ub.bookId === bookId)
      if (existing) {
        return prev.map(ub => ub.bookId === bookId ? { ...ub, isFavorite: newStatus } : ub)
      }
      return [...prev, { bookId, isFavorite: newStatus, isUnlocked: false, currentPage: 0, isFinished: false }]
    })

    const success = await dbToggleFavorite(bookId, newStatus)
    if (!success) {
      toast.error('Erreur lors de la mise à jour des favoris')
      refreshLibrary() // Rollback
    }
  }

  const unlockBook = async (bookId: string, cost: number, title: string = '') => {
    if (!user || user.starsBalance < cost) return false
    
    // Deduct stars
    await updateStars(-cost, `Livre débloqué: ${title || bookId}`)

    const success = await dbUnlockBook(bookId)
    if (success) {
      setLibrary(prev => {
        const existing = prev.find(ub => ub.bookId === bookId)
        if (existing) {
          return prev.map(ub => ub.bookId === bookId ? { ...ub, isUnlocked: true } : ub)
        }
        return [...prev, { bookId, isUnlocked: true, isFavorite: false, currentPage: 0, isFinished: false }]
      })
    }
    return success
  }

  const updateProgress = async (bookId: string, page: number, finished: boolean = false) => {
    if (!user) return
    
    // Optimistic update
    setLibrary(prev => {
      const existing = prev.find(ub => ub.bookId === bookId)
      if (existing) {
        return prev.map(ub => ub.bookId === bookId ? { ...ub, currentPage: page, isFinished: finished } : ub)
      }
      // If it's a new book being read, add it to the library (assume unlocked for free books)
      return [...prev, { bookId, isUnlocked: true, isFavorite: false, currentPage: page, isFinished: finished }]
    })
    
    await dbUpdateProgress(bookId, page, finished)
  }

  return (
    <LibraryContext.Provider value={{ 
      library, 
      isLoading, 
      isFavorite, 
      isUnlocked, 
      getReadingProgress, 
      toggleFavorite, 
      unlockBook, 
      updateProgress,
      refreshLibrary 
    }}>
      {children}
    </LibraryContext.Provider>
  )
}

export function useLibrary() {
  const context = useContext(LibraryContext)
  if (!context) throw new Error('useLibrary must be used within LibraryProvider')
  return context
}
