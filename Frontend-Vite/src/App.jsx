import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from '@/components/ui/toaster'
import HomePage from '@/pages/HomePage'
import AdminPage from '@/pages/AdminPage'
import UserPage from '@/pages/UserPage'

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
