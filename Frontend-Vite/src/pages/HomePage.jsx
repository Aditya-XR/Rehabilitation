import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { useAuth } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/app/loading-screen"
import { AuthPage } from "@/components/auth-page"

function AppContent() {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) {
      return
    }

    navigate(user.role === "admin" ? "/admin" : "/user", { replace: true })
  }, [isAuthenticated, isAuthLoading, navigate, user])

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated && user) {
    return <LoadingScreen message="Opening your portal..." />
  }

  return <AuthPage />
}

export default function HomePage() {
  return <AppContent />
}
