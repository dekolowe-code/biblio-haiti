import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, Switch, TouchableOpacity,
  StyleSheet, Alert, Modal, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft, Bell, BellOff, BookOpen, Brain,
  Clock, Send, ChevronDown, ChevronUp, Info,
} from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  registerForPushNotifications,
  getNotificationPrefs,
  saveNotificationPrefs,
  scheduleReadingReminder,
  cancelReadingReminder,
  getNotificationLog,
  sendLocalNotification,
  NotificationPrefs,
  NotificationLogEntry,
} from '@/lib/notificationService';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

export default function NotificationsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    newBooks: true,
    readingReminders: false,
    quizAvailable: true,
    reminderHour: 20,
    reminderMinute: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [log, setLog] = useState<NotificationLogEntry[]>([]);
  const [logLoading, setLogLoading] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [testSending, setTestSending] = useState(false);

  const load = useCallback(async () => {
    const [savedPrefs, token] = await Promise.all([
      getNotificationPrefs(),
      registerForPushNotifications(),
    ]);
    if (savedPrefs) setPrefs(savedPrefs);
    setPushToken(token);
    setPermissionGranted(!!token);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleSave = async (newPrefs: NotificationPrefs) => {
    setSaving(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrefs(newPrefs);
    await saveNotificationPrefs(newPrefs);

    if (newPrefs.readingReminders) {
      await scheduleReadingReminder(newPrefs.reminderHour, newPrefs.reminderMinute);
    } else {
      await cancelReadingReminder();
    }
    setSaving(false);
  };

  const togglePref = (key: keyof Omit<NotificationPrefs, 'reminderHour' | 'reminderMinute'>) => {
    if (!permissionGranted) {
      Alert.alert(
        'Permission requise',
        'Activez les notifications dans les paramètres de votre téléphone pour recevoir des alertes.',
        [{ text: 'OK' }]
      );
      return;
    }
    handleSave({ ...prefs, [key]: !prefs[key] });
  };

  const handleTimeChange = (hour: number, minute: number) => {
    const updated = { ...prefs, reminderHour: hour, reminderMinute: minute };
    setShowTimePicker(false);
    handleSave(updated);
  };

  const handleTestNotification = async () => {
    setTestSending(true);
    await sendLocalNotification(
      '📚 Test — Biblio Haïti',
      'Vos notifications fonctionnent parfaitement ! 🎉',
      { type: 'test' }
    );
    setTestSending(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const loadLog = async () => {
    setLogLoading(true);
    const data = await getNotificationLog();
    setLog(data);
    setLogLoading(false);
  };

  const toggleLog = () => {
    const next = !showLog;
    setShowLog(next);
    if (next && log.length === 0) loadLog();
  };

  const formatHour = (h: number) => h.toString().padStart(2, '0');
  const formatMin = (m: number) => m.toString().padStart(2, '0');
  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

  const NOTIF_TYPES: Record<string, { emoji: string; label: string }> = {
    new_book: { emoji: '📚', label: 'Nouveau livre' },
    reading_reminder: { emoji: '📖', label: 'Rappel lecture' },
    quiz_ready: { emoji: '🧠', label: 'Quiz disponible' },
  };

  if (loading) return <Spinner fullScreen />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        {saving && <Spinner size="small" />}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        contentContainerStyle={{ padding: 16 }}
      >
        {/* Statut permission */}
        <Animated.View entering={FadeInUp.delay(0).duration(400)}>
          <View style={[
            styles.statusCard,
            {
              backgroundColor: permissionGranted ? colors.success + '15' : colors.error + '15',
              borderColor: permissionGranted ? colors.success : colors.error,
            },
          ]}>
            <View style={[styles.statusIcon, { backgroundColor: permissionGranted ? colors.success : colors.error }]}>
              {permissionGranted
                ? <Bell size={20} color="#fff" />
                : <BellOff size={20} color="#fff" />
              }
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: permissionGranted ? colors.success : colors.error }]}>
                {permissionGranted ? 'Notifications activées' : 'Notifications désactivées'}
              </Text>
              <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
                {permissionGranted
                  ? 'Votre appareil est prêt à recevoir des alertes.'
                  : 'Activez les notifications dans les réglages de votre téléphone.'}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Test de notification */}
        {permissionGranted && (
          <Animated.View entering={FadeInUp.delay(80).duration(400)} style={{ marginBottom: 20 }}>
            <Button
              title={testSending ? 'Envoi...' : '🔔 Envoyer une notification test'}
              onPress={handleTestNotification}
              loading={testSending}
              variant="secondary"
              fullWidth
            />
          </Animated.View>
        )}

        {/* Préférences */}
        <Animated.View entering={FadeInUp.delay(120).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PRÉFÉRENCES</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>

            <ToggleRow
              icon={<BookOpen size={18} color="#C41E3A" />}
              iconBg="#C41E3A15"
              title="Nouveaux livres"
              description="Soyez alerté dès qu'un livre est ajouté au catalogue"
              value={prefs.newBooks}
              onToggle={() => togglePref('newBooks')}
              colors={colors}
              borderBottom
            />

            <ToggleRow
              icon={<Brain size={18} color="#8b5cf6" />}
              iconBg="#8b5cf615"
              title="Quiz disponibles"
              description="Notification quand un nouveau quiz est publié"
              value={prefs.quizAvailable}
              onToggle={() => togglePref('quizAvailable')}
              colors={colors}
              borderBottom
            />

            <ToggleRow
              icon={<Clock size={18} color="#f59e0b" />}
              iconBg="#f59e0b15"
              title="Rappel de lecture"
              description="Rappel quotidien pour maintenir votre habitude"
              value={prefs.readingReminders}
              onToggle={() => togglePref('readingReminders')}
              colors={colors}
            />

            {prefs.readingReminders && (
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={[styles.timePickerRow, { backgroundColor: colors.primary + '10', borderTopColor: colors.border }]}
              >
                <Clock size={16} color={colors.primary} />
                <Text style={[styles.timeText, { color: colors.text }]}>
                  Heure du rappel :
                </Text>
                <Text style={[styles.timeValue, { color: colors.primary }]}>
                  {formatHour(prefs.reminderHour)}h{formatMin(prefs.reminderMinute)}
                </Text>
                <ChevronDown size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        {/* Token push (info) */}
        {pushToken && (
          <Animated.View entering={FadeInUp.delay(200).duration(400)}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>APPAREIL</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.tokenRow}>
                <Info size={16} color={colors.textSecondary} />
                <Text style={[styles.tokenLabel, { color: colors.textSecondary }]}>Token push enregistré</Text>
              </View>
              <Text style={[styles.tokenValue, { color: colors.text }]} numberOfLines={2}>
                {pushToken.replace('ExponentPushToken[', '').replace(']', '').substring(0, 30)}...
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Historique (admins) */}
        {user?.role === 'admin' && (
          <Animated.View entering={FadeInUp.delay(280).duration(400)}>
            <TouchableOpacity
              onPress={toggleLog}
              style={[styles.logToggle, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Send size={16} color={colors.primary} />
              <Text style={[styles.logToggleText, { color: colors.text }]}>
                Historique des envois
              </Text>
              {showLog
                ? <ChevronUp size={16} color={colors.textSecondary} />
                : <ChevronDown size={16} color={colors.textSecondary} />
              }
            </TouchableOpacity>

            {showLog && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {logLoading ? (
                  <View style={{ padding: 20 }}><Spinner size="small" /></View>
                ) : log.length === 0 ? (
                  <Text style={[styles.emptyLog, { color: colors.textSecondary }]}>
                    Aucune notification envoyée pour l'instant.
                  </Text>
                ) : (
                  log.map((entry, i) => {
                    const type = NOTIF_TYPES[entry.type] ?? { emoji: '🔔', label: entry.type };
                    return (
                      <View
                        key={entry.id}
                        style={[
                          styles.logItem,
                          i < log.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 },
                        ]}
                      >
                        <Text style={{ fontSize: 24 }}>{type.emoji}</Text>
                        <View style={{ flex: 1 }}>
                          <View style={styles.logItemHeader}>
                            <Text style={[styles.logType, { color: colors.primary }]}>{type.label}</Text>
                            <Text style={[styles.logDate, { color: colors.textSecondary }]}>
                              {formatDate(entry.sent_at)}
                            </Text>
                          </View>
                          <Text style={[styles.logBody, { color: colors.text }]} numberOfLines={2}>
                            {entry.body}
                          </Text>
                          <Text style={[styles.logRecipients, { color: colors.textSecondary }]}>
                            👥 {entry.recipients} destinataire{entry.recipients > 1 ? 's' : ''}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            )}
          </Animated.View>
        )}

        {/* Guide déploiement Edge Functions */}
        <Animated.View entering={FadeInUp.delay(360).duration(400)}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CONFIGURATION SERVEUR</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, padding: 14 }]}>
            <Text style={[styles.guideTitle, { color: colors.text }]}>
              🚀 Déployer les Edge Functions
            </Text>
            <Text style={[styles.guideStep, { color: colors.textSecondary }]}>
              1. Installez la CLI Supabase : <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>npm i -g supabase</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.textSecondary }]}>
              2. Liez votre projet : <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>supabase link</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.textSecondary }]}>
              3. Appliquez la migration SQL : <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>supabase db push</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.textSecondary }]}>
              4. Déployez les fonctions : <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>supabase functions deploy</Text>
            </Text>
            <Text style={[styles.guideStep, { color: colors.textSecondary }]}>
              5. Dans le dashboard Supabase → Database → Webhooks, créez un webhook sur la table <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>books</Text> événement INSERT pointant vers <Text style={[styles.code, { backgroundColor: colors.surface, color: colors.primary }]}>notify-new-book</Text>
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal sélection horaire */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} onPress={() => setShowTimePicker(false)} activeOpacity={1}>
          <View style={[styles.timeSheet, { backgroundColor: colors.card }]}>
            <Text style={[styles.timeSheetTitle, { color: colors.text }]}>Heure du rappel</Text>
            <View style={styles.timeColumns}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.timeColLabel, { color: colors.textSecondary }]}>Heure</Text>
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                  {HOURS.map(h => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => handleTimeChange(h, prefs.reminderMinute)}
                      style={[
                        styles.timeOption,
                        {
                          backgroundColor: prefs.reminderHour === h ? colors.primary : colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.timeOptionText, { color: prefs.reminderHour === h ? '#fff' : colors.text }]}>
                        {formatHour(h)}h
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.timeColLabel, { color: colors.textSecondary }]}>Minutes</Text>
                {MINUTES.map(m => (
                  <TouchableOpacity
                    key={m}
                    onPress={() => handleTimeChange(prefs.reminderHour, m)}
                    style={[
                      styles.timeOption,
                      {
                        backgroundColor: prefs.reminderMinute === m ? colors.primary : colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.timeOptionText, { color: prefs.reminderMinute === m ? '#fff' : colors.text }]}>
                      :{formatMin(m)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function ToggleRow({
  icon, iconBg, title, description, value, onToggle, colors, borderBottom,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  value: boolean;
  onToggle: () => void;
  colors: Record<string, string>;
  borderBottom?: boolean;
}) {
  return (
    <View style={[
      styles.toggleRow,
      borderBottom && { borderBottomColor: colors.border, borderBottomWidth: 1 },
    ]}>
      <View style={[styles.toggleIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.toggleTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.toggleDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: colors.primary }}
        thumbColor="#ffffff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, gap: 12,
  },
  backBtn: { padding: 4 },
  title: { flex: 1, fontSize: 20, fontWeight: '700' },
  sectionLabel: {
    fontSize: 11, fontWeight: '600', letterSpacing: 0.5,
    marginBottom: 8, marginTop: 20,
  },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 16,
  },
  statusIcon: {
    width: 42, height: 42, borderRadius: 21,
    alignItems: 'center', justifyContent: 'center',
  },
  statusTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  statusDesc: { fontSize: 12, lineHeight: 17 },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 12, padding: 14,
  },
  toggleIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  toggleTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  toggleDesc: { fontSize: 12, lineHeight: 17 },
  timePickerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, borderTopWidth: 1,
  },
  timeText: { fontSize: 13, fontWeight: '500', flex: 1 },
  timeValue: { fontSize: 16, fontWeight: '700' },
  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, paddingBottom: 4 },
  tokenLabel: { fontSize: 12 },
  tokenValue: { fontSize: 11, fontFamily: 'Courier New', paddingHorizontal: 12, paddingBottom: 12 },
  logToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  logToggleText: { flex: 1, fontSize: 14, fontWeight: '600' },
  emptyLog: { padding: 20, textAlign: 'center', fontSize: 13 },
  logItem: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
  logItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logType: { fontSize: 12, fontWeight: '700' },
  logDate: { fontSize: 11 },
  logBody: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  logRecipients: { fontSize: 11 },
  guideTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  guideStep: { fontSize: 13, lineHeight: 22, marginBottom: 8 },
  code: { fontSize: 12, paddingHorizontal: 5, borderRadius: 4 },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  timeSheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 44 },
  timeSheetTitle: { fontSize: 17, fontWeight: '700', marginBottom: 16 },
  timeColumns: { flexDirection: 'row', gap: 16 },
  timeColLabel: { fontSize: 12, fontWeight: '600', marginBottom: 10 },
  timeOption: {
    padding: 12, borderRadius: 10, borderWidth: 1,
    alignItems: 'center', marginBottom: 8,
  },
  timeOptionText: { fontSize: 15, fontWeight: '600' },
});
