"use client"

import { useState } from "react"
import { Calendar, FileUser, NotebookText } from "lucide-react"

import { RoleGuard } from "@/components/auth/role-guard"
import { DashboardLayout, type PortalNavItem } from "@/components/dashboard/dashboard-layout"
import { UserAvailableSlotsView } from "@/components/dashboard/user-available-slots-view"
import { UserBookingsView } from "@/components/dashboard/user-bookings-view"
import { UserProfileCenterView } from "@/components/dashboard/user-profile-center-view"

type UserDashboardView = "available-slots" | "my-bookings" | "profile"

const userNavItems: PortalNavItem<UserDashboardView>[] = [
  { id: "available-slots", label: "Available Slots", icon: Calendar },
  { id: "my-bookings", label: "My Bookings", icon: NotebookText },
  { id: "profile", label: "Profile & Center Info", icon: FileUser },
]

function UserDashboardPage() {
  const [activeView, setActiveView] = useState<UserDashboardView>("available-slots")

  return (
    <DashboardLayout
      activeView={activeView}
      onViewChange={setActiveView}
      navItems={userNavItems}
      portalLabel="User Portal"
    >
      {activeView === "available-slots" ? <UserAvailableSlotsView /> : null}
      {activeView === "my-bookings" ? <UserBookingsView /> : null}
      {activeView === "profile" ? <UserProfileCenterView /> : null}
    </DashboardLayout>
  )
}

export default function UserPage() {
  return (
    <RoleGuard allowedRole="user">
      <UserDashboardPage />
    </RoleGuard>
  )
}
