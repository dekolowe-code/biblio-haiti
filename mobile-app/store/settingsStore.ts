import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  readingReminderEnabled: boolean;
  readingReminderHour: number;
  readingReminderMinute: number;
  language: 'fr' | 'ht';
  setReadingReminder: (enabled: boolean, hour?: number, minute?: number) => void;
  setLanguage: (lang: 'fr' | 'ht') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      readingReminderEnabled: false,
      readingReminderHour: 20,
      readingReminderMinute: 0,
      language: 'fr',
      setReadingReminder: (enabled, hour, minute) =>
        set(s => ({
          readingReminderEnabled: enabled,
          readingReminderHour: hour ?? s.readingReminderHour,
          readingReminderMinute: minute ?? s.readingReminderMinute,
        })),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'settings-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
