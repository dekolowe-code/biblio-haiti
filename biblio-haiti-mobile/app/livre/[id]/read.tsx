import { useState, useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Share2 } from 'lucide-react-native';
import { type Book, books as mockBooks } from '../../../src/data/mockData';
import { getAllBooks } from '../../../src/lib/bookService';
import { useLibrary } from '../../../src/context/LibraryContext';
import WebviewReader from '../../../src/components/readers/WebviewReader';

export default function ReadingScreen() {
  const { id: bookId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [book, setBook] = useState<Book | null>(mockBooks.find(b => b.id === bookId) || null);
  const [loading, setLoading] = useState(!book);
  const [progress, setProgress] = useState(0);
  const [localUrl, setLocalUrl] = useState<string>('');

  const { isUnlocked, updateProgress, getReadingProgress } = useLibrary();

  useEffect(() => {
    getAllBooks().then(async all => {
      const found = all.find(b => b.id === bookId);
      setBook(found || null);
      if (found) {
        // Init offline mode
        const { getLocalBookUrl } = await import('../../../src/lib/downloadService');
        const url = await getLocalBookUrl(found.id, found.fileUrl);
        setLocalUrl(url);
      }
      setLoading(false);
    });
  }, [bookId]);

  useEffect(() => {
    if (book) {
      if (!isUnlocked(book.id) && book.isPremium) {
        Alert.alert('Accès refusé', 'Vous devez débloquer ce livre pour le lire.', [
          { text: 'Retour', onPress: () => router.back() }
        ]);
        return;
      }
      const savedProgress = getReadingProgress(book.id);
      // If we saved progress as page number, we'd need to convert, but for webview we might just track it simply.
    }
  }, [book, isUnlocked]);

  const handleProgress = (percent: number) => {
    setProgress(percent);
    if (book) {
      // Simplification: we save the percentage as the "page" in library context for EPUB
      // Or we can just calculate an estimated page
      const estimatedPage = Math.max(1, Math.round((percent / 100) * book.pages));
      const isFinished = percent > 95;
      updateProgress(book.id, estimatedPage, isFinished);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background gap-3">
        <ActivityIndicator size="large" color="#C41E3A" />
        <Text className="text-sm text-[#6B7280] font-inter">Chargement du livre...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-[#6B7280] font-inter">Livre non trouvé</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="pt-12 pb-2 px-4 flex-row items-center justify-between border-b border-gray-100 bg-white z-10">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#1A1A2E" />
        </Pressable>
        <View className="flex-1 items-center px-4">
          <Text className="font-poppins font-semibold text-sm text-[#1A1A2E]" numberOfLines={1}>{book.title}</Text>
          <Text className="text-[10px] text-[#6B7280] font-inter mt-0.5">{book.author}</Text>
        </View>
        <Pressable className="p-2 -mr-2">
          <Share2 size={20} color="#1A1A2E" />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-1 bg-gray-100">
        <View className="h-full bg-secondary" style={{ width: `${progress}%` }} />
      </View>

      {/* Reader */}
      <View className="flex-1">
        <WebviewReader 
          url={book.fileUrl} 
          type={book.type} 
          onProgress={handleProgress} 
          title={book.title}
        />
      </View>
    </View>
  );
}
