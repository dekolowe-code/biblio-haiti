export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverUrl: string;
  country: string;
  category: string;
  style: string;
  isPremium: boolean;
  unlockCost: number;
  rating: number;
  totalRatings: number;
  pages: number;
  content: string[];
  type: 'text' | 'pdf' | 'epub';
  pdfUrl?: string;
  epubUrl?: string;
}

export interface UserBook {
  bookId: string;
  isUnlocked: boolean;
  isFavorite: boolean;
  currentPage: number;
  isFinished: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  starsBalance: number;
  created_at: string;
}

export interface QuizQuestion {
  id?: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  starReward: number;
  questions: QuizQuestion[];
}

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ReadingPosition {
  cfi?: string;
  page?: number;
  percent: number;
}

export type Theme = 'light' | 'dark' | 'system';
