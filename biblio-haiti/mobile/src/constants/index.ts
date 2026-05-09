// Biblio-Haïti - Constants
export const COLORS = {
  primary: '#7B2CBF',      // Violet principal
  secondary: '#9D4EDD',    // Violet clair
  accent: '#E0AAFF',       // Violet très clair
  success: '#2ECC71',      // Vert
  warning: '#F39C12',      // Orange
  error: '#E74C3C',        // Rouge
  info: '#3498DB',         // Bleu
  dark: '#2C3E50',         // Gris foncé
  light: '#ECF0F1',        // Gris clair
  white: '#FFFFFF',
  black: '#000000',
  gray: '#95A5A6',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#2C3E50',
  textLight: '#7F8C8D',
  border: '#BDC3C7',
  star: '#F1C40F',         // Couleur des étoiles
};

export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 10,
  s: 12,
  m: 14,
  l: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
};

export const SCREENS = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  FORGOT_PASSWORD: 'ForgotPassword',
  OTP_VERIFICATION: 'OTPVerification',
  
  // Main Tabs
  HOME: 'Home',
  SEARCH: 'Search',
  LIBRARY: 'Library',
  PROFILE: 'Profile',
  
  // Book Related
  BOOK_DETAIL: 'BookDetail',
  READER: 'Reader',
  QUIZ: 'Quiz',
  QUIZ_RESULT: 'QuizResult',
  
  // Author
  AUTHOR_DASHBOARD: 'AuthorDashboard',
  UPLOAD_BOOK: 'UploadBook',
  MY_BOOKS: 'MyBooks',
  BOOK_STATS: 'BookStats',
  
  // Payment
  PAYMENT: 'Payment',
  PAYMENT_SUCCESS: 'PaymentSuccess',
  PAYMENT_FAILURE: 'PaymentFailure',
  
  // Settings
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
  HELP: 'Help',
  ABOUT: 'About',
  
  // Admin
  ADMIN_DASHBOARD: 'AdminDashboard',
  BOOK_VALIDATION: 'BookValidation',
  USER_MANAGEMENT: 'UserManagement',
};

export const BOOK_CATEGORIES = [
  { id: '1', name: 'Roman', icon: 'book-open-page-variant' },
  { id: '2', name: 'Poésie', icon: 'feather' },
  { id: '3', name: 'Histoire', icon: 'timeline' },
  { id: '4', name: 'Science', icon: 'flask' },
  { id: '5', name: 'Biographie', icon: 'account' },
  { id: '6', name: 'Contes & Légendes', icon: 'castle' },
  { id: '7', name: 'Éducation', icon: 'school' },
  { id: '8', name: 'Jeunesse', icon: 'emoticon-happy' },
];

export const ACCESS_TYPES = {
  FREE: 'free',
  RENT_24H: 'rent_24h',
  RENT_7D: 'rent_7d',
  RENT_30D: 'rent_30d',
  PURCHASE: 'purchase',
};

export const ACCESS_PRICES = {
  RENT_24H: { stars: 5, gourdes: 25, usd: 0.50 },
  RENT_7D: { stars: 15, gourdes: 75, usd: 1.50 },
  RENT_30D: { stars: 50, gourdes: 250, usd: 5.00 },
  PURCHASE: { stars: 100, gourdes: 500, usd: 10.00 },
};

export const QUIZ_DIFFICULTY = {
  EASY: { points: 1, label: 'Facile' },
  MEDIUM: { points: 2, label: 'Moyen' },
  HARD: { points: 3, label: 'Difficile' },
};

export const USER_ROLES = {
  READER: 'reader',
  AUTHOR: 'author',
  ADMIN: 'admin',
};

export const BOOK_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DRAFT: 'draft',
};

export const PAYMENT_METHODS = {
  MONCASH: 'moncash',
  STRIPE: 'stripe',
  STARS: 'stars',
};

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  REFRESH_TOKEN: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  ME: '/api/auth/me',
  
  // Books
  BOOKS: '/api/books',
  BOOK_BY_ID: (id: string) => `/api/books/${id}`,
  BOOK_CATEGORIES: '/api/books/categories',
  BOOK_SEARCH: '/api/books/search',
  BOOK_UPLOAD: '/api/books/upload',
  
  // Access
  BOOK_ACCESS: '/api/access',
  PURCHASE_ACCESS: '/api/access/purchase',
  
  // Stars
  STARS_BALANCE: '/api/stars/balance',
  STARS_HISTORY: '/api/stars/history',
  
  // Quiz
  QUIZ_BY_BOOK: (bookId: string) => `/api/quiz/${bookId}`,
  QUIZ_SUBMIT: '/api/quiz/submit',
  
  // Reviews
  REVIEWS: '/api/reviews',
  
  // Author
  AUTHOR_BOOKS: '/api/author/books',
  AUTHOR_STATS: '/api/author/stats',
  
  // Admin
  ADMIN_PENDING_BOOKS: '/api/admin/books/pending',
  ADMIN_USERS: '/api/admin/users',
  ADMIN_STATS: '/api/admin/stats',
  
  // Payment
  PAYMENT_MONCASH: '/api/payment/moncash',
  PAYMENT_STRIPE: '/api/payment/stripe',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@biblio_haiti:access_token',
  REFRESH_TOKEN: '@biblio_haiti:refresh_token',
  USER_DATA: '@biblio_haiti:user_data',
  OFFLINE_BOOKS: '@biblio_haiti:offline_books',
  THEME: '@biblio_haiti:theme',
  LANGUAGE: '@biblio_haiti:language',
};

export const READER_SETTINGS = {
  DEFAULT_FONT_SIZE: 16,
  MIN_FONT_SIZE: 12,
  MAX_FONT_SIZE: 24,
  THEMES: ['light', 'sepia', 'dark'],
};

export const CACHE_CONFIG = {
  MAX_OFFLINE_BOOKS: 10,
  MAX_CACHE_SIZE_MB: 500,
  CACHE_EXPIRY_HOURS: 24,
};
