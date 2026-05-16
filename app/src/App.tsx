import { Routes, Route } from 'react-router'
import { AuthProvider } from '@/context/AuthContext'
import { LibraryProvider } from '@/context/LibraryContext'
import MobileShell from '@/components/MobileShell'
import HomeScreen from '@/pages/HomeScreen'
import CatalogueScreen from '@/pages/CatalogueScreen'
import BookDetailScreen from '@/pages/BookDetailScreen'
import ReadingScreen from '@/pages/ReadingScreen'
import LibraryScreen from '@/pages/LibraryScreen'
import QuizScreen from '@/pages/QuizScreen'
import ProfileScreen from '@/pages/ProfileScreen'
import AuthScreen from '@/pages/AuthScreen'
import { Toaster } from 'sonner'
import DashboardScreen from '@/pages/DashboardScreen'

export default function App() {
  return (
    <AuthProvider>
      <LibraryProvider>
        <Toaster position="top-center" richColors />
        <MobileShell>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/catalogue" element={<CatalogueScreen />} />
            <Route path="/livre/:bookId" element={<BookDetailScreen />} />
            <Route path="/livre/:bookId/read" element={<ReadingScreen />} />
            <Route path="/bibliotheque" element={<LibraryScreen />} />
            <Route path="/quiz" element={<QuizScreen />} />
            <Route path="/quiz/:quizId" element={<QuizScreen />} />
            <Route path="/profil" element={<ProfileScreen />} />
            <Route path="/login" element={<AuthScreen />} />
            <Route path="/register" element={<AuthScreen />} />
            <Route path="/dashboard" element={<DashboardScreen />} />
          </Routes>
        </MobileShell>
      </LibraryProvider>
    </AuthProvider>
  )
}
