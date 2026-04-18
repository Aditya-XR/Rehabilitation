import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { LoadingScreen } from "@/components/app/loading-screen"
import { useAuth } from "@/lib/auth-context"

const getRoleHomePath = (role) => (role === "admin" ? "/admin" : "/user")

export function RoleGuard({ allowedRole, children }) {
  const navigate = useNavigate()
  const { user, isAuthenticated, isAuthLoading } = useAuth()

  useEffect(() => {
    if (isAuthLoading) {
      return
    }

    if (!isAuthenticated || !user) {
      navigate("/", { replace: true })
      return
    }

    if (user.role !== allowedRole) {
      navigate(getRoleHomePath(user.role), { replace: true })
    }
  }, [allowedRole, isAuthenticated, isAuthLoading, navigate, user])

  if (isAuthLoading) {
    return <LoadingScreen />
  }

  if (!isAuthenticated || !user || user.role !== allowedRole) {
    return <LoadingScreen message="Redirecting to the correct portal..." />
  }

  return <>{children}</>
}
