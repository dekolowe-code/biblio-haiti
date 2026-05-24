import { create } from 'zustand';
import { Book } from '@/types';

interface BookState {
  books: Book[];
  featuredBooks: Book[];
  loading: boolean;
  setBooks: (books: Book[]) => void;
  setFeaturedBooks: (books: Book[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useBookStore = create<BookState>((set) => ({
  books: [],
  featuredBooks: [],
  loading: false,
  setBooks: (books) => set({ books }),
  setFeaturedBooks: (books) => set({ featuredBooks: books }),
  setLoading: (loading) => set({ loading }),
}));
