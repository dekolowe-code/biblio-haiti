import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { OnboardingSlide } from '../../components/OnboardingSlide';

const { width, height } = Dimensions.get('window');

interface SlideData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

const slides: SlideData[] = [
  {
    id: '1',
    title: 'Biblio Haiti',
    description: 'Découvrez des milliers de livres en français et en kreyòl ayisyen. La bibliothèque numérique haïtienne à portée de main.',
    icon: '📚',
    color: colors.primary,
  },
  {
    id: '2',
    title: 'Auteurs Haïtiens',
    description: 'Valorisons notre culture ! Retrouvez les œuvres des plus grands auteurs haïtiens classiques et contemporains.',
    icon: '✍️',
    color: colors.secondary,
  },
  {
    id: '3',
    title: 'Gagnez des Points',
    description: 'Lisez, gagnez des points de fidélité et débloquez des livres gratuitement. Plus vous lisez, plus vous progressez !',
    icon: '🏆',
    color: colors.gold,
  },
  {
    id: '4',
    title: 'Lire, c\'est grandir',
    description: '"Li, se grandi" - Accédez à votre bibliothèque personnelle partout, hors ligne, avec une expérience de lecture personnalisée.',
    icon: '🌱',
    color: colors.success,
  },
];

export const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const flatListRef = React.useRef<FlatList>(null);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentSlide + 1 });
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderItem = ({ item }: { item: SlideData }) => (
    <OnboardingSlide 
      title={item.title} 
      description={item.description} 
      icon={item.icon}
      color={item.color}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentSlide(index);
        }}
      />
      
      {/* Indicateurs de progression */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentSlide && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Boutons d'action */}
      <View style={styles.buttonContainer}>
        {currentSlide < slides.length - 1 && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={handleNext} 
          style={[
            styles.nextButton,
            { backgroundColor: currentSlide === slides.length - 1 ? colors.success : colors.primary }
          ]}
        >
          <LinearGradient
            colors={
              currentSlide === slides.length - 1 
                ? [colors.success, '#059669'] 
                : [colors.primary, '#0030C0']
            }
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.nextButtonText}>
              {currentSlide === slides.length - 1 ? 'Commencer' : 'Suivant'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray[300],
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: colors.gray[500],
    fontSize: 16,
    fontWeight: '500',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  gradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
