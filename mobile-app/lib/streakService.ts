import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SESSION_KEY = 'biblio_last_session';
const MIN_SESSION_SEC = 30; // minimum 30s pour compter une session

export interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_read_date: string | null;
  streak_start_date: string | null;
  total_reading_days: number;
  total_reading_sec: number;
}

export interface StreakMilestone {
  milestone: number;
  label: string;
  emoji: string;
  stars_bonus: number;
}

export interface SessionResult {
  streak: number;
  longest: number;
  stars_bonus: number;
  milestone: StreakMilestone | null;
}

// ─── Enregistrer une session de lecture ──────────────────────────────────────

export async function recordReadingSession(
  bookId: string,
  durationSec: number,
  pagesRead = 0
): Promise<SessionResult | null> {
  if (durationSec < MIN_SESSION_SEC) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data, error } = await supabase.rpc('record_reading_session', {
      p_user_id:  session.user.id,
      p_book_id:  bookId,
      p_duration: durationSec,
      p_pages:    pagesRead,
    });

    if (error) {
      console.error('Erreur enregistrement session:', error);
      return null;
    }

    await AsyncStorage.setItem(LAST_SESSION_KEY, new Date().toISOString());
    return data as SessionResult;
  } catch (err: unknown) {
    console.error('Erreur enregistrement session:', err);
    return null;
  }
}

// ─── Récupérer le streak d'un utilisateur ────────────────────────────────────

export async function getUserStreak(userId?: string): Promise<UserStreak | null> {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) return null;

  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', uid)
    .single();

  if (error || !data) return null;
  return data as UserStreak;
}

// ─── Classement des meilleurs streaks ────────────────────────────────────────

export interface StreakLeaderEntry {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_reading_days: number;
}

export async function getStreakLeaderboard(limit = 20): Promise<StreakLeaderEntry[]> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select(`
      user_id,
      current_streak,
      longest_streak,
      total_reading_days,
      profiles:user_id (full_name, avatar_url)
    `)
    .order('current_streak', { ascending: false })
    .order('longest_streak', { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((r: any) => ({
    user_id: r.user_id,
    full_name: r.profiles?.full_name ?? null,
    avatar_url: r.profiles?.avatar_url ?? null,
    current_streak: r.current_streak,
    longest_streak: r.longest_streak,
    total_reading_days: r.total_reading_days,
  }));
}

// ─── Milestones disponibles ───────────────────────────────────────────────────

export async function getStreakMilestones(): Promise<StreakMilestone[]> {
  const { data } = await supabase
    .from('streak_milestones')
    .select('*')
    .order('milestone');
  return (data ?? []) as StreakMilestone[];
}

export async function getEarnedMilestones(userId?: string): Promise<number[]> {
  let uid = userId;
  if (!uid) {
    const { data: { session } } = await supabase.auth.getSession();
    uid = session?.user?.id;
  }
  if (!uid) return [];

  const { data } = await supabase
    .from('streak_rewards')
    .select('milestone')
    .eq('user_id', uid);

  return (data ?? []).map((r: any) => r.milestone);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function streakEmoji(streak: number): string {
  if (streak >= 100) return '👑';
  if (streak >= 50)  return '🌟';
  if (streak >= 30)  return '🏆';
  if (streak >= 14)  return '💪';
  if (streak >= 7)   return '⚡';
  if (streak >= 3)   return '🔥';
  if (streak >= 1)   return '📖';
  return '💤';
}

export function streakLabel(streak: number): string {
  if (streak === 0) return 'Pas encore commencé';
  if (streak === 1) return '1 jour';
  return `${streak} jours`;
}

export function formatReadingTime(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export function nextMilestone(current: number): StreakMilestone | null {
  const milestones = [3, 7, 14, 30, 50, 100];
  const labels = ['3 jours', '1 semaine', '2 semaines', '1 mois', '50 jours', '100 jours'];
  const emojis = ['🔥', '⚡', '💪', '🏆', '🌟', '👑'];
  const stars   = [3, 7, 15, 30, 50, 100];

  const idx = milestones.findIndex(m => m > current);
  if (idx === -1) return null;
  return {
    milestone: milestones[idx],
    label: labels[idx],
    emoji: emojis[idx],
    stars_bonus: stars[idx],
  };
}
