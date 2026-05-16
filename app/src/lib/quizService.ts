import { supabase } from './supabase'

export interface QuizQuestion {
  text: string
  options: string[]
  correctIndex: number
}

export interface Quiz {
  id: string
  title: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
  starReward: number
  questions: QuizQuestion[]
}

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching quizzes:', error)
    return []
  }

  return data.map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    starReward: row.star_reward,
    questions: row.questions as QuizQuestion[]
  }))
}

export async function uploadQuiz(quizData: Omit<Quiz, 'id'>): Promise<{ error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: new Error('User not authenticated') }
  }

  const { error } = await supabase
    .from('quizzes')
    .insert({
      title: quizData.title,
      category: quizData.category,
      difficulty: quizData.difficulty,
      star_reward: quizData.starReward,
      questions: quizData.questions
    })

  return { error }
}
