import { supabase } from './supabase';
import { Book } from '@/types';

// Covers locales — mêmes fichiers que app/public/assets/books/covers/
// Chargées via require() pour Expo (pas de require dynamique donc map statique)
import { BOOK_COVER_MAP } from '@/constants/Assets';

const mockBooks: Book[] = [
  {
    id: '1',
    title: 'La Danse',
    author: 'Marie L. François',
    description: 'Un voyage captivant à travers les danses traditionnelles haïtiennes, du rara au kompa, en passant par les danses vaudouesques. Découvrez l\'histoire et la signification de chaque mouvement.',
    coverUrl: 'local:1',
    country: 'Haïti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.8,
    totalRatings: 234,
    pages: 120,
    content: Array.from({ length: 10 }, (_, i) => `Le rythme tambourinait dans la chaleur de l'après-midi haïtien. Les danseurs se rassemblaient sur la place du village, leurs pieds nus frappant la terre battue en cadence parfaite. Le compas guidait leurs mouvements, tandis que les tambours racontaient des histoires ancestrales. Chaque geste avait un sens, chaque pas racontait une histoire transmise de génération en génération...`),
    type: 'text',
  },
  {
    id: '2',
    title: 'Histoire d\'Haïti',
    author: 'Jean-Pierre Chak Bron',
    description: 'De l\'indépendance à nos jours, un récit complet et passionnant de l\'histoire de la première république noire du monde. Un ouvrage essentiel pour comprendre le présent haïtien.',
    coverUrl: 'local:2',
    country: 'Haïti',
    category: 'Histoire',
    style: 'Non-fiction',
    isPremium: true,
    unlockCost: 50,
    rating: 4.8,
    totalRatings: 512,
    pages: 340,
    content: Array.from({ length: 10 }, (_, i) => `Le 1er janvier 1804, sur la place d'armes de Gonaïves, Jean-Jacques Dessalines proclama l'indépendance d'Haïti. Après plus de dix ans de lutte acharnée contre l'armée napoléonienne, l'île de Saint-Domingue devenait la première nation libre de l'hémisphère occidental...`),
    type: 'text',
  },
  {
    id: '3',
    title: 'Récits Populaires',
    author: 'Sophie Matinina',
    description: 'Collection de contes et légendes haïtiennes transmis oralement de génération en génération. Découvrez les histoires de Bouki et Malis, les créatures légendaires et les sagesses populaires.',
    coverUrl: 'local:3',
    country: 'Haïti',
    category: 'Contes',
    style: 'Fiction',
    isPremium: true,
    unlockCost: 30,
    rating: 4.8,
    totalRatings: 189,
    pages: 180,
    content: Array.from({ length: 10 }, (_, i) => `Il était une fois, dans un village niché entre les montagnes et la mer, un vieux conteur nommé Tonton Pierre. Chaque soir, les enfants se rassemblaient autour de lui pour écouter ses histoires merveilleuses...`),
    type: 'text',
  },
  {
    id: '4',
    title: 'Les Enfants de la Plaine',
    author: 'Dr. Henri Voltaire',
    description: 'Un guide éducatif et une histoire touchante sur l\'enfance en Haïti, à la fois éducative et profondément humaine.',
    coverUrl: 'local:4',
    country: 'Haïti',
    category: 'Jeunesse',
    style: 'Éducatif',
    isPremium: false,
    unlockCost: 0,
    rating: 4.3,
    totalRatings: 95,
    pages: 200,
    content: Array.from({ length: 10 }, (_, i) => `Dans la plaine de l'Artibonite, les enfants couraient entre les champs de riz. Leur rire résonnait dans la lumière dorée de l'après-midi...`),
    type: 'text',
  },
  {
    id: '5',
    title: 'Saveurs d\'Haïti',
    author: 'Rosalie Dupont',
    description: 'Un voyage culinaire au cœur de la gastronomie haïtienne, ses épices, ses recettes et ses traditions de table. De la griot au pikliz, toute la richesse d\'une cuisine métissée.',
    coverUrl: 'local:5',
    country: 'Haïti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.6,
    totalRatings: 145,
    pages: 90,
    content: Array.from({ length: 10 }, (_, i) => `La cuisine haïtienne est un mélange d'influences africaines, françaises, espagnoles et taïnos. Chaque plat raconte une histoire, chaque épice évoque un souvenir...`),
    type: 'text',
  },
  {
    id: '6',
    title: 'Carnaval d\'Haïti',
    author: 'Monique Lafleur',
    description: 'Plongez dans la magie du carnaval haïtien, l\'une des fêtes populaires les plus vibrantes des Caraïbes. Musique, costumes, défilés et traditions.',
    coverUrl: 'local:6',
    country: 'Haïti',
    category: 'Arts',
    style: 'Non-fiction',
    isPremium: false,
    unlockCost: 0,
    rating: 4.9,
    totalRatings: 421,
    pages: 150,
    content: Array.from({ length: 10 }, (_, i) => `Le carnaval haïtien éclate chaque année dans une explosion de couleurs et de sons. Les rues de Port-au-Prince se transforment en scène géante...`),
    type: 'text',
  },
];

function mapBook(rb: Record<string, unknown>): Book {
  const rawType = String(rb.type ?? 'text').toLowerCase();
  const type = rawType === 'pdf' || rawType === 'epub' ? rawType : 'text';

  return {
    id: rb.id as string,
    title: rb.title as string,
    author: rb.author as string,
    description: rb.description as string,
    coverUrl: rb.cover_url as string,
    country: rb.country as string,
    category: rb.category as string,
    style: rb.style as string,
    isPremium: rb.is_premium as boolean,
    unlockCost: rb.unlock_cost as number,
    rating: (rb.rating as number) || 0,
    totalRatings: (rb.total_ratings as number) || 0,
    pages: (rb.pages as number) || 0,
    content: (rb.content as string[]) || [],
    type: type as 'text' | 'pdf' | 'epub',
    pdfUrl: rb.pdf_url as string | undefined,
    epubUrl: rb.epub_url as string | undefined,
  };
}

// Résoudre la cover : locale (require) ou URL distante
export function resolveBookCover(coverUrl: string): { uri: string } | number {
  if (coverUrl?.startsWith('local:')) {
    const id = coverUrl.replace('local:', '');
    const local = BOOK_COVER_MAP[id];
    if (local) return local;
  }
  return { uri: coverUrl };
}

export async function getAllBooks(): Promise<Book[]> {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error || !data) return mockBooks;
    return data.map(mapBook);
  } catch {
    return mockBooks;
  }
}

export async function getFeaturedBooks(): Promise<Book[]> {
  const all = await getAllBooks();
  return all.slice(0, 5);
}

const PAGE_SIZE = 12;

export interface PaginatedResult<T> {
  data: T[];
  hasMore: boolean;
  total: number;
}

export async function getPaginatedBooks(
  page: number = 0,
  filters?: {
    search?: string;
    category?: string;
    country?: string;
    style?: string;
  }
): Promise<PaginatedResult<Book>> {
  try {
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    }
    if (filters?.category) query = query.eq('category', filters.category);
    if (filters?.country) query = query.eq('country', filters.country);
    if (filters?.style) query = query.eq('style', filters.style);

    const { data, error, count } = await query;

    if (error) {
      const filtered = mockBooks.filter(b => {
        if (filters?.search) {
          const q = filters.search.toLowerCase();
          if (!b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q)) return false;
        }
        if (filters?.category && b.category !== filters.category) return false;
        return true;
      });
      return { data: filtered, hasMore: false, total: filtered.length };
    }

    const mapped = (data || []).map(mapBook);
    const total = count || 0;
    return { data: mapped, hasMore: (page + 1) * PAGE_SIZE < total, total };
  } catch {
    return { data: mockBooks, hasMore: false, total: mockBooks.length };
  }
}

export async function getBookById(id: string): Promise<Book | null> {
  const mock = mockBooks.find(b => b.id === id);
  try {
    const { data, error } = await supabase.from('books').select('*').eq('id', id).single();
    if (error || !data) return mock ?? null;
    return mapBook(data as Record<string, unknown>);
  } catch {
    return mock ?? null;
  }
}
