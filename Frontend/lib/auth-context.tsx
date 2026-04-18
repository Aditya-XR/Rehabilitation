"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import { authApi, ApiClientError, type ApiUser } from "@/lib/api"

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAuthLoading: boolean
  authError: string | null
  authNotice: string | null
  clearAuthMessages: () => void
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  googleLogin: () => Promise<void>
  syncUser: (user: ApiUser) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const mapApiUserToUser = (user: ApiUser): User => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || "",
  role: user.role,
})

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiClientError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authNotice, setAuthNotice] = useState<string | null>(null)

  const clearAuthMessages = useCallback(() => {
    setAuthError(null)
    setAuthNotice(null)
  }, [])

  const syncUser = useCallback((apiUser: ApiUser) => {
    setUser(mapApiUserToUser(apiUser))
  }, [])

  const refreshUser = useCallback(async () => {
    const currentUser = await authApi.getCurrentUser()
    setUser(mapApiUserToUser(currentUser.user))
  }, [])

  const restoreSession = useCallback(async () => {
    try {
      const currentUser = await authApi.getCurrentUser()
      setUser(mapApiUserToUser(currentUser.user))
      return
    } catch (error) {
      if (!(error instanceof ApiClientError) || error.statusCode !== 401) {
        setUser(null)
        return
      }
    }

    try {
      await authApi.refreshSession()
      const currentUser = await authApi.getCurrentUser()
      setUser(mapApiUserToUser(currentUser.user))
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const hydrateAuth = async () => {
      try {
        await restoreSession()
      } finally {
        if (isMounted) {
          setIsAuthLoading(false)
        }
      }
    }

    void hydrateAuth()

    return () => {
      isMounted = false
    }
  }, [restoreSession])

  const login = async (email: string, password: string) => {
    clearAuthMessages()

    try {
      const response = await authApi.login({ email, password })
      setUser(mapApiUserToUser(response.user))
    } catch (error) {
      setUser(null)
      setAuthError(getErrorMessage(error, "Unable to sign in right now."))
      throw error
    }
  }

  const signup = async (name: string, email: string, password: string) => {
    clearAuthMessages()

    try {
      await authApi.signup({ name, email, password })
      setUser(null)
      setAuthNotice("Account created successfully. Please try signing in later.")
    } catch (error) {
      setAuthError(getErrorMessage(error, "Unable to create your account right now."))
      throw error
    }
  }

  const googleLogin = async () => {
    clearAuthMessages()
    setAuthNotice("Google sign-in is not available yet.")
  }

  const logout = async () => {
    clearAuthMessages()

    try {
      await authApi.logout()
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthLoading,
        isAuthenticated: !!user,
        authError,
        authNotice,
        clearAuthMessages,
        login,
        signup,
        googleLogin,
        logout,
        syncUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
