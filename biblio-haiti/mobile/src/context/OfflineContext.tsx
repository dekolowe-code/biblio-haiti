import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { STORAGE_KEYS, CACHE_CONFIG } from '../constants';

interface OfflineBook {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  local_path: string;
  downloaded_at: string;
  expires_at: string;
  file_size: number;
}

interface OfflineContextType {
  offlineBooks: OfflineBook[];
  isDownloading: boolean;
  downloadProgress: number;
  downloadBook: (book: any, pdfUrl: string) => Promise<void>;
  removeOfflineBook: (bookId: string) => Promise<void>;
  isBookOffline: (bookId: string) => boolean;
  getOfflineBookPath: (bookId: string) => string | null;
  clearExpiredBooks: () => Promise<void>;
  getTotalCacheSize: () => Promise<number>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [offlineBooks, setOfflineBooks] = useState<OfflineBook[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  useEffect(() => {
    loadOfflineBooks();
  }, []);

  async function loadOfflineBooks() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_BOOKS);
      if (stored) {
        setOfflineBooks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading offline books:', error);
    }
  }

  async function saveOfflineBooks(books: OfflineBook[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_BOOKS, JSON.stringify(books));
      setOfflineBooks(books);
    } catch (error) {
      console.error('Error saving offline books:', error);
    }
  }

  async function downloadBook(book: any, pdfUrl: string) {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const bookDir = `${FileSystem.documentDirectory}books/${book.id}`;
      const dirInfo = await FileSystem.getInfoAsync(bookDir);
      
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(bookDir, { intermediates: true });
      }

      const localPath = `${bookDir}/${book.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;

      // Download with progress tracking
      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        localPath,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();

      if (result && result.uri) {
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        
        const offlineBook: OfflineBook = {
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
          local_path: result.uri,
          downloaded_at: new Date().toISOString(),
          expires_at: calculateExpiryDate(book.access_type).toISOString(),
          file_size: fileInfo.size || 0,
        };

        const updatedBooks = [...offlineBooks.filter(b => b.id !== book.id), offlineBook];
        
        // Check cache limit
        if (updatedBooks.length > CACHE_CONFIG.MAX_OFFLINE_BOOKS) {
          // Remove oldest book
          updatedBooks.sort((a, b) => 
            new Date(a.downloaded_at).getTime() - new Date(b.downloaded_at).getTime()
          );
          const oldest = updatedBooks.shift();
          if (oldest) {
            await removeFile(oldest.local_path);
          }
        }

        await saveOfflineBooks(updatedBooks);
        setDownloadProgress(1);
      }
    } catch (error) {
      console.error('Error downloading book:', error);
      throw error;
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  }

  function calculateExpiryDate(accessType: string): Date {
    const now = new Date();
    switch (accessType) {
      case 'rent_24h':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'rent_7d':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'rent_30d':
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      case 'purchase':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year for purchases
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default 24h
    }
  }

  async function removeOfflineBook(bookId: string) {
    try {
      const book = offlineBooks.find(b => b.id === bookId);
      if (book) {
        await removeFile(book.local_path);
        const updatedBooks = offlineBooks.filter(b => b.id !== bookId);
        await saveOfflineBooks(updatedBooks);
      }
    } catch (error) {
      console.error('Error removing offline book:', error);
    }
  }

  async function removeFile(path: string) {
    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(path);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  function isBookOffline(bookId: string): boolean {
    return offlineBooks.some(b => b.id === bookId && !isExpired(b));
  }

  function isExpired(book: OfflineBook): boolean {
    return new Date(book.expires_at) < new Date();
  }

  function getOfflineBookPath(bookId: string): string | null {
    const book = offlineBooks.find(b => b.id === bookId);
    if (book && !isExpired(book)) {
      return book.local_path;
    }
    return null;
  }

  async function clearExpiredBooks() {
    try {
      const expiredBooks = offlineBooks.filter(isExpired);
      
      for (const book of expiredBooks) {
        await removeFile(book.local_path);
      }

      const updatedBooks = offlineBooks.filter(b => !isExpired(b));
      await saveOfflineBooks(updatedBooks);
    } catch (error) {
      console.error('Error clearing expired books:', error);
    }
  }

  async function getTotalCacheSize(): Promise<number> {
    let totalSize = 0;
    
    for (const book of offlineBooks) {
      const fileInfo = await FileSystem.getInfoAsync(book.local_path);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize;
  }

  const value: OfflineContextType = {
    offlineBooks,
    isDownloading,
    downloadProgress,
    downloadBook,
    removeOfflineBook,
    isBookOffline,
    getOfflineBookPath,
    clearExpiredBooks,
    getTotalCacheSize,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

export function useOffline() {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

export default OfflineContext;
