"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, User, FileText, CheckCircle, XCircle } from "lucide-react"
import { BOOKING_STATUS, type BookingStatus } from "@/lib/constants"

interface Booking {
  id: string
  participantName: string
  participantEmail: string
  participantAvatar?: string
  sessionDate: string
  sessionTime: string
  notes: string
  status: BookingStatus
  adminNotes?: string
}

// Mock data
const initialBookings: Booking[] = [
  {
    id: "1",
    participantName: "Maya Chen",
    participantEmail: "maya@example.com",
    sessionDate: "2026-04-15",
    sessionTime: "09:00 - 10:00",
    notes: "Looking for guidance on mindfulness practices for anxiety management. First time at the center.",
    status: "pending",
  },
  {
    id: "2",
    participantName: "James Wilson",
    participantEmail: "james@example.com",
    sessionDate: "2026-04-15",
    sessionTime: "10:30 - 11:30",
    notes: "Interested in couples intimacy coaching. My partner and I have been struggling with communication.",
    status: "pending",
  },
  {
    id: "3",
    participantName: "Sarah Thompson",
    participantEmail: "sarah@example.com",
    sessionDate: "2026-04-16",
    sessionTime: "14:00 - 15:00",
    notes: "Continuing my meditation journey. This will be my 4th session.",
    status: "approved",
    adminNotes: "Returning participant, excellent progress in previous sessions.",
  },
  {
    id: "4",
    participantName: "David Park",
    participantEmail: "david@example.com",
    sessionDate: "2026-04-14",
    sessionTime: "11:00 - 12:00",
    notes: "Need help with stress from work.",
    status: "rejected",
    adminNotes: "Session time conflict. Suggested alternative times via email.",
  },
]

const statusColors: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export function ParticipantRequestsView() {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false)
  const [adminNotes, setAdminNotes] = useState("")
  const [activeTab, setActiveTab] = useState<BookingStatus>("pending")

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const handleReview = (booking: Booking) => {
    setSelectedBooking(booking)
    setAdminNotes(booking.adminNotes || "")
    setIsReviewDialogOpen(true)
  }

  const handleAction = (action: "approve" | "reject") => {
    if (!selectedBooking) return

    setBookings(
      bookings.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              status: action === "approve" ? "approved" : "rejected",
              adminNotes,
            }
          : b
      )
    )
    setIsReviewDialogOpen(false)
    setSelectedBooking(null)
    setAdminNotes("")
  }

  const filteredBookings = bookings.filter((b) => b.status === activeTab)

  const getCounts = () => ({
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  })

  const counts = getCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
          Participant Requests
        </h2>
        <p className="text-muted-foreground mt-1">
          Review and manage session booking requests
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as BookingStatus)}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 gap-2"
          >
            Pending
            {counts.pending > 0 && (
              <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">
                {counts.pending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 gap-2"
          >
            Approved
            {counts.approved > 0 && (
              <Badge variant="secondary" className="bg-emerald-200 text-emerald-800 text-xs">
                {counts.approved}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive gap-2"
          >
            Rejected
            {counts.rejected > 0 && (
              <Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                {counts.rejected}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {Object.values(BOOKING_STATUS).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {filteredBookings.length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No {status} requests at the moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="bg-card border-border/50 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={booking.participantAvatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(booking.participantName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base font-medium text-foreground">
                              {booking.participantName}
                            </CardTitle>
                            <CardDescription className="text-xs">
                              {booking.participantEmail}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`capitalize ${statusColors[booking.status]}`}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Session Time */}
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-foreground">
                          {formatDate(booking.sessionDate)} at {booking.sessionTime}
                        </span>
                      </div>

                      {/* Notes */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>Participant Notes</span>
                        </div>
                        <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3 leading-relaxed">
                          {booking.notes}
                        </p>
                      </div>

                      {/* Admin Notes (if exists) */}
                      {booking.adminNotes && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>Admin Notes</span>
                          </div>
                          <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 leading-relaxed">
                            {booking.adminNotes}
                          </p>
                        </div>
                      )}

                      {/* Review Button (only for pending) */}
                      {booking.status === "pending" && (
                        <Button
                          variant="outline"
                          className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                          onClick={() => handleReview(booking)}
                        >
                          Review Request
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Review Request
            </DialogTitle>
            <DialogDescription>
              Review {selectedBooking?.participantName}&apos;s session request
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 py-4">
              {/* Request Summary */}
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(selectedBooking.participantName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">{selectedBooking.participantName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(selectedBooking.sessionDate)} at {selectedBooking.sessionTime}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-2">{selectedBooking.notes}</p>
              </div>

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label htmlFor="admin-notes" className="text-foreground">
                  Admin Notes (optional)
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add any notes about this request..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="bg-card border-border min-h-[100px]"
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              onClick={() => handleAction("reject")}
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => handleAction("approve")}
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
