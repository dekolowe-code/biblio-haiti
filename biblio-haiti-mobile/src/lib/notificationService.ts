import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FAA307',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (e) {
      console.warn('Could not fetch push token', e);
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
  }

  return token;
}

export async function scheduleReadingReminder() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "C'est l'heure de lire ! 📚",
      body: "Continuez votre livre en cours pour gagner des étoiles.",
    },
    trigger: {
      seconds: 60 * 60 * 24, // Rappel dans 24h
      repeats: false,
    },
  });
}
