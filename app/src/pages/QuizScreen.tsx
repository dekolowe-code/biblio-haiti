import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { motion } from 'framer-motion'
import { Trophy, Star, ChevronRight, RotateCcw, Home, Zap, Check, X } from 'lucide-react'
import { quizzes, addQuizResult, getQuizResults, getStoredStars } from '@/data/mockData'
import { useAuth } from '@/context/AuthContext'

export default function QuizScreen() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (!quizId) {
    return <QuizList navigate={navigate} user={user} />
  }

  return <QuizPlay quizId={quizId} navigate={navigate} user={user} />
}

function QuizList({ navigate, user }: { navigate: ReturnType<typeof useNavigate>; user: any }) {
  const [stars, setStars] = useState(getStoredStars())
  const completedQuizzes = getQuizResults()

  useEffect(() => {
    const interval = setInterval(() => setStars(getStoredStars()), 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-full pb-4">
      <div className="px-4 pt-4 pb-2">
        <h1 className="font-poppins font-bold text-xl text-[#1A1A2E]">Gagne des \u00c9toiles</h1>
        <p className="text-xs text-[#6B7280] font-inter mt-1">Teste tes connaissances et gagne des r\u00e9compenses</p>
      </div>

      {/* Daily Bonus */}
      <div className="px-4 mt-2">
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="bg-gradient-to-r from-[#FAA307] to-[#E85D04] rounded-2xl p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-poppins font-semibold text-sm">Bonus quotidien</p>
              <p className="text-white/80 text-xs font-inter">Connecte-toi chaque jour</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 rounded-full px-3 py-1">
            <Star className="w-4 h-4 text-white fill-white" />
            <span className="text-white font-poppins font-bold text-sm">+5</span>
          </div>
        </motion.div>
      </div>

      {/* Stars Balance */}
      <div className="px-4 mt-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-[#FAA307] fill-[#FAA307]" />
        <span className="font-poppins font-bold text-lg text-[#1A1A2E]">{stars}</span>
        <span className="text-xs text-[#6B7280] font-inter">\u00e9toiles disponibles</span>
      </div>

      {/* Quiz List */}
      <div className="px-4 mt-4 space-y-3">
        {quizzes.map(quiz => {
          const isCompleted = completedQuizzes.includes(quiz.id)
          return (
            <motion.div
              key={quiz.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/quiz/${quiz.id}`)}
              className={`bg-white rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center gap-3 cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3A86FF] to-[#7209B7] flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-poppins font-semibold text-sm text-[#1A1A2E]">{quiz.title}</h3>
                <p className="text-[10px] text-[#6B7280] font-inter mt-0.5">
                  {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
                  {' \u2022 '}
                  {quiz.questions.length} questions
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-0.5 bg-[#FFF8F0] rounded-full px-2 py-1">
                  <Star className="w-3 h-3 text-[#FAA307] fill-[#FAA307]" />
                  <span className="text-[10px] font-poppins font-bold text-[#FAA307]">+{quiz.starReward}</span>
                </div>
                {isCompleted && <Check className="w-5 h-5 text-green-500" />}
                {!isCompleted && <ChevronRight className="w-4 h-4 text-[#6B7280]" />}
              </div>
            </motion.div>
          )
        })}
      </div>

      {!user && (
        <div className="px-4 mt-6">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full py-3 gradient-golden rounded-xl text-white font-poppins font-semibold text-sm"
          >
            Se connecter pour jouer
          </motion.button>
        </div>
      )}
    </div>
  )
}

function QuizPlay({ quizId, navigate, user }: { quizId: string; navigate: ReturnType<typeof useNavigate>; user: any }) {
  const quiz = quizzes.find(q => q.id === quizId)
  const [hasStarted, setHasStarted] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult] = useState(false)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(15)
  const [isFinished, setIsFinished] = useState(false)
  const [earnedStars, setEarnedStars] = useState(0)

  useEffect(() => {
    if (!hasStarted || isFinished || showResult) return
    if (timeLeft <= 0) {
      handleAnswer(-1)
      return
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft, hasStarted, isFinished, showResult])

  const handleStart = () => {
    if (!user) {
      navigate('/login')
      return
    }
    setHasStarted(true)
    setTimeLeft(15)
  }

  const handleAnswer = useCallback((answerIndex: number) => {
    if (selectedAnswer !== null) return
    setSelectedAnswer(answerIndex)

    const question = quiz?.questions[currentQuestion]
    if (!question) return

    const isCorrect = answerIndex === question.correctIndex
    if (isCorrect) setScore(s => s + 1)

    setTimeout(() => {
      if (currentQuestion < (quiz?.questions.length || 0) - 1) {
        setCurrentQuestion(c => c + 1)
        setSelectedAnswer(null)
        setTimeLeft(15)
      } else {
        const finalScore = isCorrect ? score + 1 : score
        const totalQuestions = quiz?.questions.length || 1
        const earned = quiz ? Math.round((finalScore / totalQuestions) * quiz.starReward) : 0
        setEarnedStars(earned)
        setIsFinished(true)
        addQuizResult(quizId, earned)
      }
    }, 1500)
  }, [selectedAnswer, currentQuestion, quiz, score, quizId])

  if (!quiz) {
    return <div className="flex items-center justify-center h-64 text-[#6B7280]">Quiz non trouv\u00e9</div>
  }

  // Quiz Intro Screen
  if (!hasStarted) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-3xl p-6 shadow-xl w-full max-w-sm"
        >
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#3A86FF] to-[#7209B7] rounded-2xl flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h2 className="font-poppins font-bold text-xl text-[#1A1A2E] text-center">{quiz.title}</h2>
          <p className="text-sm text-[#6B7280] font-inter text-center mt-2">
            Teste tes connaissances en {quiz.category.toLowerCase()} et gagne des \u00e9toiles!
          </p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className={`px-3 py-1 rounded-full text-xs font-inter ${quiz.difficulty === 'easy' ? 'bg-green-100 text-green-700' : quiz.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
              {quiz.difficulty === 'easy' ? 'Facile' : quiz.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-inter bg-blue-100 text-blue-700">
              {quiz.questions.length} questions
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-4 bg-[#FFF8F0] rounded-xl py-2">
            <Star className="w-4 h-4 text-[#FAA307] fill-[#FAA307]" />
            <span className="font-poppins font-bold text-sm text-[#FAA307]">\u2605 {quiz.starReward} \u00e9toiles \u00e0 gagner</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleStart}
            className="w-full mt-4 py-3 gradient-teal rounded-xl text-white font-poppins font-bold text-sm"
          >
            COMMENCER
          </motion.button>
          <button
            onClick={() => navigate('/quiz')}
            className="w-full mt-2 py-2 text-[#6B7280] font-inter text-xs"
          >
            Retour
          </button>
        </motion.div>
      </div>
    )
  }

  // Quiz Finished Screen
  if (isFinished) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Trophy className="w-20 h-20 text-[#FAA307] mx-auto" />
          </motion.div>
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="font-poppins font-bold text-2xl text-[#1A1A2E] mt-4"
          >
            {score}/{quiz.questions.length}
          </motion.h2>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring' }}
            className="flex items-center justify-center gap-2 mt-3"
          >
            <Star className="w-6 h-6 text-[#FAA307] fill-[#FAA307]" />
            <span className="font-poppins font-bold text-xl text-[#FAA307]">\u2605 +{earnedStars} \u00e9toiles gagn\u00e9es!</span>
          </motion.div>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-[#6B7280] font-inter mt-2"
          >
            {score === quiz.questions.length ? 'Parfait! Tu es un expert!' :
              score >= quiz.questions.length / 2 ? 'Bon travail! Continue comme \u00e7a!' :
                'Continue \u00e0 apprendre!'}
          </motion.p>
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-3 mt-6"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => { setHasStarted(false); setCurrentQuestion(0); setSelectedAnswer(null); setScore(0); setIsFinished(false); setEarnedStars(0) }}
              className="flex-1 py-3 border-2 border-[#C41E3A] rounded-xl text-[#C41E3A] font-poppins font-semibold text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              REJOUER
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/quiz')}
              className="flex-1 py-3 gradient-golden rounded-xl text-white font-poppins font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              ACCUEIL
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  // Quiz Question Screen
  const question = quiz.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100

  return (
    <div className="min-h-full flex flex-col px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/quiz')} className="w-8 h-8 flex items-center justify-center">
          <X className="w-5 h-5 text-[#1A1A2E]" />
        </button>
        <span className="text-xs font-inter text-[#6B7280]">Question {currentQuestion + 1}/{quiz.questions.length}</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-100 rounded-full mb-6">
        <motion.div
          className="h-full bg-[#2EC4B6] rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Timer */}
      <div className="flex justify-center mb-4">
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#f0f0f0" strokeWidth="3" />
            <circle
              cx="24" cy="24" r="20" fill="none"
              stroke={timeLeft > 10 ? '#2EC4B6' : timeLeft > 5 ? '#E85D04' : '#C41E3A'}
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 20 * (timeLeft / 15)} ${2 * Math.PI * 20}`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-poppins font-bold text-xs text-[#1A1A2E]">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Question */}
      <motion.div
        key={currentQuestion}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-5 shadow-md mb-4"
      >
        <h3 className="font-poppins font-bold text-base text-[#1A1A2E] text-center leading-snug">
          {question.text}
        </h3>
      </motion.div>

      {/* Answers */}
      <div className="space-y-2 flex-1">
        {question.options.map((option, index) => {
          let bgClass = 'bg-white border-gray-200 hover:bg-gray-50'
          let icon = null

          if (selectedAnswer !== null) {
            if (index === question.correctIndex) {
              bgClass = 'bg-green-500 border-green-500'
              icon = <Check className="w-5 h-5 text-white" />
            } else if (index === selectedAnswer && selectedAnswer !== question.correctIndex) {
              bgClass = 'bg-red-500 border-red-500'
              icon = <X className="w-5 h-5 text-white" />
            } else {
              bgClass = 'bg-gray-100 border-gray-100 opacity-50'
            }
          }

          return (
            <motion.button
              key={index}
              whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              className={`w-full py-3.5 px-4 rounded-xl border-2 flex items-center gap-3 transition-colors ${bgClass}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-poppins font-bold flex-shrink-0 ${selectedAnswer !== null && index === question.correctIndex ? 'bg-white text-green-500' : selectedAnswer !== null && index === selectedAnswer ? 'bg-white text-red-500' : 'bg-gray-100 text-[#1A1A2E]'}`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className={`flex-1 text-left text-sm font-inter ${selectedAnswer !== null && (index === question.correctIndex || index === selectedAnswer) ? 'text-white' : 'text-[#1A1A2E]'}`}>
                {option}
              </span>
              {icon}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
