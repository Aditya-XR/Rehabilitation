import { useCallback, useEffect, useMemo, useState } from "react"
import { CheckCircle, Clock, FileText, RefreshCcw, User, XCircle } from "lucide-react"

import { bookingsApi } from "@/lib/api"
import { BOOKING_STATUS } from "@/lib/constants"
import {
  bookingStatusClasses,
  formatShortDateLabel,
  formatSlotTimeRange,
  getInitials,
  getLatestReviewNote,
} from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function ParticipantRequestsView() {
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState(BOOKING_STATUS.PENDING)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isReviewing, setIsReviewing] = useState(false)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await bookingsApi.listAdmin({ limit: 100 })
      setBookings(response.items)
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load booking requests."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBookings()
  }, [loadBookings])

  const counts = useMemo(
    () => ({
      pending: bookings.filter((booking) => booking.status === BOOKING_STATUS.PENDING).length,
      approved: bookings.filter((booking) => booking.status === BOOKING_STATUS.APPROVED).length,
      rejected: bookings.filter((booking) => booking.status === BOOKING_STATUS.REJECTED).length,
    }),
    [bookings],
  )

  const filteredBookings = useMemo(
    () => bookings.filter((booking) => booking.status === activeTab),
    [activeTab, bookings],
  )

  const openReviewDialog = (booking) => {
    setSelectedBooking(booking)
    setAdminNotes(getLatestReviewNote(booking))
    setIsDialogOpen(true)
  }

  const resetDialog = () => {
    setSelectedBooking(null)
    setAdminNotes("")
    setIsDialogOpen(false)
  }

  const handleReview = async (action) => {
    if (!selectedBooking) {
      return
    }

    try {
      setIsReviewing(true)
      const response = await bookingsApi.review(selectedBooking._id, {
        action,
        notes: adminNotes || undefined,
      })

      setBookings((current) =>
        current.map((booking) =>
          booking._id === selectedBooking._id ? response.booking : booking,
        ),
      )
      setError(null)
      toast({
        title: action === "approve" ? "Booking approved" : "Booking rejected",
        description: `${selectedBooking.user.name}'s request h reviewed.`,
      })
      resetDialog()
    } catch (error) {
      toast({
        title: "Review failed",
        description: getRequestErrorMessage(error, "Unable to review this booking."),
        variant: "destructive",
      })
    } finally {
      setIsReviewing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Participant Requests
          </h2>
          <p className="text-muted-foreground mt-1">
            Review and manage user booking requests in real time
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadBookings()}>
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load requests</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value )}>
        <TabsList className="bg-secondary/50">
          <TabsTrigger
            value={BOOKING_STATUS.PENDING}
            className="data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 gap-2"
          >
            Pending
            {counts.pending > 0 ? (
              <Badge variant="secondary" className="bg-amber-200 text-amber-800 text-xs">
                {counts.pending}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value={BOOKING_STATUS.APPROVED}
            className="data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 gap-2"
          >
            Approved
            {counts.approved > 0 ? (
              <Badge variant="secondary" className="bg-emerald-200 text-emerald-800 text-xs">
                {counts.approved}
              </Badge>
            ) : null}
          </TabsTrigger>
          <TabsTrigger
            value={BOOKING_STATUS.REJECTED}
            className="data-[state=active]:bg-destructive/10 data-[state=active]:text-destructive gap-2"
          >
            Rejected
            {counts.rejected > 0 ? (
              <Badge variant="secondary" className="bg-destructive/20 text-destructive text-xs">
                {counts.rejected}
              </Badge>
            ) : null}
          </TabsTrigger>
        </TabsList>

        {Object.values(BOOKING_STATUS).map((status) => (
          <TabsContent key={status} value={status} className="mt-6">
            {isLoading ? (
              <div className="py-16 flex items-center justify-center">
                <Spinner className="text-primary" />
              </div>
            ) : filteredBookings.length === 0 ? (
              <Card className="bg-card border-border/50">
                <CardContent className="py-12">
                  <Empty className="border-border/60">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <FileText className="size-5" />
                      </EmptyMedia>
                      <EmptyTitle>No {status} requests</EmptyTitle>
                      <EmptyDescription>
                        Booking requests will appear here  reserve session slots.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredBookings.map((booking) => {
                  const reviewNote = getLatestReviewNote(booking)

                  return (
                    <Card
                      key={booking._id}
                      className="bg-card border-border/50 hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage
                                src={booking.user.avatar}
                                alt={booking.user.name}
                              />
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {getInitials(booking.user.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base font-medium text-foreground">
                                {booking.user.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {booking.user.email}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={`capitalize ${bookingStatusClasses[booking.status]}`}
                          >
                            {booking.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-foreground">
                            {formatShortDateLabel(booking.slot.date)} at{" "}
                            {formatSlotTimeRange(booking.slot)}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>User Notes</span>
                          </div>
                          <p className="text-sm text-foreground bg-secondary/30 rounded-lg p-3 leading-relaxed min-h-16">
                            {booking.notes || "No notes were provided with this request."}
                          </p>
                        </div>

                        {reviewNote ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>Admin Notes</span>
                            </div>
                            <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 leading-relaxed">
                              {reviewNote}
                            </p>
                          </div>
                        ) : null}

                        {booking.status === BOOKING_STATUS.PENDING ? (
                          <Button
                            variant="outline"
                            className="w-full mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                            onClick={() => openReviewDialog(booking)}
                          >
                            Review Request
                          </Button>
                        ) : null}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetDialog()
            return
          }

          setIsDialogOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Review Request
            </DialogTitle>
            <DialogDescription>
              Review {selectedBooking?.user.name}&apos;s booking request.
            </DialogDescription>
          </DialogHeader>

          {selectedBooking ? (
            <div className="space-y-4 py-4">
              <div className="bg-secondary/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getInitials(selectedBooking.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {selectedBooking.user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatShortDateLabel(selectedBooking.slot.date)} at{" "}
                      {formatSlotTimeRange(selectedBooking.slot)}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-foreground mt-2">
                  {selectedBooking.notes || "No notes were provided with this request."}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-notes" className="text-foreground">
                  Admin Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  placeholder="Add context for the participant or your team..."
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  className="bg-card border-border min-h-[100px]"
                />
              </div>
            </div>
          ) : null}

          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
              onClick={() => void handleReview("reject")}
              disabled={isReviewing}
            >
              {isReviewing ? <Spinner className="mr-1" /> : <XCircle className="w-4 h-4" />}
              Reject
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
              onClick={() => void handleReview("approve")}
              disabled={isReviewing}
            >
              {isReviewing ? <Spinner className="mr-1" /> : <CheckCircle className="w-4 h-4" />}
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
