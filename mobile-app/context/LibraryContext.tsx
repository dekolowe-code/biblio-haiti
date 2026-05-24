import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUserLibrary, toggleFavorite, updateReadingProgress, unlockBook } from '@/lib/libraryService';
import { UserBook } from '@/types';
import { useAuth } from './AuthContext';

interface LibraryContextType {
  library: UserBook[];
  loading: boolean;
  refresh: () => Promise<void>;
  isFavorite: (bookId: string) => boolean;
  isUnlocked: (bookId: string) => boolean;
  isFinished: (bookId: string) => boolean;
  getProgress: (bookId: string) => number;
  toggleBookFavorite: (bookId: string) => Promise<void>;
  unlockUserBook: (bookId: string) => Promise<void>;
  updateProgress: (bookId: string, page: number | string, finished?: boolean) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType>({
  library: [],
  loading: false,
  refresh: async () => {},
  isFavorite: () => false,
  isUnlocked: () => false,
  isFinished: () => false,
  getProgress: () => 0,
  toggleBookFavorite: async () => {},
  unlockUserBook: async () => {},
  updateProgress: async () => {},
});

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [library, setLibrary] = useState<UserBook[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!session) { setLibrary([]); return; }
    setLoading(true);
    const data = await getUserLibrary();
    setLibrary(data);
    setLoading(false);
  }, [session]);

  useEffect(() => { refresh(); }, [refresh]);

  function isFavorite(bookId: string) {
    return library.find(b => b.bookId === bookId)?.isFavorite ?? false;
  }
  function isUnlocked(bookId: string) {
    return library.find(b => b.bookId === bookId)?.isUnlocked ?? false;
  }
  function isFinished(bookId: string) {
    return library.find(b => b.bookId === bookId)?.isFinished ?? false;
  }
  function getProgress(bookId: string) {
    return library.find(b => b.bookId === bookId)?.currentPage ?? 0;
  }

  async function toggleBookFavorite(bookId: string) {
    const current = isFavorite(bookId);
    setLibrary(prev =>
      prev.map(b => b.bookId === bookId ? { ...b, isFavorite: !current } : b)
    );
    await toggleFavorite(bookId, !current);
  }

  async function unlockUserBook(bookId: string) {
    await unlockBook(bookId);
    setLibrary(prev =>
      prev.map(b => b.bookId === bookId ? { ...b, isUnlocked: true } : b)
    );
  }

  async function updateProgress(bookId: string, page: number | string, finished = false) {
    const pageNum = typeof page === 'number' ? page : 0;
    setLibrary(prev =>
      prev.map(b => b.bookId === bookId ? { ...b, currentPage: pageNum, isFinished: finished } : b)
    );
    await updateReadingProgress(bookId, page, finished);
  }

  return (
    <LibraryContext.Provider value={{
      library, loading, refresh,
      isFavorite, isUnlocked, isFinished, getProgress,
      toggleBookFavorite, unlockUserBook, updateProgress,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  return useContext(LibraryContext);
}
