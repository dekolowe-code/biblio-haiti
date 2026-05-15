export interface Book {
  id: string
  title: string
  author: string
  description: string
  coverUrl: string
  country: string
  category: string
  style: string
  isPremium: boolean
  unlockCost: number
  rating: number
  totalRatings: number
  pages: number
  content: string[]
}

export interface Quiz {
  id: string
  title: string
  category: string
  difficulty: string
  starReward: number
  questions: Question[]
}

export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export interface UserBook {
  bookId: string
  isUnlocked: boolean
  isFavorite: boolean
  currentPage: number
  isFinished: boolean
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  bgClass: string
}

export const categories: Category[] = [
  { id: '1', name: 'Littérature', icon: 'BookOpen', color: '#E85D04', bgClass: 'bg-[#E85D04]' },
  { id: '2', name: 'Sciences', icon: 'FlaskConical', color: '#38B000', bgClass: 'bg-[#38B000]' },
  { id: '3', name: 'Jeunesse', icon: 'Baby', color: '#9D4EDD', bgClass: 'bg-[#9D4EDD]' },
  { id: '4', name: 'Contes', icon: 'Bookmark', color: '#FF6B9D', bgClass: 'bg-[#FF6B9D]' },
  { id: '5', name: 'Histoire', icon: 'Clock', color: '#3A86FF', bgClass: 'bg-[#3A86FF]' },
  { id: '6', name: 'Arts', icon: 'Palette', color: '#2EC4B6', bgClass: 'bg-[#2EC4B6]' },
]

export const countries = ['Haïti', 'France', 'Canada', 'USA', 'Congo', 'Sénégal', 'Martinique', 'Guadeloupe']
export const styles = ['Fiction', 'Non-fiction', 'Poésie', 'Théâtre', 'Éducatif']

export const books: Book[] = [
  {
    id: '1',
    title: 'La Danse',
    author: 'Marie L. François',
    description: 'Un voyage captivant à travers les danses traditionnelles haïtiennes.',
    coverUrl: 'book-danse.jpg',
    country: 'Haïti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.8,
    totalRatings: 234,
    pages: 120,
    content: Array.from({ length: 120 }, (_, i) => `Page ${i + 1}: Le rythme tambourinait dans la chaleur de l'après-midi haïtien...`),
  },
  {
    id: '2',
    title: "Histoire d'Haïti",
    author: 'Jean-Pierre Chak Bron',
    description: 'De l\'indépendance à nos jours, un récit complet.',
    coverUrl: 'book-histoire.jpg',
    country: 'Haïti',
    category: 'Histoire',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 50,
    rating: 4.8,
    totalRatings: 512,
    pages: 340,
    content: Array.from({ length: 340 }, (_, i) => `Page ${i + 1}: Le 1er janvier 1804, sur la place d'armes de Gonaïves...`),
  },
  {
    id: '3',
    title: 'Récits Populaires',
    author: 'Sophie Matinina',
    description: 'Collection de contes et légendes haïtiennes.',
    coverUrl: 'book-recits.jpg',
    country: 'Haïti',
    category: 'Contes',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 30,
    rating: 4.8,
    totalRatings: 189,
    pages: 180,
    content: Array.from({ length: 180 }, (_, i) => `Page ${i + 1}: Il était une fois, dans un village niché entre les montagnes...`),
  },
  {
    id: '4',
    title: 'Les Enfants de la Plaine',
    author: 'Lucie Damas',
    description: 'Une histoire touchante sur la vie des enfants.',
    coverUrl: 'book-jeunesse.jpg',
    country: 'Haïti',
    category: 'Jeunesse',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.6,
    totalRatings: 145,
    pages: 95,
    content: Array.from({ length: 95 }, (_, i) => `Page ${i + 1}: Petit Jean et ses amis couraient à travers les champs...`),
  },
  {
    id: '5',
    title: 'Carnaval aux Cayes',
    author: 'Robert Ménard',
    description: "Plongez dans l'atmosphère effervescente du carnaval.",
    coverUrl: 'book-carnaval.jpg',
    country: 'Haïti',
    category: 'Arts',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 40,
    rating: 4.7,
    totalRatings: 203,
    pages: 220,
    content: Array.from({ length: 220 }, (_, i) => `Page ${i + 1}: Les rues des Cayes s'étaient transformées en un océan de couleurs...`),
  },
  {
    id: '6',
    title: 'Saveurs de la Terre',
    author: 'Marie-Jeanne Delmas',
    description: 'Un voyage culinaire à travers les saveurs authentiques.',
    coverUrl: 'book-cuisine.jpg',
    country: 'Haïti',
    category: 'Littérature',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 35,
    rating: 4.9,
    totalRatings: 312,
    pages: 160,
    content: Array.from({ length: 160 }, (_, i) => `Page ${i + 1}: La cuisine haïtienne est un mélange savoureux...`),
  },
]

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: "Histoire d'Haïti",
    category: 'Histoire',
    difficulty: 'medium',
    starReward: 25,
    questions: [
      { id: '1', text: "En quelle année Haïti a-t-elle proclamé son indépendance ?", options: ['1802', '1804', '1810', '1791'], correctIndex: 1 },
      { id: '2', text: 'Qui était le leader de la révolution haïtienne ?', options: ['Toussaint Louverture', 'Napoléon', 'Washington', 'Bolívar'], correctIndex: 0 },
      { id: '3', text: 'Quelle bataille a mené à l\'indépendance ?', options: ['Vertières', 'Waterloo', 'Austerlitz', 'Gettysburg'], correctIndex: 0 },
    ],
  },
  {
    id: '2',
    title: 'Culture Haïtienne',
    category: 'Culture',
    difficulty: 'easy',
    starReward: 15,
    questions: [
      { id: '1', text: "Quelle est la langue officielle d'Haïti ?", options: ['Créole', 'Français', 'Espagnol', 'Anglais'], correctIndex: 1 },
      { id: '2', text: 'Quel est le plat national haïtien ?', options: ['Griot', 'Tacos', 'Sushi', 'Pizza'], correctIndex: 0 },
    ],
  },
]

// AsyncStorage helpers (will be implemented with expo-secure-store)
const STORAGE_KEYS = {
  USER: 'bibliohaiti_user',
  STARS: 'bibliohaiti_stars',
  LIBRARY: 'bibliohaiti_library',
  QUIZ_RESULTS: 'bibliohaiti_quiz_results',
  READING_PROGRESS: 'bibliohaiti_reading',
  ONBOARDING: 'bibliohaiti_onboarding',
}

export function getStoredUser() {
  try {
    const data = require('expo-secure-store').getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  } catch {
    return null
  }
}

export function setStoredUser(user: any) {
  try {
    require('expo-secure-store').setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  } catch {}
}

export function getStoredStars(): number {
  try {
    const data = require('expo-secure-store').getItem(STORAGE_KEYS.STARS)
    return data ? parseInt(data) : 50
  } catch {
    return 50
  }
}

export function setStoredStars(stars: number) {
  try {
    require('expo-secure-store').setItem(STORAGE_KEYS.STARS, String(stars))
  } catch {}
}

export function getStoredLibrary(): UserBook[] {
  try {
    const data = require('expo-secure-store').getItem(STORAGE_KEYS.LIBRARY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function setStoredLibrary(library: UserBook[]) {
  try {
    require('expo-secure-store').setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library))
  } catch {}
}

export function addToLibrary(bookId: string) {
  const library = getStoredLibrary()
  if (!library.find(ub => ub.bookId === bookId)) {
    library.push({ bookId, isUnlocked: !books.find(b => b.id === bookId)?.isPremium, isFavorite: false, currentPage: 0, isFinished: false })
    setStoredLibrary(library)
  }
}

export function unlockBook(bookId: string): boolean {
  const library = getStoredLibrary()
  const book = books.find(b => b.id === bookId)
  if (!book) return false
  const stars = getStoredStars()
  if (stars < book.unlockCost) return false

  const existing = library.find(ub => ub.bookId === bookId)
  if (existing) {
    existing.isUnlocked = true
  } else {
    library.push({ bookId, isUnlocked: true, isFavorite: false, currentPage: 0, isFinished: false })
  }
  setStoredLibrary(library)
  setStoredStars(stars - book.unlockCost)
  return true
}

export function toggleFavorite(bookId: string): boolean {
  const library = getStoredLibrary()
  const existing = library.find(ub => ub.bookId === bookId)
  if (existing) {
    existing.isFavorite = !existing.isFavorite
  } else {
    library.push({ bookId, isUnlocked: !books.find(b => b.id === bookId)?.isPremium, isFavorite: true, currentPage: 0, isFinished: false })
  }
  setStoredLibrary(library)
  return existing ? existing.isFavorite : true
}

export function updateReadingProgress(bookId: string, page: number, finished: boolean = false) {
  const library = getStoredLibrary()
  const existing = library.find(ub => ub.bookId === bookId)
  if (existing) {
    existing.currentPage = page
    existing.isFinished = finished
    setStoredLibrary(library)
  }
}

export function getQuizResults(): string[] {
  try {
    const data = require('expo-secure-store').getItem(STORAGE_KEYS.QUIZ_RESULTS)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addQuizResult(quizId: string, starsEarned: number) {
  const results = getQuizResults()
  results.push(quizId)
  try {
    require('expo-secure-store').setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results))
  } catch {}
  setStoredStars(getStoredStars() + starsEarned)
}

export function getReadingProgress(bookId: string): number {
  const library = getStoredLibrary()
  const entry = library.find(ub => ub.bookId === bookId)
  return entry?.currentPage || 0
}

export function hasSeenOnboarding(): boolean {
  try {
    return require('expo-secure-store').getItem(STORAGE_KEYS.ONBOARDING) === 'true'
  } catch {
    return false
  }
}

export function setOnboardingComplete() {
  try {
    require('expo-secure-store').setItem(STORAGE_KEYS.ONBOARDING, 'true')
  } catch {}
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    try {
      require('expo-secure-store').deleteItem(key)
    } catch {}
  })
}
