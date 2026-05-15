import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { getStoredUser, setStoredUser, getStoredStars } from '@/data/mockData'

interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  starsBalance: number
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => void
  updateStars: (amount: number) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser({
        ...stored,
        starsBalance: getStoredStars(),
      })
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in production, use Supabase auth
    if (email && password.length >= 6) {
      const stored = getStoredUser()
      if (stored && stored.email === email) {
        setUser({ ...stored, starsBalance: getStoredStars() })
        return true
      }
      // Auto-create for demo
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        avatarUrl: '/avatar-default.jpg',
        starsBalance: getStoredStars(),
      }
      setStoredUser(newUser)
      setUser(newUser)
      return true
    }
    return false
  }

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    if (email && password.length >= 6 && displayName) {
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        displayName,
        avatarUrl: '/avatar-default.jpg',
        starsBalance: 100, // Welcome bonus
      }
      setStoredUser(newUser)
      setUser(newUser)
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('bibliohaiti_user')
  }

  const updateStars = (amount: number) => {
    setUser(prev => prev ? { ...prev, starsBalance: prev.starsBalance + amount } : null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateStars }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
