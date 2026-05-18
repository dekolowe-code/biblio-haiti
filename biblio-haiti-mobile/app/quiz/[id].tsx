import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Trophy, Star, RotateCcw, Home as HomeIcon, Check, X } from 'lucide-react-native';
import { getCompletedQuizzes, saveQuizResult } from '../../src/lib/starService';
import { getQuizzes, type Quiz } from '../../src/lib/quizService';
import { useAuth } from '../../src/context/AuthContext';
import Svg, { Circle } from 'react-native-svg';

export default function QuizPlayScreen() {
  const { id: quizId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, updateStars } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isFinished, setIsFinished] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuizzes().then(all => {
      const found = all.find(q => q.id === quizId);
      if (found) setQuiz(found);
      setLoading(false);
    });
    getCompletedQuizzes().then(completed => {
      if (completed.includes(quizId!)) setIsCompleted(true);
    });
  }, [quizId]);

  useEffect(() => {
    if (!hasStarted || isFinished) return;
    if (timeLeft <= 0) {
      handleAnswer(-1);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, hasStarted, isFinished]);

  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null || !quiz) return;
    setSelectedAnswer(answerIndex);

    const question = quiz.questions[currentQuestion];
    const isCorrect = answerIndex === question.correctIndex;
    if (isCorrect) setScore(s => s + 1);

    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        const finalScore = isCorrect ? score + 1 : score;
        const earned = (!isCompleted) ? Math.round((finalScore / quiz.questions.length) * quiz.starReward) : 0;
        setEarnedStars(earned);
        setIsFinished(true);
        
        if (!isCompleted && earned > 0) {
          saveQuizResult(quizId!, earned).then(success => {
            if (success && user) {
              updateStars(earned, `Récompense Quiz: ${quiz.title}`);
            }
          });
        }
      }
    }, 1500);
  }, [selectedAnswer, currentQuestion, quiz, score, quizId, user, updateStars, isCompleted]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#FAA307" />
      </View>
    );
  }

  if (!quiz) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-[#6B7280] font-inter">Quiz non trouvé</Text>
      </View>
    );
  }

  // Circular Timer Constants
  const size = 60;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (circumference * timeLeft) / 15;

  // 1. Quiz Intro Screen
  if (!hasStarted) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <View className="bg-white rounded-3xl p-6 elevation-md w-full max-w-sm items-center border border-gray-100">
          <View className="w-16 h-16 bg-[#3A86FF] rounded-2xl items-center justify-center mb-4">
            <Trophy size={32} color="white" />
          </View>
          <Text className="font-poppins font-bold text-xl text-[#1A1A2E] text-center">{quiz.title}</Text>
          <Text className="text-sm text-[#6B7280] font-inter text-center mt-2">
            Teste tes connaissances en {quiz.category.toLowerCase()} et gagne des étoiles!
          </Text>
          <View className="flex-row items-center justify-center gap-2 mt-4">
            <View className="bg-green-50 border border-green-200 px-3 py-1 rounded-full">
              <Text className="text-green-700 text-xs font-inter uppercase">
                {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
              </Text>
            </View>
            <View className="bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
              <Text className="text-blue-700 text-xs font-inter">{quiz.questions.length} questions</Text>
            </View>
          </View>

          {isCompleted && (
            <View className="mt-4 bg-yellow-50 text-yellow-800 border border-yellow-200 p-3 rounded-xl">
              <Text className="text-[10px] text-yellow-800 font-inter text-center">
                Vous avez déjà complété ce quiz. Vous pouvez le refaire, mais vous ne gagnerez pas de nouvelles étoiles.
              </Text>
            </View>
          )}

          {!isCompleted && (
            <View className="flex-row items-center justify-center gap-1 mt-4 bg-[#FFF8F0] rounded-xl py-2 px-4">
              <Star size={16} color="#FAA307" fill="#FAA307" />
              <Text className="font-poppins font-bold text-sm text-[#FAA307]">★ {quiz.starReward} étoiles à gagner</Text>
            </View>
          )}

          <Pressable
            onPress={() => {
              if (!user) {
                router.push('/login');
                return;
              }
              setHasStarted(true);
              setTimeLeft(15);
            }}
            className="w-full mt-6 py-3.5 bg-[#2EC4B6] rounded-xl items-center justify-center elevation-sm"
          >
            <Text className="text-white font-poppins font-bold text-sm">COMMENCER</Text>
          </Pressable>
          
          <Pressable
            onPress={() => router.replace('/quiz')}
            className="w-full mt-3 py-2 items-center"
          >
            <Text className="text-[#6B7280] font-inter text-xs">Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // 2. Quiz Finished Screen
  if (isFinished) {
    return (
      <View className="flex-1 items-center justify-center px-6 bg-background">
        <View className="items-center">
          <Trophy size={80} color="#FAA307" className="mb-4" />
          <Text className="font-poppins font-bold text-3xl text-[#1A1A2E] mt-2">
            {score}/{quiz.questions.length}
          </Text>
          
          <View className="flex-row items-center justify-center gap-2 mt-4">
            <Star size={24} color="#FAA307" fill="#FAA307" />
            <Text className="font-poppins font-bold text-xl text-[#FAA307]">★ +{earnedStars} étoiles gagnées!</Text>
          </View>
          
          <Text className="text-sm text-[#6B7280] font-inter text-center mt-3 px-6 leading-relaxed">
            {score === quiz.questions.length ? 'Parfait! Tu es un expert!' :
             score >= quiz.questions.length / 2 ? 'Bon travail! Continue comme ça!' :
             'Continue à apprendre!'}
          </Text>

          <View className="flex-row gap-3 mt-8 w-full max-w-xs">
            <Pressable
              onPress={() => {
                setHasStarted(false);
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setScore(0);
                setIsFinished(false);
                setEarnedStars(0);
              }}
              className="flex-1 py-3 border-2 border-secondary rounded-xl flex-row items-center justify-center gap-2"
            >
              <RotateCcw size={16} color="#C41E3A" />
              <Text className="text-secondary font-poppins font-semibold text-sm">REJOUER</Text>
            </Pressable>
            <Pressable
              onPress={() => router.replace('/quiz')}
              className="flex-1 py-3 bg-warning rounded-xl flex-row items-center justify-center gap-2"
            >
              <HomeIcon size={16} color="white" />
              <Text className="text-white font-poppins font-semibold text-sm">ACCUEIL</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  // 3. Quiz Question Play
  const question = quiz.questions[currentQuestion];
  const progressPercent = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <View className="flex-1 bg-background px-4 py-6">
      {/* Header */}
      <View className="flex-row items-center justify-between mt-8 mb-4">
        <Pressable onPress={() => router.replace('/quiz')} className="w-10 h-10 bg-white rounded-full items-center justify-center elevation-xs border border-gray-100">
          <X size={20} color="#1A1A2E" />
        </Pressable>
        <Text className="text-xs font-inter text-[#6B7280]">Question {currentQuestion + 1}/{quiz.questions.length}</Text>
      </View>

      {/* Progress Bar */}
      <View className="w-full h-2.5 bg-gray-100 rounded-full mb-6">
        <View className="h-full bg-[#2EC4B6] rounded-full" style={{ width: `${progressPercent}%` }} />
      </View>

      {/* Timer */}
      <View className="items-center mb-6">
        <View className="relative justify-center items-center" style={{ width: size, height: size }}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={timeLeft > 10 ? '#2EC4B6' : timeLeft > 5 ? '#E85D04' : '#C41E3A'}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <Text className="absolute font-poppins font-bold text-sm text-[#1A1A2E]">{timeLeft}</Text>
        </View>
      </View>

      {/* Question */}
      <View className="bg-white rounded-2xl p-5 border border-gray-100 elevation-sm mb-6">
        <Text className="font-poppins font-bold text-base text-[#1A1A2E] text-center leading-snug">
          {question.text}
        </Text>
      </View>

      {/* Answers */}
      <ScrollView showsVerticalScrollIndicator={false} className="space-y-3">
        {question.options.map((option, index) => {
          let bgClass = 'bg-white border-gray-200'
          let textColor = 'text-[#1A1A2E]'
          let letterBg = 'bg-gray-100 text-[#1A1A2E]'
          let icon = null

          if (selectedAnswer !== null) {
            if (index === question.correctIndex) {
              bgClass = 'bg-green-500 border-green-500'
              textColor = 'text-white'
              letterBg = 'bg-white text-green-500'
              icon = <Check size={18} color="white" />
            } else if (index === selectedAnswer && selectedAnswer !== question.correctIndex) {
              bgClass = 'bg-red-500 border-red-500'
              textColor = 'text-white'
              letterBg = 'bg-white text-red-500'
              icon = <X size={18} color="white" />
            } else {
              bgClass = 'bg-gray-100 border-gray-100 opacity-40'
            }
          }

          return (
            <Pressable
              key={index}
              onPress={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full py-4 px-4 rounded-xl border-2 flex-row items-center gap-3 mb-3 ${bgClass}`}
              style={({ pressed }) => [{ opacity: pressed && selectedAnswer === null ? 0.8 : 1 }]}
            >
              <View className={`w-7 h-7 rounded-full items-center justify-center ${letterBg.split(' ')[0]}`}>
                <Text className={`text-xs font-poppins font-bold ${letterBg.split(' ')[1]}`}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text className={`flex-1 text-left text-sm font-inter font-medium ${textColor}`}>
                {option}
              </Text>
              {icon}
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  );
}
