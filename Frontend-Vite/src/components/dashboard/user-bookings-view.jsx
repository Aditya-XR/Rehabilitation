import { useCallback, useEffect, useMemo, useState } from "react"
import { Clock, FileText, RefreshCcw, User } from "lucide-react"

import { bookingsApi } from "@/lib/api"
import { BOOKING_STATUS } from "@/lib/constants"
import {
  bookingStatusClasses,
  formatShortDateLabel,
  formatSlotTimeRange,
  getLatestReviewNote,
} from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function UserBookingsView() {
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState(BOOKING_STATUS.PENDING)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadBookings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await bookingsApi.listMine({ limit: 100 })
      setBookings(response.items)
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load your bookings."))
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            My Bookings
          </h2>
          <p className="text-muted-foreground mt-1">
            Track your pending, approved, and rejected requests from the backend
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadBookings()}>
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load bookings</AlertTitle>
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
                      <EmptyTitle>No {status} bookings</EmptyTitle>
                      <EmptyDescription>
                        Your booking requests will show up here  move through review.
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
                    <Card key={booking._id} className="bg-card border-border/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <CardTitle className="text-base font-medium text-foreground">
                              {formatShortDateLabel(booking.slot.date)}
                            </CardTitle>
                            <CardDescription>
                              {formatSlotTimeRange(booking.slot)}
                            </CardDescription>
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
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>
                            Created {new Date(booking.createdAt).toLocaleDateString("en-US")}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="w-4 h-4" />
                            <span>Your Notes</span>
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
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
