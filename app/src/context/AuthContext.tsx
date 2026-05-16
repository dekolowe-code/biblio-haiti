import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  email: string
  displayName: string
  avatarUrl: string
  starsBalance: number
  isAdmin: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, displayName: string) => Promise<boolean>
  logout: () => void
  updateStars: (amount: number, description: string) => Promise<void>
  updateProfile: (updates: Partial<AuthUser>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!)
      } else {
        setIsLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!)
      } else {
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (id: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setUser({
          id,
          email,
          displayName: data.display_name,
          avatarUrl: data.avatar_url,
          starsBalance: data.stars_balance,
          isAdmin: email === 'jeekothebest@gmail.com' || data.is_admin === true,
        })
      } else {
        // Fallback or create profile if it doesn't exist
        setUser({
          id,
          email,
          displayName: email.split('@')[0],
          avatarUrl: '',
          starsBalance: 50,
          isAdmin: email === 'jeekothebest@gmail.com',
        })
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return !error
  }

  const register = async (email: string, password: string, displayName: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { display_name: displayName }
      }
    })
    
    if (error) return false

    if (data.user) {
      // Create profile entry
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
        stars_balance: 100,
      })
      // Add welcome bonus transaction
      await supabase.from('star_transactions').insert({
        user_id: data.user.id,
        amount: 100,
        description: 'Bonus de bienvenue',
        type: 'plus'
      })
    }
    
    return true
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateStars = async (amount: number, description: string) => {
    if (!user) return
    const newBalance = user.starsBalance + amount
    setUser(prev => prev ? { ...prev, starsBalance: newBalance } : null)
    
    // Update in Supabase profiles
    await supabase.from('profiles').update({ stars_balance: newBalance }).eq('id', user.id)
    
    // Log transaction
    await supabase.from('star_transactions').insert({
      user_id: user.id,
      amount: Math.abs(amount),
      description: description,
      type: amount > 0 ? 'plus' : amount < 0 ? 'minus' : 'neutral'
    })
  }

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return false
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          display_name: updates.displayName || user.displayName,
          avatar_url: updates.avatarUrl || user.avatarUrl,
        })
      
      if (error) throw error

      setUser(prev => prev ? { ...prev, ...updates } : null)
      return true
    } catch (err) {
      console.error('Update profile error:', err)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateStars, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
