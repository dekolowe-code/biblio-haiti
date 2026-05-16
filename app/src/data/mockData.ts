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
  type: 'text' | 'pdf' | 'epub'
  pdfUrl?: string
  epubUrl?: string
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
    description: 'Un voyage captivant à travers les danses traditionnelles haïtiennes, du rara au kompa, en passant par les danses vaudouesques. Découvrez l\'histoire et la signification de chaque mouvement.',
    coverUrl: '/assets/books/covers/book-danse.jpg',
    country: 'Haïti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.8,
    totalRatings: 234,
    pages: 120,
    content: Array.from({ length: 120 }, (_, i) => `Page ${i + 1}: Le rythme tambourinait dans la chaleur de l\'après-midi haïtien. Les danseurs se rassemblaient sur la place du village, leurs pieds nus frappant la terre battue en cadence parfaite. Le compas guidait leurs mouvements, tandis que les tambours racontaient des histoires ancestrales. Chaque geste avait un sens, chaque pas racontait une histoire transmise de génération en génération...`),
    type: 'text',
  },
  {
    id: '2',
    title: 'Histoire d\'Haïti',
    author: 'Jean-Pierre Chak Bron',
    description: 'De l\'indépendance à nos jours, un récit complet et passionnant de l\'histoire de la première république noire du monde. Un ouvrage essentiel pour comprendre le présent haïtien.',
    coverUrl: '/assets/books/covers/book-histoire.jpg',
    country: 'Haïti',
    category: 'Histoire',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 50,
    rating: 4.8,
    totalRatings: 512,
    pages: 340,
    content: Array.from({ length: 340 }, (_, i) => `Page ${i + 1}: Le 1er janvier 1804, sur la place d\'armes de Gonaïves, Jean-Jacques Dessalines proclama l\'indépendance d\'Haïti. Après plus de dix ans de lutte acharnée contre l\'armée napoléonienne, l\'île de Saint-Domingue devenait la première nation libre de l\'hémisphère occidental...`),
    type: 'text',
  },
  {
    id: '3',
    title: 'Récits Populaires',
    author: 'Sophie Matinina',
    description: 'Collection de contes et légendes haïtiennes transmis oralement de génération en génération. Découvrez les histoires de Bouki et Malis, les créatures légendaires et les sagesses populaires.',
    coverUrl: '/assets/books/covers/book-recits.jpg',
    country: 'Haïti',
    category: 'Contes',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 30,
    rating: 4.8,
    totalRatings: 189,
    pages: 180,
    content: Array.from({ length: 180 }, (_, i) => `Page ${i + 1}: Il était une fois, dans un village niché entre les montagnes et la mer, un vieux conteur nommé Tonton Pierre. Chaque soir, les enfants se rassemblaient autour de lui pour écouter ses histoires merveilleuses...`),
    type: 'text',
  },
  {
    id: '4',
    title: 'Les Enfants de la Plaine',
    author: 'Lucie Damas',
    description: 'Une histoire touchante sur la vie des enfants d\'un village haïtien, leurs rêves, leurs jeux et leur amitié. Un livre pour toute la famille qui célèbre la jeunesse haïtienne.',
    coverUrl: '/assets/books/covers/book-jeunesse.jpg',
    country: 'Haïti',
    category: 'Jeunesse',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.6,
    totalRatings: 145,
    pages: 95,
    content: Array.from({ length: 95 }, (_, i) => `Page ${i + 1}: Petit Jean et ses amis couraient à travers les champs de maïs. Le soleil de l\'après-midi dorait leur peau et le vent caressait leurs visages. C\'était l\'été, et les vacances semblaient interminables...`),
    type: 'text',
  },
  {
    id: '5',
    title: 'Carnaval aux Cayes',
    author: 'Robert Ménard',
    description: 'Plongez dans l\'atmosphère effervescente du carnaval haïtien aux Cayes. Les couleurs, la musique, les danses et la joie de vivre dans ce récit immersif.',
    coverUrl: '/assets/books/covers/book-carnaval.jpg',
    country: 'Haïti',
    category: 'Arts',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 40,
    rating: 4.7,
    totalRatings: 203,
    pages: 220,
    content: Array.from({ length: 220 }, (_, i) => `Page ${i + 1}: Les rues des Cayes s\'étaient transformées en un océan de couleurs. Les costumes scintillaient sous le soleil, les tambours résonnaient et la foule chantait en chœur...`),
    type: 'text',
  },
  {
    id: '6',
    title: 'Saveurs de la Terre',
    author: 'Marie-Jeanne Delmas',
    description: 'Un voyage culinaire à travers les saveurs authentiques d\'Haïti. Du griot au lambi, en passant par le riz collé aux pois, découvrez les recettes traditionnelles et leurs histoires.',
    coverUrl: '/assets/books/covers/book-cuisine.jpg',
    country: 'Haïti',
    category: 'Littérature',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 35,
    rating: 4.9,
    totalRatings: 312,
    pages: 160,
    content: Array.from({ length: 160 }, (_, i) => `Page ${i + 1}: La cuisine haïtienne est un mélange savoureux d\'influences africaines, françaises et indigènes. Chaque plat raconte une histoire, chaque saveur évoque un souvenir...`),
    type: 'text',
  },
  {
    id: '7',
    title: 'Gouverneurs de la Rosée',
    author: 'Jacques Roumain',
    description: 'Le chef-d\'œuvre de la littérature haïtienne. Un r\u00e9cit puissant sur la solidarité, l\'amour et la lutte pour l\'eau dans un village haïtien.',
    coverUrl: '/assets/books/covers/book-rose.jpg',
    country: 'Haïti',
    category: 'Littérature',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 60,
    rating: 5.0,
    totalRatings: 1240,
    pages: 30,
    content: [],
    type: 'pdf',
    pdfUrl: '/assets/books/files/Les-Dessous-d-e-ros-Magazine-gratuit-Janvier-2015_9782866889371.pdf',
  },
  {
    id: '8',
    title: 'Under Cover Love',
    author: 'Brunelli',
    description: 'Un pr\u00e9lude romantique et myst\u00e9rieux dans le monde de la mode. D\u00e9couvrez les secrets qui se cachent derrière les projecteurs.',
    coverUrl: '/assets/books/covers/book-jeunesse.jpg',
    country: 'France',
    category: 'Littérature',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.5,
    totalRatings: 86,
    pages: 45,
    content: [],
    type: 'epub',
    epubUrl: '/assets/books/files/brunelli_under-cover-love-prelude-t0.epub',
  },
]

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: 'Histoire d\'Haïti',
    category: 'Histoire',
    difficulty: 'medium',
    starReward: 25,
    questions: [
      { id: '1', text: 'En quelle année Haïti a-t-elle proclamé son indépendance ?', options: ['1802', '1804', '1810', '1791'], correctIndex: 1 },
      { id: '2', text: 'Qui était le leader de la révolution haïtienne ?', options: ['Toussaint Louverture', 'Napoléon', 'George Washington', 'Simón Bolívar'], correctIndex: 0 },
      { id: '3', text: 'Quelle bataille a mené à l\'indépendance ?', options: ['Vertières', 'Waterloo', 'Austerlitz', 'Gettysburg'], correctIndex: 0 },
      { id: '4', text: 'Haïti partage l\'île Hispaniola avec quel pays ?', options: ['Cuba', 'Jamaïque', 'République Dominicaine', 'Porto Rico'], correctIndex: 2 },
      { id: '5', text: 'Quel était le nom colonial d\'Haïti ?', options: ['Nouvelle-France', 'Saint-Domingue', 'La Española', 'Nouvelle-Angleterre'], correctIndex: 1 },
    ],
  },
  {
    id: '2',
    title: 'Culture Haïtienne',
    category: 'Culture',
    difficulty: 'easy',
    starReward: 15,
    questions: [
      { id: '1', text: 'Quelle est la langue officielle d\'Haïti ?', options: ['Créole', 'Français', 'Espagnol', 'Anglais'], correctIndex: 1 },
      { id: '2', text: 'Quel est le plat national haïtien ?', options: ['Griot', 'Tacos', 'Sushi', 'Pizza'], correctIndex: 0 },
      { id: '3', text: 'Quelle danse est originaire d\'Haïti ?', options: ['Tango', 'Salsa', 'Kompa', 'Ballet'], correctIndex: 2 },
      { id: '4', text: 'Quelle couleur est sur le drapeau haïtien ?', options: ['Bleu et Rouge', 'Vert et Jaune', 'Noir et Blanc', 'Orange et Violet'], correctIndex: 0 },
    ],
  },
  {
    id: '3',
    title: 'Géographie d\'Haïti',
    category: 'Sciences',
    difficulty: 'hard',
    starReward: 35,
    questions: [
      { id: '1', text: 'Quelle est la capitale d\'Haïti ?', options: ['Cap-Haïtien', 'Port-au-Prince', 'Les Cayes', 'Jacmel'], correctIndex: 1 },
      { id: '2', text: 'Quelle est la plus grande ville d\'Haïti ?', options: ['Port-au-Prince', 'Cap-Haïtien', 'Gonaïves', 'Les Cayes'], correctIndex: 0 },
      { id: '3', text: 'Quel est le point culminant d\'Haïti ?', options: ['Pic la Selle', 'Montagne Noire', 'Pic Macaya', 'Morne du Cibao'], correctIndex: 0 },
    ],
  },
]

// Local storage helpers
const STORAGE_KEYS = {
  USER: 'bibliohaiti_user',
  STARS: 'bibliohaiti_stars',
  LIBRARY: 'bibliohaiti_library',
  QUIZ_RESULTS: 'bibliohaiti_quiz_results',
  READING_PROGRESS: 'bibliohaiti_reading',
}

export function getStoredUser() {
  const data = localStorage.getItem(STORAGE_KEYS.USER)
  return data ? JSON.parse(data) : null
}

export function setStoredUser(user: any) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
}

export function getStoredStars(): number {
  const data = localStorage.getItem(STORAGE_KEYS.STARS)
  return data ? parseInt(data) : 50 // Starting bonus
}

export function setStoredStars(stars: number) {
  localStorage.setItem(STORAGE_KEYS.STARS, String(stars))
}

export function getStoredLibrary(): UserBook[] {
  const data = localStorage.getItem(STORAGE_KEYS.LIBRARY)
  return data ? JSON.parse(data) : []
}

export function setStoredLibrary(library: UserBook[]) {
  localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(library))
}

export function addToLibrary(bookId: string) {
  const library = getStoredLibrary()
  if (!library.find(ub => ub.bookId === bookId)) {
    library.push({ bookId, isUnlocked: !books.find(b => b.id === bookId)?.isPremium, isFavorite: false, currentPage: 0, isFinished: false })
    setStoredLibrary(library)
  }
}

export function unlockBook(bookId: string) {
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

export function toggleFavorite(bookId: string) {
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
  const data = localStorage.getItem(STORAGE_KEYS.QUIZ_RESULTS)
  return data ? JSON.parse(data) : []
}

export function addQuizResult(quizId: string, starsEarned: number) {
  const results = getQuizResults()
  results.push(quizId)
  localStorage.setItem(STORAGE_KEYS.QUIZ_RESULTS, JSON.stringify(results))
  setStoredStars(getStoredStars() + starsEarned)
}

export function getReadingProgress(bookId: string): number {
  const library = getStoredLibrary()
  const entry = library.find(ub => ub.bookId === bookId)
  return entry?.currentPage || 0
}

export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key))
}
