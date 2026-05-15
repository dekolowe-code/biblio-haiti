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
  { id: '1', name: 'Litt\u00e9rature', icon: 'BookOpen', color: '#E85D04', bgClass: 'bg-[#E85D04]' },
  { id: '2', name: 'Sciences', icon: 'FlaskConical', color: '#38B000', bgClass: 'bg-[#38B000]' },
  { id: '3', name: 'Jeunesse', icon: 'Baby', color: '#9D4EDD', bgClass: 'bg-[#9D4EDD]' },
  { id: '4', name: 'Contes', icon: 'Bookmark', color: '#FF6B9D', bgClass: 'bg-[#FF6B9D]' },
  { id: '5', name: 'Histoire', icon: 'Clock', color: '#3A86FF', bgClass: 'bg-[#3A86FF]' },
  { id: '6', name: 'Arts', icon: 'Palette', color: '#2EC4B6', bgClass: 'bg-[#2EC4B6]' },
]

export const countries = ['Ha\u00efti', 'France', 'Canada', 'USA', 'Congo', 'S\u00e9n\u00e9gal', 'Martinique', 'Guadeloupe']

export const styles = ['Fiction', 'Non-fiction', 'Po\u00e9sie', 'Th\u00e9\u00e2tre', '\u00c9ducatif']

export const books: Book[] = [
  {
    id: '1',
    title: 'La Danse',
    author: 'Marie L. Fran\u00e7ois',
    description: 'Un voyage captivant \u00e0 travers les danses traditionnelles ha\u00eftiennes, du rara au kompa, en passant par les danses vaudouesques. D\u00e9couvrez l\'histoire et la signification de chaque mouvement.',
    coverUrl: '/book-danse.jpg',
    country: 'Ha\u00efti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.8,
    totalRatings: 234,
    pages: 120,
    content: Array.from({ length: 120 }, (_, i) => `Page ${i + 1}: Le rythme tambourinait dans la chaleur de l\'apr\u00e8s-midi ha\u00eftien. Les danseurs se rassemblaient sur la place du village, leurs pieds nus frappant la terre battue en cadence parfaite. Le compas guidait leurs mouvements, tandis que les tambours racontaient des histoires ancestrales. Chaque geste avait un sens, chaque pas racontait une histoire transmise de g\u00e9n\u00e9ration en g\u00e9n\u00e9ration...`),
  },
  {
    id: '2',
    title: 'Histoire d\'Ha\u00efti',
    author: 'Jean-Pierre Chak Bron',
    description: 'De l\'ind\u00e9pendance \u00e0 nos jours, un r\u00e9cit complet et passionnant de l\'histoire de la premi\u00e8re r\u00e9publique noire du monde. Un ouvrage essentiel pour comprendre le pr\u00e9sent ha\u00eftien.',
    coverUrl: '/book-histoire.jpg',
    country: 'Ha\u00efti',
    category: 'Histoire',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 50,
    rating: 4.8,
    totalRatings: 512,
    pages: 340,
    content: Array.from({ length: 340 }, (_, i) => `Page ${i + 1}: Le 1er janvier 1804, sur la place d\'armes de Gona\u00efves, Jean-Jacques Dessalines proclama l\'ind\u00e9pendance d\'Ha\u00efti. Apr\u00e8s plus de dix ans de lutte acharn\u00e9e contre l\'arm\u00e9e napol\u00e9onienne, l\'\u00eele de Saint-Domingue devenait la premi\u00e8re nation libre de l\'h\u00e9misph\u00e8re occidental...`),
  },
  {
    id: '3',
    title: 'R\u00e9cits Populaires',
    author: 'Sophie Matinina',
    description: 'Collection de contes et l\u00e9gendes ha\u00eftiennes transmis oralement de g\u00e9n\u00e9ration en g\u00e9n\u00e9ration. D\u00e9couvrez les histoires de Bouki et Malis, les cr\u00e9atures l\u00e9gendaires et les sagesses populaires.',
    coverUrl: '/book-recits.jpg',
    country: 'Ha\u00efti',
    category: 'Contes',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 30,
    rating: 4.8,
    totalRatings: 189,
    pages: 180,
    content: Array.from({ length: 180 }, (_, i) => `Page ${i + 1}: Il \u00e9tait une fois, dans un village nich\u00e9 entre les montagnes et la mer, un vieux conteur nomm\u00e9 Tonton Pierre. Chaque soir, les enfants se rassemblaient autour de lui pour \u00e9couter ses histoires merveilleuses...`),
  },
  {
    id: '4',
    title: 'Les Enfants de la Plaine',
    author: 'Lucie Damas',
    description: 'Une histoire touchante sur la vie des enfants d\'un village ha\u00eftien, leurs r\u00eaves, leurs jeux et leur amiti\u00e9. Un livre pour toute la famille qui c\u00e9l\u00e8bre la jeunesse ha\u00eftienne.',
    coverUrl: '/book-jeunesse.jpg',
    country: 'Ha\u00efti',
    category: 'Jeunesse',
    style: 'Fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.6,
    totalRatings: 145,
    pages: 95,
    content: Array.from({ length: 95 }, (_, i) => `Page ${i + 1}: Petit Jean et ses amis couraient \u00e0 travers les champs de ma\u00efs. Le soleil de l\'apr\u00e8s-midi dorait leur peau et le vent caressait leurs visages. C\'\u00e9tait l\'\u00e9t\u00e9, et les vacances semblaient interminables...`),
  },
  {
    id: '5',
    title: 'Carnaval aux Cayes',
    author: 'Robert M\u00e9nard',
    description: 'Plongez dans l\'atmosph\u00e8re effervescente du carnaval ha\u00eftien aux Cayes. Les couleurs, la musique, les danses et la joie de vivre dans ce r\u00e9cit immersif.',
    coverUrl: '/book-carnaval.jpg',
    country: 'Ha\u00efti',
    category: 'Arts',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 40,
    rating: 4.7,
    totalRatings: 203,
    pages: 220,
    content: Array.from({ length: 220 }, (_, i) => `Page ${i + 1}: Les rues des Cayes s\'\u00e9taient transform\u00e9es en un oc\u00e9an de couleurs. Les costumes scintillaient sous le soleil, les tambours r\u00e9sonnaient et la foule chantait en ch\u0153ur...`),
  },
  {
    id: '6',
    title: 'Saveurs de la Terre',
    author: 'Marie-Jeanne Delmas',
    description: 'Un voyage culinaire \u00e0 travers les saveurs authentiques d\'Ha\u00efti. Du griot au lambi, en passant par le riz coll\u00e9 aux pois, d\u00e9couvrez les recettes traditionnelles et leurs histoires.',
    coverUrl: '/book-cuisine.jpg',
    country: 'Ha\u00efti',
    category: 'Litt\u00e9rature',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 35,
    rating: 4.9,
    totalRatings: 312,
    pages: 160,
    content: Array.from({ length: 160 }, (_, i) => `Page ${i + 1}: La cuisine ha\u00eftienne est un m\u00e9lange savoureux d\'influences africaines, fran\u00e7aises et indig\u00e8nes. Chaque plat raconte une histoire, chaque saveur \u00e9voque un souvenir...`),
  },
]

export const quizzes: Quiz[] = [
  {
    id: '1',
    title: 'Histoire d\'Ha\u00efti',
    category: 'Histoire',
    difficulty: 'medium',
    starReward: 25,
    questions: [
      { id: '1', text: 'En quelle ann\u00e9e Ha\u00efti a-t-elle proclam\u00e9 son ind\u00e9pendance ?', options: ['1802', '1804', '1810', '1791'], correctIndex: 1 },
      { id: '2', text: 'Qui \u00e9tait le leader de la r\u00e9volution ha\u00eftienne ?', options: ['Toussaint Louverture', 'Napol\u00e9on', 'George Washington', 'Sim\u00f3n Bol\u00edvar'], correctIndex: 0 },
      { id: '3', text: 'Quelle bataille a men\u00e9 \u00e0 l\'ind\u00e9pendance ?', options: ['Verti\u00e8res', 'Waterloo', 'Austerlitz', 'Gettysburg'], correctIndex: 0 },
      { id: '4', text: 'Ha\u00efti partage l\'\u00eele Hispaniola avec quel pays ?', options: ['Cuba', 'Jama\u00efque', 'R\u00e9publique Dominicaine', 'Porto Rico'], correctIndex: 2 },
      { id: '5', text: 'Quel \u00e9tait le nom colonial d\'Ha\u00efti ?', options: ['Nouvelle-France', 'Saint-Domingue', 'La Espa\u00f1ola', 'Nouvelle-Angleterre'], correctIndex: 1 },
    ],
  },
  {
    id: '2',
    title: 'Culture Ha\u00eftienne',
    category: 'Culture',
    difficulty: 'easy',
    starReward: 15,
    questions: [
      { id: '1', text: 'Quelle est la langue officielle d\'Ha\u00efti ?', options: ['Cr\u00e9ole', 'Fran\u00e7ais', 'Espagnol', 'Anglais'], correctIndex: 1 },
      { id: '2', text: 'Quel est le plat national ha\u00eftien ?', options: ['Griot', 'Tacos', 'Sushi', 'Pizza'], correctIndex: 0 },
      { id: '3', text: 'Quelle danse est originaire d\'Ha\u00efti ?', options: ['Tango', 'Salsa', 'Kompa', 'Ballet'], correctIndex: 2 },
      { id: '4', text: 'Quelle couleur est sur le drapeau ha\u00eftien ?', options: ['Bleu et Rouge', 'Vert et Jaune', 'Noir et Blanc', 'Orange et Violet'], correctIndex: 0 },
    ],
  },
  {
    id: '3',
    title: 'G\u00e9ographie d\'Ha\u00efti',
    category: 'Sciences',
    difficulty: 'hard',
    starReward: 35,
    questions: [
      { id: '1', text: 'Quelle est la capitale d\'Ha\u00efti ?', options: ['Cap-Ha\u00eftien', 'Port-au-Prince', 'Les Cayes', 'Jacmel'], correctIndex: 1 },
      { id: '2', text: 'Quelle est la plus grande ville d\'Ha\u00efti ?', options: ['Port-au-Prince', 'Cap-Ha\u00eftien', 'Gona\u00efves', 'Les Cayes'], correctIndex: 0 },
      { id: '3', text: 'Quel est le point culminant d\'Ha\u00efti ?', options: ['Pic la Selle', 'Montagne Noire', 'Pic Macaya', 'Morne du Cibao'], correctIndex: 0 },
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
