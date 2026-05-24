import { supabase } from './supabase';

export interface LeaderboardEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  books_completed: number;
  total_stars: number;
  avg_score: number;
  best_score: number;
  total_quizzes: number;
  perfect_scores: number;
  rank?: number;
}

export interface CategoryLeaderEntry {
  category: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  quizzes_in_category: number;
  avg_score: number;
  stars_in_category: number;
  rank: number;
}

export interface QuizScoreEntry {
  id: string;
  book_id: string;
  book_title: string;
  category: string;
  score: number;
  total: number;
  percentage: number;
  stars_earned: number;
  completed_at: string;
}

export interface StarTransaction {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

// ─── Classement global ────────────────────────────────────────────────────────

export async function getGlobalLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_global')
    .select('*')
    .order('total_stars', { ascending: false })
    .order('avg_score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row, i) => ({
    ...row,
    books_completed: Number(row.books_completed),
    total_stars: Number(row.total_stars),
    avg_score: Number(row.avg_score),
    best_score: Number(row.best_score),
    total_quizzes: Number(row.total_quizzes),
    perfect_scores: Number(row.perfect_scores),
    rank: i + 1,
  })) as LeaderboardEntry[];
}

// ─── Classement par catégorie ─────────────────────────────────────────────────

export async function getCategoryLeaderboard(
  category: string,
  limit = 20
): Promise<CategoryLeaderEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_by_category')
    .select('*')
    .eq('category', category)
    .order('avg_score', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as CategoryLeaderEntry[];
}

// ─── Rang d'un utilisateur ────────────────────────────────────────────────────

export async function getUserRank(userId: string): Promise<{
  rank: number | null;
  entry: LeaderboardEntry | null;
}> {
  const board = await getGlobalLeaderboard(200);
  const idx = board.findIndex(e => e.user_id === userId);
  if (idx === -1) return { rank: null, entry: null };
  return { rank: idx + 1, entry: board[idx] };
}

// ─── Sauvegarder un score ─────────────────────────────────────────────────────

export async function saveQuizScore(params: {
  bookId: string;
  bookTitle: string;
  category: string;
  score: number;
  total: number;
}): Promise<{ starsEarned: number; scoreId: string | null }> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return { starsEarned: 0, scoreId: null };

  const { data: scoreRow, error: insertError } = await supabase
    .from('quiz_scores')
    .insert({
      user_id: session.user.id,
      book_id: params.bookId,
      book_title: params.bookTitle,
      category: params.category,
      score: params.score,
      total: params.total,
      stars_earned: 0,
    })
    .select('id')
    .single();

  if (insertError || !scoreRow) {
    console.error('Erreur sauvegarde score:', insertError?.message);
    return { starsEarned: 0, scoreId: null };
  }

  const percentage = (params.score / params.total) * 100;

  // Appeler la fonction Supabase pour attribuer les étoiles
  const { data: starsData, error: starsError } = await supabase
    .rpc('award_quiz_stars', {
      p_user_id: session.user.id,
      p_score_id: scoreRow.id,
      p_percentage: percentage,
    });

  if (starsError) console.error('Erreur attribution étoiles:', starsError.message);

  return {
    starsEarned: starsData ?? 0,
    scoreId: scoreRow.id,
  };
}

// ─── Historique des scores d'un utilisateur ───────────────────────────────────

export async function getUserQuizHistory(userId: string): Promise<QuizScoreEntry[]> {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(30);

  if (error || !data) return [];
  return data as QuizScoreEntry[];
}

// ─── Transactions d'étoiles ───────────────────────────────────────────────────

export async function getStarTransactions(): Promise<StarTransaction[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data, error } = await supabase
    .from('star_transactions')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) return [];
  return data as StarTransaction[];
}

// ─── Catégories disponibles ───────────────────────────────────────────────────

export async function getLeaderboardCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from('quiz_scores')
    .select('category')
    .neq('category', '');

  if (error || !data) return [];
  const unique = [...new Set(data.map(r => r.category))].filter(Boolean);
  return unique.sort();
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function starsLabel(percentage: number): {
  stars: number;
  label: string;
  emoji: string;
} {
  if (percentage === 100) return { stars: 5, label: 'Parfait !', emoji: '🏆' };
  if (percentage >= 80)  return { stars: 3, label: 'Excellent !', emoji: '🌟' };
  if (percentage >= 60)  return { stars: 1, label: 'Bien !', emoji: '⭐' };
  return { stars: 0, label: 'Continuez !', emoji: '📖' };
}

export const REASON_LABELS: Record<string, string> = {
  quiz_perfect: '🏆 Score parfait',
  quiz_good:    '🌟 Très bonne réponse',
  quiz_pass:    '⭐ Quiz réussi',
  quiz_fail:    '📖 Quiz tenté',
  streak:       '🔥 Série de lectures',
};
