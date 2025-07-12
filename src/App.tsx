
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useThemeStore } from '@/store/useThemeStore'
import { useEffect } from 'react'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import AskQuestionPage from './pages/AskQuestionPage'
import QuestionDetailPage from './pages/QuestionDetailPage'
import NotificationsPage from './pages/NotificationsPage'
import NotFound from './pages/NotFound'
import PrivateRoute from './components/PrivateRoute'

const queryClient = new QueryClient()

function App() {
  const { isLoading } = useAuth()
  const { theme } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route
              path="/ask"
              element={
                <PrivateRoute>
                  <AskQuestionPage />
                </PrivateRoute>
              }
            />
            <Route path="/question/:id" element={<QuestionDetailPage />} />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationsPage />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster richColors position="top-right" />
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
