"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth-context"
import { LoadingScreen } from "@/components/app/loading-screen"
import { AuthPage } from "@/components/auth-page"

function AppContent() {
  const router = useRouter()
  const { user, isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !user) {
      return
    }

    router.replace(user.role === "admin" ? "/admin" : "/user")
  }, [isAuthenticated, isAuthLoading, router, user])

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  if (isAuthenticated && user) {
    return <LoadingScreen message="Opening your portal..." />
  }

  return <AuthPage />
}

export default function Home() {
  return <AppContent />
}
