import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

Notifications.setNotificationHandler({
  handleNotificationRequest: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }
  },
})

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }
    
    return finalStatus === 'granted'
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return false
  }
}

export async function scheduleReadingReminder(hour: number = 19, minute: number = 0): Promise<void> {
  try {
    // Cancel any existing reminders
    await Notifications.cancelAllScheduledNotificationsAsync()
    
    // Schedule daily reminder
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "📚 Temps de lecture!",
        body: "N'oublie pas de lire ton livre du jour sur Biblio-Haïti. Gagne des étoiles et apprends!",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        hour,
        minute,
        repeats: true,
        channelId: 'reading-reminders',
      },
    })
  } catch (error) {
    console.error('Error scheduling reminder:', error)
  }
}

export async function createNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reading-reminders', {
      name: 'Rappels de lecture',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C41E3A',
      sound: 'default',
    })
  }
}

export async function sendInstantNotification(title: string, body: string) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null,
    })
  } catch (error) {
    console.error('Error sending notification:', error)
  }
}
