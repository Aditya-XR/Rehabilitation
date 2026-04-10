"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import { AuthPage } from "@/components/auth-page"
import { DashboardLayout, type DashboardView } from "@/components/dashboard/dashboard-layout"
import { SessionSlotsView } from "@/components/dashboard/session-slots-view"
import { ParticipantRequestsView } from "@/components/dashboard/participant-requests-view"
import { CenterContentView } from "@/components/dashboard/center-content-view"
import { Spinner } from "@/components/ui/spinner"
import { Leaf } from "lucide-react"

function AppContent() {
  const { isAuthenticated, isAuthLoading } = useAuth()
  const [activeView, setActiveView] = useState<DashboardView>("slots")

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="font-serif text-2xl text-foreground tracking-wide">Serenity Center</p>
            <p className="text-sm text-muted-foreground">Restoring your session...</p>
          </div>
          <Spinner className="text-primary" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthPage />
  }

  return (
    <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
      {activeView === "slots" && <SessionSlotsView />}
      {activeView === "bookings" && <ParticipantRequestsView />}
      {activeView === "content" && <CenterContentView />}
    </DashboardLayout>
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
