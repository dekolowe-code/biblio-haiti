// Couleurs nationales d'Haïti et thème Biblio Haiti
export const colors = {
  // Couleurs nationales
  primary: '#00209F',    // Bleu haïtien
  secondary: '#D21034',  // Rouge haïtien
  
  // Couleurs neutres
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  // Couleurs fonctionnelles
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Couleurs pour la gamification
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  
  // Modes de lecture
  light: {
    background: '#FFFFFF',
    text: '#111827',
    card: '#F9FAFB',
  },
  dark: {
    background: '#111827',
    text: '#F9FAFB',
    card: '#1F2937',
  },
  sepia: {
    background: '#F4ECD8',
    text: '#5B4636',
    card: '#E8DCC4',
  },
};

export type ColorType = typeof colors;
