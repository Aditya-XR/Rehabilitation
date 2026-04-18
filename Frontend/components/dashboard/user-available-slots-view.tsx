"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, Clock, PlusCircle, RefreshCcw } from "lucide-react"

import { bookingsApi, slotsApi, type ApiSlot } from "@/lib/api"
import { formatDateLabel, formatSlotTimeRange } from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { Textarea } from "@/components/ui/textarea"

const sortSlots = (items: ApiSlot[]) =>
  [...items].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  )

export function UserAvailableSlotsView() {
  const [slots, setSlots] = useState<ApiSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ApiSlot | null>(null)
  const [notes, setNotes] = useState("")
  const [isBooking, setIsBooking] = useState(false)

  const loadSlots = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await slotsApi.listAvailable({ limit: 100 })
      setSlots(sortSlots(response.items))
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load available slots."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSlots()
  }, [loadSlots])

  const upcomingCount = useMemo(() => slots.length, [slots])

  const handleBooking = async () => {
    if (!selectedSlot) {
      return
    }

    try {
      setIsBooking(true)
      await bookingsApi.request({
        slotId: selectedSlot._id,
        notes: notes || undefined,
      })
      setSlots((current) => current.filter((slot) => slot._id !== selectedSlot._id))
      toast({
        title: "Request submitted",
        description:
          "Your booking request was sent to the admin team for review.",
      })
      setSelectedSlot(null)
      setNotes("")
    } catch (error) {
      toast({
        title: "Booking failed",
        description: getRequestErrorMessage(error, "Unable to reserve this slot."),
        variant: "destructive",
      })
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Available Slots
          </h2>
          <p className="text-muted-foreground mt-1">
            Browse upcoming sessions and send a booking request in one step
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => void loadSlots()}>
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load slots</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <Card className="bg-card border-border/50">
        <CardHeader className="pb-2">
          <CardDescription>Upcoming availability</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-foreground">{upcomingCount}</p>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="py-16 flex items-center justify-center">
          <Spinner className="text-primary" />
        </div>
      ) : slots.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="py-16">
            <Empty className="border-border/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Calendar className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No available sessions right now</EmptyTitle>
                <EmptyDescription>
                  New slots will appear here as soon as the admin team publishes availability.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {slots.map((slot) => (
            <Card key={slot._id} className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-lg text-foreground">
                  {formatDateLabel(slot.date)}
                </CardTitle>
                <CardDescription>Session request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>{formatSlotTimeRange(slot)}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reserve this slot to send a pending request to the admin portal for review.
                </p>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  onClick={() => setSelectedSlot(slot)}
                >
                  <PlusCircle className="w-4 h-4" />
                  Request This Slot
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={Boolean(selectedSlot)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedSlot(null)
            setNotes("")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">
              Request Session
            </DialogTitle>
            <DialogDescription>
              {selectedSlot
                ? `${formatDateLabel(selectedSlot.date)} at ${formatSlotTimeRange(selectedSlot)}`
                : "Choose a slot to continue."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-foreground">
              Your request will be marked as pending until an admin approves or rejects it.
            </div>
            <div className="space-y-2">
              <Label htmlFor="booking-notes" className="text-foreground">
                Notes for the admin team
              </Label>
              <Textarea
                id="booking-notes"
                placeholder="Add context for your session goals or preferences..."
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="bg-card border-border min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSlot(null)
                setNotes("")
              }}
              disabled={isBooking}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleBooking()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={isBooking}
            >
              {isBooking ? <Spinner className="mr-2" /> : null}
              Submit Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
