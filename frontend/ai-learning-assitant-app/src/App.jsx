import {Routes, Route, Navigate} from "react-router-dom"
import LoginPage from './pages/Auth/LoginPage'
import RegisterPage from './pages/Auth/RegisterPage'
import NotFoundPage from './pages/NotFoundPage'
import DashboardPage from './pages/Dashboard/DashboardPage'
import DocumentListPage from './pages/Documents/DocumentListPage'
import DocumentDetailsPage from './pages/Documents/DocumentDetailsPage'
import FlashcardListPage from './pages/FlashCards/FlashcardListPage'
import FlashcardPage from './pages/FlashCards/FlashcardPage'
import QuizTakePage from './pages/Quizzes/QuizTakePage'
import QuizResultPage from './pages/Quizzes/QuizResultPage'
import ProfilePage from './pages/Profile/ProfilePage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import PublicRoute from './components/auth/PublicRoute'
import { useAuth } from './context/AuthContext'

const App = () => {
  const {isAuthenticated, loading} = useAuth()

  if(loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route path='/' element={isAuthenticated ? <Navigate to="/dashboard" replace/> : <Navigate to="/login" replace/>}/>
      <Route element={<PublicRoute/>}>
        <Route path='/login' element={<LoginPage/>}/>
        <Route path='/register' element={<RegisterPage/>}/>
      </Route>

      {/* Protected Route */}
      <Route element={<ProtectedRoute/>}>
        <Route path='/dashboard' element={<DashboardPage/>}/>
        <Route path='/documents' element={<DocumentListPage/>}/>
        <Route path='/documents/:id' element={<DocumentDetailsPage/>}/>
        <Route path='/flashcards' element={<FlashcardListPage/>}/>
        <Route path='/documents/:id/flashcards' element={<FlashcardPage/>}/>
        <Route path='/quizzes/:quizId/' element={<QuizTakePage/>}/>
        <Route path='/quizzes/:quizId/results' element={<QuizResultPage/>}/>
        <Route path='/profile' element={<ProfilePage/>}/>
      </Route>

      <Route path='*' element={<NotFoundPage/>}/>
    </Routes>
  )
}

export default App
