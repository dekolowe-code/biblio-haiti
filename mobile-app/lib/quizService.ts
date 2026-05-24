import { supabase } from './supabase';
import { Quiz } from '@/types';

export async function getQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return [];

  return data.map(row => ({
    id: row.id,
    title: row.title,
    category: row.category,
    difficulty: row.difficulty,
    starReward: row.star_reward,
    questions: row.questions,
  }));
}

export async function saveQuizResult(
  quizId: string,
  score: number,
  total: number
): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return false;

  const { error } = await supabase.from('quiz_results').insert({
    user_id: user.id,
    quiz_id: quizId,
    score,
    total,
    completed_at: new Date().toISOString(),
  });

  return !error;
}
