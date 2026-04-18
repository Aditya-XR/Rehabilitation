import { useState } from "react"
import { Calendar, FileText, Users } from "lucide-react"

import { RoleGuard } from "@/components/auth/role-guard"
import { CenterContentView } from "@/components/dashboard/center-content-view"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ParticipantRequestsView } from "@/components/dashboard/participant-requests-view"
import { SessionSlotsView } from "@/components/dashboard/session-slots-view"

const adminNavItems = [
  { id: "slots", label: "Session Slots", icon: Calendar },
  { id: "bookings", label: "Participant Requests", icon: Users },
  { id: "content", label: "Center Content", icon: FileText },
]

function AdminDashboardPage() {
  const [activeView, setActiveView] = useState("slots")

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      navItems={adminNavItems}
      portalLabel="Admin Portal"
    >
      {activeView === "slots" ? <SessionSlotsView /> : null}
      {activeView === "bookings" ? <ParticipantRequestsView /> : null}
      {activeView === "content" ? <CenterContentView /> : null}
    </DashboardLayout>
  )
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRole="admin">
      <AdminDashboardPage />
    </RoleGuard>
  )
}
