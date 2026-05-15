import { useEffect } from 'react'
import { useRouter } from 'expo-router'
import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { hasSeenOnboarding } from '@/data/mockData'

export default function Index() {
  const router = useRouter()

  useEffect(() => {
    const checkOnboarding = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const seen = hasSeenOnboarding()
      router.replace(seen ? '/home' : '/onboarding')
    }
    checkOnboarding()
  }, [])

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#C41E3A" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9B1B30',
  },
})
