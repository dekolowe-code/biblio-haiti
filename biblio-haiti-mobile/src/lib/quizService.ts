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

const QUIZ_PAGE_SIZE = 10

export async function getPaginatedQuizzes(page: number = 0): Promise<{
  data: Quiz[]
  hasMore: boolean
  total: number
}> {
  const { data, error, count } = await supabase
    .from('quizzes')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * QUIZ_PAGE_SIZE, (page + 1) * QUIZ_PAGE_SIZE - 1)

  if (error) {
    console.error('Error fetching paginated quizzes:', error)
    return { data: [], hasMore: false, total: 0 }
  }

  const mapped = (data || []).map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty as 'easy' | 'medium' | 'hard',
    starReward: row.star_reward,
    questions: row.questions as QuizQuestion[]
  }))

  const total = count || 0
  return {
    data: mapped,
    hasMore: (page + 1) * QUIZ_PAGE_SIZE < total,
    total,
  }
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
