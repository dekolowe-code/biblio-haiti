import { supabase } from './supabase'

export interface StarTransaction {
  id: string
  amount: number
  description: string
  type: 'plus' | 'minus' | 'neutral'
  created_at: string
}

export async function getCompletedQuizzes(): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quiz_results')
    .select('quiz_id')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching quiz results:', error)
    return []
  }

  return data.map(row => row.quiz_id)
}

export async function saveQuizResult(quizId: string, starsEarned: number): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Check if already completed
  const { data: existing } = await supabase
    .from('quiz_results')
    .select('id')
    .eq('user_id', user.id)
    .eq('quiz_id', quizId)
    .single()

  if (existing) {
    // Already completed, don't award stars again
    return false
  }

  const { error } = await supabase
    .from('quiz_results')
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      stars_earned: starsEarned
    })

  if (error) {
    console.error('Error saving quiz result:', error)
    return false
  }
  return true
}

export async function getStarHistory(): Promise<StarTransaction[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('star_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching star history:', error)
    return []
  }

  return data
}
