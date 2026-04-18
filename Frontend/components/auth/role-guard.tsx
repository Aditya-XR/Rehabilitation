"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { LoadingScreen } from "@/components/app/loading-screen"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/api"

interface RoleGuardProps {
  allowedRole: UserRole
  children: React.ReactNode
}

const getRoleHomePath = (role: UserRole) => (role === "admin" ? "/admin" : "/user")

export function RoleGuard({ allowedRole, children }: RoleGuardProps) {
  const router = useRouter()
  const { user, isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!isAuthenticated || !user) {
      router.replace("/")
      return
    }

    if (user.role !== allowedRole) {
      router.replace(getRoleHomePath(user.role))
    }
  }, [allowedRole, isAuthenticated, isAuthLoading, router, user])

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || !user || user.role !== allowedRole) {
    return <LoadingScreen message="Redirecting to the correct portal..." />
  }

  return <>{children}</>
}
