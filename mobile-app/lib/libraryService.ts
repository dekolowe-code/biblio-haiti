import { supabase } from './supabase';
import { UserBook } from '@/types';

export async function getUserLibrary(): Promise<UserBook[]> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('user_library')
    .select('*')
    .eq('user_id', user.id);

  if (error) return [];

  return data.map(item => ({
    bookId: item.book_id,
    isUnlocked: item.is_unlocked,
    isFavorite: item.is_favorite,
    currentPage: item.current_page,
    isFinished: item.is_finished,
  }));
}

export async function toggleFavorite(bookId: string, isFavorite: boolean): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return false;

  const { error } = await supabase
    .from('user_library')
    .upsert(
      { user_id: user.id, book_id: bookId, is_favorite: isFavorite },
      { onConflict: 'user_id, book_id' }
    );

  return !error;
}

export async function updateReadingProgress(
  bookId: string,
  page: number | string,
  finished: boolean = false
): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return false;

  const pageToSave = typeof page === 'string' ? 0 : page;

  const { error } = await supabase
    .from('user_library')
    .upsert(
      {
        user_id: user.id,
        book_id: bookId,
        current_page: pageToSave,
        is_finished: finished,
        is_unlocked: true,
      },
      { onConflict: 'user_id, book_id' }
    );

  return !error;
}

export async function unlockBook(bookId: string): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) return false;

  const { error } = await supabase
    .from('user_library')
    .upsert(
      { user_id: user.id, book_id: bookId, is_unlocked: true },
      { onConflict: 'user_id, book_id' }
    );

  return !error;
}
