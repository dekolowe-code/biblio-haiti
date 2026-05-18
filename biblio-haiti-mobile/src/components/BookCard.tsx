import { View, Text, Image, Pressable } from 'react-native';
import { Star, Lock } from 'lucide-react-native';
import type { Book } from '../data/mockData';
import { useLibrary } from '../context/LibraryContext';
import { useRouter } from 'expo-router';

interface BookCardProps {
  book: Book;
  compact?: boolean;
}

export default function BookCard({ book, compact = false }: BookCardProps) {
  const router = useRouter();
  const { library } = useLibrary();
  const userBook = library.find(ub => ub.bookId === book.id);
  const isUnlocked = userBook?.isUnlocked || !book.isPremium;

  return (
    <Pressable
      onPress={() => router.push(`/livre/${book.id}`)}
      className={`flex-shrink-0 ${compact ? 'w-[110px]' : 'w-[120px]'}`}
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] }]}
    >
      <View className="relative">
        <Image
          source={{ uri: book.coverUrl }}
          className={`w-full aspect-[3/4] rounded-xl`}
          style={{ opacity: isUnlocked ? 1 : 0.6 }} // Grayscale workaround for RN
        />
        {!isUnlocked && book.isPremium && (
          <View className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
            <View className="bg-warning rounded-full px-2 py-1 flex-row items-center gap-1">
              <Lock size={12} color="white" />
              <Star size={12} color="white" fill="white" />
              <Text className="text-white font-poppins font-bold text-xs">{book.unlockCost}</Text>
            </View>
          </View>
        )}
      </View>
      <Text className="font-poppins font-semibold text-xs text-[#1A1A2E] mt-2 leading-tight" numberOfLines={2}>
        {book.title}
      </Text>
      <Text className="text-[10px] text-[#6B7280] mt-0.5" numberOfLines={1}>{book.author}</Text>
      <View className="flex-row items-center gap-1 mt-0.5">
        <Star size={12} color="#FAA307" fill="#FAA307" />
        <Text className="text-[10px] font-poppins font-semibold text-[#1A1A2E]">{book.rating}</Text>
      </View>
    </Pressable>
  );
}
