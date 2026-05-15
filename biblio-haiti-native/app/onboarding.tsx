import { useState, useRef } from 'react'
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Image } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { setOnboardingComplete, requestNotificationPermission, scheduleReadingReminder, createNotificationChannel } from '@/data/mockData'

const { width, height } = Dimensions.get('window')

const slides = [
  {
    title: 'Bienvenue sur Biblio-Haïti',
    subtitle: 'Ta bibliothèque culturelle haïtienne',
    description: 'Découvre des centaines de livres sur la culture, l\'histoire et les traditions d\'Haïti.',
    gradient: ['#9B1B30', '#C41E3A'],
  },
  {
    title: 'Lis où tu veux',
    subtitle: 'Accès illimité',
    description: 'Emporte ta bibliothèque partout avec toi. Lis hors ligne, sans connexion internet.',
    gradient: ['#E85D04', '#FAA307'],
  },
  {
    title: 'Gagne des étoiles',
    subtitle: 'Apprends en t\'amusant',
    description: 'Réponds aux quiz, complète tes lectures et gagne des récompenses.',
    gradient: ['#3A86FF', '#2EC4B6'],
  },
]

export default function OnboardingScreen() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const scaleAnim = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scaleAnim.value) }],
  }))

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
      scaleAnim.value = 0.95
      setTimeout(() => { scaleAnim.value = 1 }, 150)
    } else {
      handleComplete()
    }
  }

  const handleComplete = async () => {
    setOnboardingComplete()
    const granted = await requestNotificationPermission()
    if (granted) {
      await createNotificationChannel()
      await scheduleReadingReminder(19, 0)
    }
    router.replace('/home')
  }

  const slide = slides[currentIndex]

  return (
    <View style={[styles.container, { background: `linear-gradient(180deg, ${slide.gradient[0]}, ${slide.gradient[1]})` }]}>
      <StatusBar style="light" />
      
      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={handleComplete}
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Content */}
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.illustrationContainer}>
          <View style={[styles.illustration, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Text style={styles.illustrationText}>📚</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
      </Animated.View>

      {/* Pagination */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>
          {currentIndex === slides.length - 1 ? 'Commencer' : 'Suivant'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    marginBottom: 40,
  },
  illustration: {
    width: 180,
    height: 180,
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationText: {
    fontSize: 80,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    backgroundColor: 'white',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  nextButton: {
    backgroundColor: 'white',
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#C41E3A',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
