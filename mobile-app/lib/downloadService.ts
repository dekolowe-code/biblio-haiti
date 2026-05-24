import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

function getBooksDirCandidates(): string[] {
  const dirs = [FileSystem.documentDirectory, FileSystem.cacheDirectory].filter(Boolean) as string[];
  //@ts-expect-error expo-file-system may not declare storageDirectory
  if (FileSystem.storageDirectory) dirs.push(FileSystem.storageDirectory);
  return dirs;
}

async function resolveBooksDir(): Promise<string | null> {
  const candidates = getBooksDirCandidates();
  for (const base of candidates) {
    const booksDir = `${base}books/`;
    try {
      const info = await FileSystem.getInfoAsync(booksDir);
      if (!info.exists) {
        await FileSystem.makeDirectoryAsync(booksDir, { intermediates: true });
      }
      return booksDir;
    } catch {
      // ignore and try next candidate
    }
  }
  return null;
}

export async function ensureBooksDir(): Promise<void> {
  await resolveBooksDir();
}

export async function isBookDownloaded(bookId: string, type: string): Promise<boolean> {
  const BOOKS_DIR = await resolveBooksDir();
  if (!BOOKS_DIR) return false;
  const path = BOOKS_DIR + `${bookId}.${type}`;
  const info = await FileSystem.getInfoAsync(path);
  return info.exists;
}

export async function getLocalBookPath(bookId: string, type: string): Promise<string | null> {
  const BOOKS_DIR = await resolveBooksDir();
  if (!BOOKS_DIR) return null;
  const path = BOOKS_DIR + `${bookId}.${type}`;
  const info = await FileSystem.getInfoAsync(path);
  return info.exists ? path : null;
}

export async function downloadBook(
  bookId: string,
  url: string,
  type: string,
  onProgress: (progress: number) => void
): Promise<string> {
  const BOOKS_DIR = await resolveBooksDir();
  if (!BOOKS_DIR) throw new Error('Storage directory inaccessible');
  const localPath = BOOKS_DIR + `${bookId}.${type}`;

  const existing = await FileSystem.getInfoAsync(localPath);
  if (existing.exists) return localPath;

  let headers = {};
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers = { Authorization: `Bearer ${session.access_token}` };
    }
  } catch {
    headers = {};
  }

  const downloadResumable = FileSystem.createDownloadResumable(
    url,
    localPath,
    { headers },
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      if (totalBytesExpectedToWrite > 0) {
        onProgress(totalBytesWritten / totalBytesExpectedToWrite);
      }
    }
  );

  try {
    const result = await downloadResumable.downloadAsync();
    if (!result?.uri) throw new Error('Aucune URI retournée');
    return result.uri;
  } catch (error) {
    console.error('downloadBook failed (resumable):', { bookId, url, type, error, headers });
    try {
      const result = await FileSystem.downloadAsync(url, localPath, { headers });
      if (!result?.uri) throw new Error('Aucune URI retournée (fallback)');
      return result.uri;
    } catch (fallbackError) {
      console.error('downloadBook fallback failed:', { bookId, url, type, fallbackError, headers });
      const errorMessage = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
      throw new Error(`Téléchargement impossible: ${errorMessage}`);
    }
  }
}

export async function deleteDownloadedBook(bookId: string, type: string): Promise<void> {
  const BOOKS_DIR = await resolveBooksDir();
  if (!BOOKS_DIR) return;
  const path = BOOKS_DIR + `${bookId}.${type}`;
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) await FileSystem.deleteAsync(path);
}

export async function getDownloadedBooks(): Promise<string[]> {
  const BOOKS_DIR = await resolveBooksDir();
  if (!BOOKS_DIR) return [];
  const files = await FileSystem.readDirectoryAsync(BOOKS_DIR);
  return files.map(f => f.replace(/\.[^.]+$/, ''));
}
