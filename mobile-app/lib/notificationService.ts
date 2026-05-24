import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowList: true,
  }),
});

// ─── Enregistrement du token ──────────────────────────────────────────────────

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications non disponibles sur émulateur');
    return null;
  }

  // Android : créer les canaux de notification
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('new-books', {
      name: 'Nouveaux livres',
      description: 'Notifications quand un nouveau livre est ajouté',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#C41E3A',
    });
    await Notifications.setNotificationChannelAsync('reading-reminder', {
      name: 'Rappel de lecture',
      description: 'Rappel quotidien pour lire',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: null,
    });
    await Notifications.setNotificationChannelAsync('quiz', {
      name: 'Quiz disponibles',
      description: 'Nouveau quiz disponible',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Demander les permissions
  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  // Obtenir le token Expo Push
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn('projectId EAS manquant dans app.json');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    await saveTokenToSupabase(token);
    return token;
  } catch (err) {
    console.error('Erreur token push:', err);
    return null;
  }
}

export async function saveTokenToSupabase(token: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  const platform = Platform.OS as 'ios' | 'android' | 'web';

  await supabase.from('push_tokens').upsert(
    {
      user_id: session.user.id,
      token,
      platform,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' }
  );
}

export async function deactivateTokenInSupabase(token: string): Promise<void> {
  await supabase
    .from('push_tokens')
    .update({ is_active: false })
    .eq('token', token);
}

// ─── Préférences de notification ─────────────────────────────────────────────

export interface NotificationPrefs {
  newBooks: boolean;
  readingReminders: boolean;
  quizAvailable: boolean;
  reminderHour: number;
  reminderMinute: number;
}

export async function getNotificationPrefs(): Promise<NotificationPrefs | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (!data) return {
    newBooks: true,
    readingReminders: false,
    quizAvailable: true,
    reminderHour: 20,
    reminderMinute: 0,
  };

  return {
    newBooks: data.new_books,
    readingReminders: data.reading_reminders,
    quizAvailable: data.quiz_available,
    reminderHour: data.reminder_hour,
    reminderMinute: data.reminder_minute,
  };
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('notification_preferences').upsert({
    user_id: session.user.id,
    new_books: prefs.newBooks,
    reading_reminders: prefs.readingReminders,
    quiz_available: prefs.quizAvailable,
    reminder_hour: prefs.reminderHour,
    reminder_minute: prefs.reminderMinute,
    updated_at: new Date().toISOString(),
  });

  // Sync du token push avec la préférence rappel
  const token = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas?.projectId ?? '',
  }).catch(() => null);

  if (token) {
    await supabase
      .from('push_tokens')
      .update({ reminder_enabled: prefs.readingReminders })
      .eq('token', token.data);
  }
}

// ─── Rappel local quotidien (fallback sans serveur) ───────────────────────────

export async function scheduleReadingReminder(hour: number, minute: number): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '📚 Biblio Haïti',
      body: "C'est l'heure de lire ! Continuez votre livre.",
      sound: false,
      data: { type: 'reading_reminder' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function cancelReadingReminder(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// ─── Notification locale immédiate (test / quiz) ──────────────────────────────

export async function sendLocalNotification(title: string, body: string, data?: Record<string, unknown>): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body, sound: true, data },
    trigger: null,
  });
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export async function setBadgeCount(count: number): Promise<void> {
  await Notifications.setBadgeCountAsync(count);
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}

// ─── Historique des notifications (depuis Supabase) ───────────────────────────

export interface NotificationLogEntry {
  id: string;
  type: string;
  title: string;
  body: string;
  recipients: number;
  sent_at: string;
}

export async function getNotificationLog(): Promise<NotificationLogEntry[]> {
  const { data, error } = await supabase
    .from('notification_log')
    .select('*')
    .order('sent_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];
  return data as NotificationLogEntry[];
}
