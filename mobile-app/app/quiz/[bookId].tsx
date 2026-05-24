import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Trophy, TrendingUp } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInRight, FadeOutLeft, FadeInUp } from 'react-native-reanimated';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { getBookById } from '@/lib/bookService';
import { generateQuizForBook } from '@/lib/aiService';
import { saveQuizScore, starsLabel } from '@/lib/leaderboardService';
import { Book, QuizQuestion } from '@/types';

export default function QuizScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [finished, setFinished] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [savingScore, setSavingScore] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);

  useEffect(() => {
    if (!bookId) return;
    const load = async () => {
      const b = await getBookById(bookId);
      setBook(b);
      if (b) {
        const qs = await generateQuizForBook(b.title, b.category);
        setQuestions(qs.map((q, i) => ({ ...q, id: String(i) })));
        setAnswers(new Array(qs.length).fill(null));
      }
      setLoading(false);
    };
    load();
  }, [bookId]);

  const current = questions[currentIdx];
  const score = answers.filter((a, i) => a === questions[i]?.correctIndex).length;

  const handleSelect = async (optionIdx: number) => {
    if (selected !== null) return;
    setSelected(optionIdx);
    const newAnswers = [...answers];
    newAnswers[currentIdx] = optionIdx;
    setAnswers(newAnswers);
    const correct = optionIdx === current.correctIndex;
    await Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
  };

  const handleNext = async () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    } else {
      setFinished(true);
      // Sauvegarder le score dans Supabase et attribuer les étoiles
      if (user && book && !scoreSaved) {
        setSavingScore(true);
        const finalScore = [...answers].filter((a, i) => a === questions[i]?.correctIndex).length;
        const result = await saveQuizScore({
          bookId: book.id,
          bookTitle: book.title,
          category: book.category,
          score: finalScore,
          total: questions.length,
        });
        setStarsEarned(result.starsEarned);
        setScoreSaved(true);
        setSavingScore(false);
        if (result.starsEarned > 0) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelected(null);
    setAnswers(new Array(questions.length).fill(null));
    setFinished(false);
    setScoreSaved(false);
    setStarsEarned(0);
  };

  const getOptionStyle = (idx: number) => {
    if (selected === null) return { backgroundColor: colors.surface, borderColor: colors.border };
    if (idx === current.correctIndex) return { backgroundColor: colors.success + '20', borderColor: colors.success };
    if (idx === selected && selected !== current.correctIndex)
      return { backgroundColor: colors.error + '20', borderColor: colors.error };
    return { backgroundColor: colors.surface, borderColor: colors.border };
  };

  if (loading) return <Spinner fullScreen />;

  if (questions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>🤔</Text>
        <Text style={[styles.title, { color: colors.text }]}>Quiz non disponible</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Aucune question n'a pu être générée pour ce livre.
        </Text>
        <Button title="Retour" onPress={() => router.back()} style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const starInfo = starsLabel(pct);

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={[styles.container, { paddingTop: 32 }]}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.resultsHeader}>
            <Text style={{ fontSize: 72, textAlign: 'center', marginBottom: 8 }}>{starInfo.emoji}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{starInfo.label}</Text>

            {/* Score principal */}
            <View style={[styles.scoreCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
              <Text style={[styles.scoreValue, { color: colors.primary }]}>{score}/{questions.length}</Text>
              <Text style={[styles.scoreLabel, { color: colors.textSecondary }]}>{pct}% de bonnes réponses</Text>
            </View>

            {/* Étoiles gagnées */}
            {user && (
              <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                {savingScore ? (
                  <View style={styles.starsRow}>
                    <Spinner size="small" />
                    <Text style={[styles.starsText, { color: colors.textSecondary }]}>
                      Calcul des étoiles...
                    </Text>
                  </View>
                ) : (
                  <View style={[
                    styles.starsCard,
                    {
                      backgroundColor: starsEarned > 0 ? colors.accent + '18' : colors.surface,
                      borderColor: starsEarned > 0 ? colors.accent : colors.border,
                    },
                  ]}>
                    {starsEarned > 0 ? (
                      <>
                        <Text style={{ fontSize: 32 }}>⭐</Text>
                        <View>
                          <Text style={[styles.starsGained, { color: colors.accent }]}>
                            +{starsEarned} étoile{starsEarned > 1 ? 's' : ''} gagnée{starsEarned > 1 ? 's' : ''} !
                          </Text>
                          <Text style={[styles.starsSubText, { color: colors.textSecondary }]}>
                            Ajoutées à votre profil
                          </Text>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text style={{ fontSize: 24 }}>💪</Text>
                        <Text style={[styles.starsSubText, { color: colors.textSecondary, flex: 1 }]}>
                          Obtenez 60% ou plus pour gagner des étoiles !
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </Animated.View>
            )}

            {/* Stars visuelles */}
            <View style={styles.starVisuals}>
              {[1, 2, 3, 4, 5].map(i => (
                <Text key={i} style={{ fontSize: 24, opacity: i <= starInfo.stars ? 1 : 0.2 }}>⭐</Text>
              ))}
            </View>
          </Animated.View>

          {/* Récapitulatif questions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Récapitulatif</Text>
          {questions.map((q, i) => {
            const correct = answers[i] === q.correctIndex;
            return (
              <View key={i} style={[
                styles.summaryItem,
                {
                  backgroundColor: correct ? colors.success + '10' : colors.error + '10',
                  borderColor: correct ? colors.success : colors.error,
                },
              ]}>
                <Text style={{ fontSize: 18 }}>{correct ? '✅' : '❌'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.summaryQ, { color: colors.text }]} numberOfLines={2}>{q.text}</Text>
                  <Text style={[styles.summaryA, { color: colors.textSecondary }]}>
                    Réponse : {q.options[q.correctIndex]}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Actions */}
          <View style={styles.actions}>
            <Button title="↺ Refaire" onPress={handleRestart} variant="secondary" style={{ flex: 1 }} />
            <Button title="📖 Retour livre" onPress={() => router.back()} style={{ flex: 1 }} />
          </View>

          {/* Lien classement */}
          <TouchableOpacity
            onPress={() => router.push('/leaderboard' as never)}
            style={[styles.leaderboardBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Trophy size={18} color={colors.accent} />
            <Text style={[styles.leaderboardBtnText, { color: colors.text }]}>Voir le classement</Text>
            <TrendingUp size={16} color={colors.textSecondary} />
          </TouchableOpacity>

          <View style={{ height: 32 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          {book?.title ?? 'Quiz'}
        </Text>
        <Text style={[styles.questionCount, { color: colors.textSecondary }]}>
          {currentIdx + 1}/{questions.length}
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
        <ProgressBar progress={((currentIdx + 1) / questions.length) * 100} color={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Animated.View key={currentIdx} entering={FadeInRight} exiting={FadeOutLeft}>
          <View style={[styles.questionCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.questionNum, { color: colors.primary }]}>Question {currentIdx + 1}</Text>
            <Text style={[styles.questionText, { color: colors.text }]}>{current.text}</Text>
          </View>

          <View style={styles.options}>
            {current.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleSelect(idx)}
                disabled={selected !== null}
                activeOpacity={0.8}
                style={[styles.option, getOptionStyle(idx)]}
              >
                <View style={[styles.optionIndex, { backgroundColor: colors.border }]}>
                  <Text style={[styles.optionIndexText, { color: colors.text }]}>
                    {String.fromCharCode(65 + idx)}
                  </Text>
                </View>
                <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected !== null && (
            <Button
              title={currentIdx < questions.length - 1 ? 'Question suivante →' : 'Voir les résultats'}
              onPress={handleNext}
              fullWidth
              style={{ marginTop: 8 }}
            />
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600' },
  questionCount: { fontSize: 14, fontWeight: '600' },
  container: { padding: 16 },
  questionCard: { borderRadius: 16, padding: 20, marginBottom: 20 },
  questionNum: { fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.5 },
  questionText: { fontSize: 17, fontWeight: '600', lineHeight: 26 },
  options: { gap: 10, marginBottom: 20 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, gap: 12 },
  optionIndex: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  optionIndexText: { fontSize: 13, fontWeight: '700' },
  optionText: { flex: 1, fontSize: 14, fontWeight: '500' },
  resultsHeader: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  scoreCard: { borderRadius: 16, borderWidth: 1.5, padding: 24, alignItems: 'center', marginBottom: 16, width: '100%' },
  scoreValue: { fontSize: 52, fontWeight: '800' },
  scoreLabel: { fontSize: 15, marginTop: 4 },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 16 },
  starsText: { fontSize: 13 },
  starsCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14, borderWidth: 1.5, width: '100%', marginBottom: 16,
  },
  starsGained: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
  starsSubText: { fontSize: 12 },
  starVisuals: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
  summaryItem: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
    padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8,
  },
  summaryQ: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  summaryA: { fontSize: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 24, marginBottom: 12 },
  leaderboardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  leaderboardBtnText: { fontSize: 14, fontWeight: '600' },
});
