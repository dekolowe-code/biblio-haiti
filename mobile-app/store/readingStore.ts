import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReadingPosition } from '@/types';

interface ReadingState {
  positions: Record<string, ReadingPosition>;
  fontSize: number;
  fontFamily: 'serif' | 'sans-serif' | 'mono';
  lineHeight: number;
  theme: 'day' | 'sepia' | 'night';
  setPosition: (bookId: string, pos: ReadingPosition) => void;
  setFontSize: (size: number) => void;
  setFontFamily: (font: 'serif' | 'sans-serif' | 'mono') => void;
  setLineHeight: (height: number) => void;
  setReaderTheme: (theme: 'day' | 'sepia' | 'night') => void;
}

export const useReadingStore = create<ReadingState>()(
  persist(
    (set) => ({
      positions: {},
      fontSize: 16,
      fontFamily: 'serif',
      lineHeight: 1.6,
      theme: 'day',
      setPosition: (bookId, pos) =>
        set(s => ({ positions: { ...s.positions, [bookId]: pos } })),
      setFontSize: (fontSize) => set({ fontSize }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setLineHeight: (lineHeight) => set({ lineHeight }),
      setReaderTheme: (theme) => set({ theme }),
    }),
    {
      name: 'reading-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
