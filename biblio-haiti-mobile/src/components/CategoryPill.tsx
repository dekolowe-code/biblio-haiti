import { Text, Pressable } from 'react-native';
import { BookOpen, FlaskConical, Baby, Bookmark, Clock, Palette } from 'lucide-react-native';
import { useRouter } from 'expo-router';

const iconMap: Record<string, any> = {
  'Littérature': BookOpen,
  'Sciences': FlaskConical,
  'Jeunesse': Baby,
  'Contes': Bookmark,
  'Histoire': Clock,
  'Arts': Palette,
};

interface CategoryPillProps {
  id: string;
  name: string;
  color: string;
  bgClass: string;
}

export default function CategoryPill({ name, color }: CategoryPillProps) {
  const router = useRouter();
  const Icon = iconMap[name] || BookOpen;

  return (
    <Pressable
      onPress={() => router.push(`/catalogue?category=${encodeURIComponent(name)}`)}
      className="rounded-full px-4 py-2.5 flex-row items-center gap-2 flex-shrink-0"
      style={({ pressed }) => [
        { backgroundColor: color },
        { opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }
      ]}
    >
      <Icon size={16} color="white" />
      <Text className="text-white font-poppins font-semibold text-xs">{name}</Text>
    </Pressable>
  );
}
