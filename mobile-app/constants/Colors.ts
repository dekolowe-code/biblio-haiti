// Palette identique à l'app web Biblio Haïti
// CSS variables: --crimson: #C41E3A, --deep-red: #9B1B30,
//                --sunset-orange: #E85D04, --golden-yellow: #FAA307

export const BRAND = {
  crimson:      '#C41E3A',
  deepRed:      '#9B1B30',
  sunsetOrange: '#E85D04',
  goldenYellow: '#FAA307',
  teal:         '#2EC4B6',
  purple:       '#9D4EDD',
  pink:         '#FF6B9D',
  green:        '#38B000',
  blue:         '#3A86FF',
  darkText:     '#1A1A2E',
  mutedText:    '#6B7280',
  offWhite:     '#FFF8F0',
} as const;

// Gradient du fond principal (top → bottom)
export const GRADIENT_BG  = ['#9B1B30', '#C41E3A', '#E85D04', '#FAA307'] as const;
// Gradient de la nav bar (left → right)
export const GRADIENT_NAV = ['#9B1B30', '#C41E3A', '#E85D04'] as const;

export const lightColors = {
  background:        '#FFF8F0',
  surface:           '#FFFFFF',
  primary:           '#C41E3A',
  primaryDark:       '#9B1B30',
  primaryLight:      '#E85D04',
  accent:            '#FAA307',
  text:              '#1A1A2E',
  textSecondary:     '#6B7280',
  border:            '#F3E8E8',
  card:              '#FFFFFF',
  tabBar:            '#FFFFFF',
  tabBarBorder:      '#F3E8E8',
  success:           '#38B000',
  error:             '#ef4444',
  warning:           '#FAA307',
  overlay:           'rgba(0,0,0,0.5)',
  skeleton:          '#F3E8E8',
  skeletonHighlight: '#FFF8F0',
  gradientStart:     '#9B1B30',
  gradientEnd:       '#FAA307',
};

export const darkColors = {
  background:        '#1A0A0F',
  surface:           '#2D1018',
  primary:           '#E85D04',
  primaryDark:       '#C41E3A',
  primaryLight:      '#FAA307',
  accent:            '#FAA307',
  text:              '#FFF8F0',
  textSecondary:     '#D1A0A8',
  border:            '#4A1525',
  card:              '#2D1018',
  tabBar:            '#1A0A0F',
  tabBarBorder:      '#4A1525',
  success:           '#38B000',
  error:             '#ef4444',
  warning:           '#FAA307',
  overlay:           'rgba(0,0,0,0.7)',
  skeleton:          '#2D1018',
  skeletonHighlight: '#4A1525',
  gradientStart:     '#9B1B30',
  gradientEnd:       '#FAA307',
};

export type ColorPalette = typeof lightColors;

// Mêmes couleurs de catégorie que l'app web
export const categoryColors: Record<string, string> = {
  'Littérature': '#E85D04',
  'Sciences':    '#38B000',
  'Jeunesse':    '#9D4EDD',
  'Contes':      '#FF6B9D',
  'Histoire':    '#3A86FF',
  'Arts':        '#2EC4B6',
  'Roman':       '#E85D04',
  'Poésie':      '#9D4EDD',
  'Philosophie': '#FAA307',
  'Religion':    '#C41E3A',
};
