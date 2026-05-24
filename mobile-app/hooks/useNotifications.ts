import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import {
  registerForPushNotifications,
  clearBadge,
} from '@/lib/notificationService';

export function useNotifications() {
  const notificationListener = useRef<Notifications.EventSubscription>();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Enregistrement du token push
    registerForPushNotifications();
    // Vider le badge à l'ouverture
    clearBadge();

    // Notification reçue pendant que l'app est ouverte
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      const data = notification.request.content.data;
      console.log('📬 Notification reçue:', data);
    });

    // Utilisateur a cliqué sur la notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as Record<string, string>;
      clearBadge();

      // Naviguer vers le bon écran selon le type
      if (data?.type === 'new_book' && data?.bookId) {
        router.push(`/book/${data.bookId}` as never);
      } else if (data?.type === 'reading_reminder') {
        router.push('/(tabs)/library' as never);
      } else if (data?.type === 'quiz_ready') {
        router.push('/(tabs)/catalogue' as never);
      }
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);
}
