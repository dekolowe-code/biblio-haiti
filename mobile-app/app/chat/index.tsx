import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
  ActivityIndicator, Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Bot, Sparkles, BookOpen, RefreshCw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp, FadeInLeft, FadeInRight } from 'react-native-reanimated';
import { router } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { sendChatMessage, getLibraryContext } from '@/lib/aiService';
import { Message } from '@/types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  { icon: '📚', label: 'Recommande-moi un livre', prompt: 'Peux-tu me recommander un livre à lire selon mes goûts ?' },
  { icon: '🎯', label: 'Livre pour enfant', prompt: 'Quel livre de jeunesse conseilles-tu pour un enfant de 10 ans ?' },
  { icon: '🇭🇹', label: 'Histoire d\'Haïti', prompt: 'Quels livres sur l\'histoire d\'Haïti sont disponibles ?' },
  { icon: '📖', label: 'Roman populaire', prompt: 'Quel est le roman le plus populaire du catalogue ?' },
];

export default function ChatScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const ensureSystemPrompt = useCallback(async () => {
    if (systemPrompt) return systemPrompt;
    const ctx = await getLibraryContext();
    setSystemPrompt(ctx);
    return ctx;
  }, [systemPrompt]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    Keyboard.dismiss();
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const ctx = await ensureSystemPrompt();
      const history: Message[] = [
        { role: 'system', content: ctx },
        ...messages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: trimmed },
      ];

      const reply = await sendChatMessage(history);

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Désolé, je n'ai pas pu répondre. Vérifiez votre connexion et réessayez.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [loading, messages, ensureSystemPrompt]);

  const handleReset = () => {
    setMessages([]);
    setSystemPrompt(null);
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isUser = item.role === 'user';
    return (
      <Animated.View
        entering={isUser ? FadeInRight.duration(300) : FadeInLeft.duration(300)}
        style={[styles.messageRow, isUser && styles.messageRowUser]}
      >
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Bot size={16} color="#fff" />
          </View>
        )}
        <View style={[
          styles.bubble,
          isUser
            ? { backgroundColor: colors.primary, borderBottomRightRadius: 4 }
            : { backgroundColor: colors.surface, borderBottomLeftRadius: 4, borderColor: colors.border, borderWidth: 1 },
        ]}>
          <Text style={[
            styles.bubbleText,
            { color: isUser ? '#ffffff' : colors.text },
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.65)' : colors.textSecondary },
          ]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.headerAvatar, { backgroundColor: colors.primary }]}>
            <Sparkles size={18} color="#fff" />
          </View>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Assistant Biblio</Text>
            <Text style={[styles.headerStatus, { color: colors.success }]}>
              {loading ? 'En train de répondre...' : '● En ligne'}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleReset} style={styles.headerBtn}>
          <RefreshCw size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={insets.bottom + 48}
      >
        {messages.length === 0 ? (
          <Animated.View entering={FadeInUp.duration(400)} style={styles.emptyState}>
            <View style={[styles.emptyAvatar, { backgroundColor: colors.primary + '18' }]}>
              <Sparkles size={40} color={colors.primary} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Bonjour{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''} ! 👋
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Je suis votre assistant IA Biblio Haïti. Je connais tous les livres du catalogue
              et peux vous aider à trouver votre prochaine lecture.
            </Text>

            <View style={styles.quickPrompts}>
              {QUICK_PROMPTS.map((q, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => sendMessage(q.prompt)}
                  style={[styles.quickPrompt, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 20 }}>{q.icon}</Text>
                  <Text style={[styles.quickPromptText, { color: colors.text }]}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + 220 }]}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListFooterComponent={
              loading ? (
                <Animated.View entering={FadeInLeft.duration(300)} style={styles.typingRow}>
                  <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                    <Bot size={16} color="#fff" />
                  </View>
                  <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.typingDots}>
                      {[0, 1, 2].map(i => (
                        <View key={i} style={[styles.dot, { backgroundColor: colors.primary }]} />
                      ))}
                    </View>
                  </View>
                </Animated.View>
              ) : null
            }
          />
        )}

        <View style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === 'ios' ? 28 : 20),
            zIndex: 20,
          },
        ]}>
          {messages.length > 0 && (
            <FlatList
              horizontal
              data={QUICK_PROMPTS}
              keyExtractor={q => q.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => sendMessage(item.prompt)}
                  style={[styles.chipBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={{ fontSize: 13 }}>{item.icon}</Text>
                  <Text style={[styles.chipText, { color: colors.text }]}>{item.label}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chips}
              style={{ marginBottom: 8 }}
            />
          )}

          <View style={styles.inputRow}>
            <View style={[styles.inputWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <BookOpen size={18} color={colors.textSecondary} style={{ marginLeft: 2 }} />
              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Posez une question sur nos livres..."
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { color: colors.text }]}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={() => sendMessage(input)}
                blurOnSubmit={false}
              />
              {input.length > 0 && (
                <Text style={[styles.charCount, { color: colors.textSecondary }]}>
                  {input.length}/500
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: input.trim() && !loading ? colors.primary : colors.border,
                },
              ]}
            >
              {loading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Send size={18} color="#fff" />
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  headerBtn: { padding: 6, borderRadius: 20 },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAvatar: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  headerStatus: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyAvatar: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', marginBottom: 10, textAlign: 'center' },
  emptySubtitle: {
    fontSize: 14, textAlign: 'center', lineHeight: 22,
    marginBottom: 28, paddingHorizontal: 8,
  },
  quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  quickPrompt: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1.5,
    maxWidth: '47%',
  },
  quickPromptText: { fontSize: 13, fontWeight: '500', flexShrink: 1 },
  messageList: { padding: 12, paddingBottom: 4, gap: 8 },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 8,
  },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bubble: {
    maxWidth: '78%',
    padding: 12,
    borderRadius: 18,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  timestamp: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  typingBubble: {
    padding: 14, borderRadius: 18,
    borderBottomLeftRadius: 4, borderWidth: 1,
  },
  typingDots: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, opacity: 0.6 },
  inputBar: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  chips: { paddingHorizontal: 2, gap: 8 },
  chipBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1, marginRight: 8,
  },
  chipText: { fontSize: 12, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 22,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    minHeight: 46,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  charCount: { fontSize: 10, alignSelf: 'flex-end', marginBottom: 1 },
  sendBtn: {
    width: 46, height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
