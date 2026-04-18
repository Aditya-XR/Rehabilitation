import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react"

import { ApiClientError, slotsApi } from "@/lib/api"
import { SLOT_STATUS } from "@/lib/constants"
import {
  formatDateLabel,
  formatSlotTimeRange,
  isSlotEditable,
  slotStatusClasses,
} from "@/lib/dashboard"
import { getRequestErrorMessage } from "@/lib/request"
import { toast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const defaultFormState = {
  date: "",
  startTime: "",
  endTime: "",
  status: SLOT_STATUS.AVAILABLE,
}

const sortSlots = (items) =>
  [...items].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  )

export function SessionSlotsView() {
  const [slots, setSlots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingSlotId, setDeletingSlotId] = useState(null)
  const [editingSlot, setEditingSlot] = useState(null)
  const [formState, setFormState] = useState(defaultFormState)

  const loadSlots = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await slotsApi.listAdmin({ limit: 100 })
      setSlots(sortSlots(response.items))
      setError(null)
    } catch (error) {
      setError(getRequestErrorMessage(error, "Unable to load session slots."))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadSlots()
  }, [loadSlots])

  const counts = useMemo(
    () => ({
      available: slots.filter((slot) => slot.status === SLOT_STATUS.AVAILABLE).length,
      pending: slots.filter((slot) => slot.status === SLOT_STATUS.PENDING).length,
      confirmed: slots.filter((slot) => slot.status === SLOT_STATUS.CONFIRMED).length,
      cancelled: slots.filter((slot) => slot.status === SLOT_STATUS.CANCELLED).length,
    }),
    [slots],
  )

  const openCreateDialog = () => {
    setEditingSlot(null)
    setFormState(defaultFormState)
    setIsDialogOpen(true)
  }

  const openEditDialog = (slot) => {
    setEditingSlot(slot)
    setFormState({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status:
        slot.status === SLOT_STATUS.CANCELLED
          ? SLOT_STATUS.CANCELLED
          : SLOT_STATUS.AVAILABLE,
    })
    setIsDialogOpen(true)
  }

  const resetDialog = () => {
    setEditingSlot(null)
    setFormState(defaultFormState)
    setIsDialogOpen(false)
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)

      if (editingSlot) {
        const response = await slotsApi.update(editingSlot._id, formState)
        setSlots((current) =>
          sortSlots(
            current.map((slot) =>
              slot._id === editingSlot._id ? response.slot : slot,
            ),
          ),
        )
        toast({
          title: "Slot updated",
          description: `${formatDateLabel(response.slot.date)} w successfully.`,
        })
      } else {
        const response = await slotsApi.create(formState)
        setSlots((current) => sortSlots([...current, response.slot]))
        toast({
          title: "Slot created",
          description: `${formatDateLabel(response.slot.date)} w to the schedule.`,
        })
      }

      resetDialog()
      setError(null)
    } catch (error) {
      const message = getRequestErrorMessage(
        error,
        "Unable to save this session slot.",
      )

      if (error instanceof ApiClientError) {
        setError(message)
      }

      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (slot) => {
    if (!window.confirm(`Delete the slot on ${formatDateLabel(slot.date)}?`)) {
      return
    }

    try {
      setDeletingSlotId(slot._id)
      await slotsApi.remove(slot._id)
      setSlots((current) => current.filter((item) => item._id !== slot._id))
      toast({
        title: "Slot deleted",
        description: `${formatDateLabel(slot.date)} w successfully.`,
      })
      setError(null)
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getRequestErrorMessage(error, "Unable to delete this session slot."),
        variant: "destructive",
      })
    } finally {
      setDeletingSlotId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Session Slots
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage availability for upcoming rehabilitation sessions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="gap-2" onClick={() => void loadSlots()}>
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
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
            <DialogTrigger asChild>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                onClick={openCreateDialog}
              >
                <Plus className="w-4 h-4" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">
                  {editingSlot ? "Edit Session Slot" : "Add New Session Slot"}
                </DialogTitle>
                <DialogDescription>
                  Create or adjust availability using the same rules enforced by the backend.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="slot-date" className="text-foreground">
                    Date
                  </Label>
                  <Input
                    id="slot-date"
                    type="date"
                    value={formState.date}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        date: event.target.value,
                      }))
                    }
                    className="bg-card border-border"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time" className="text-foreground">
                      Start Time
                    </Label>
                    <Input
                      id="start-time"
                      type="time"
                      value={formState.startTime}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          startTime: event.target.value,
                        }))
                      }
                      className="bg-card border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time" className="text-foreground">
                      End Time
                    </Label>
                    <Input
                      id="end-time"
                      type="time"
                      value={formState.endTime}
                      onChange={(event) =>
                        setFormState((current) => ({
                          ...current,
                          endTime: event.target.value,
                        }))
                      }
                      className="bg-card border-border"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slot-status" className="text-foreground">
                    Status
                  </Label>
                  <Select
                    value={formState.status}
                    onValueChange={(value) =>
                      setFormState((current) => ({
                        ...current,
                        status: value ,
                      }))
                    }
                  >
                    <SelectTrigger className="bg-card border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SLOT_STATUS.AVAILABLE}>Available</SelectItem>
                      <SelectItem value={SLOT_STATUS.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetDialog} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleSubmit()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Spinner className="mr-2" /> : null}
                  {editingSlot ? "Save Changes" : "Add Slot"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load slots</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(counts).map(([key, value]) => (
          <Card key={key} className="bg-card border-border/50">
            <CardHeader className="pb-2">
              <CardDescription className="capitalize">{key}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Spinner className="text-primary" />
            </div>
          ) : slots.length === 0 ? (
            <Empty className="border-border/60">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Calendar className="size-5" />
                </EmptyMedia>
                <EmptyTitle>No session slots yet</EmptyTitle>
                <EmptyDescription>
                  Add your first available slot to open bookings for users.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button onClick={openCreateDialog} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Session
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Time</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => {
                    const editable = isSlotEditable(slot.status)
                    const isDeleting = deletingSlotId === slot._id

                    return (
                      <TableRow key={slot._id} className="border-border">
                        <TableCell className="font-medium text-foreground">
                          {formatDateLabel(slot.date)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatSlotTimeRange(slot)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`capitalize ${slotStatusClasses[slot.status]}`}
                          >
                            {slot.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => openEditDialog(slot)}
                              disabled={!editable}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                              onClick={() => void handleDelete(slot)}
                              disabled={!editable || isDeleting}
                            >
                              {isDeleting ? <Spinner className="mr-1" /> : <Trash2 className="w-3.5 h-3.5" />}
                              Delete
                            </Button>
                          </div>
                          {!editable ? (
                            <p className="text-xs text-muted-foreground mt-2">
                              {slot.status === SLOT_STATUS.PENDING
                                ? "Pending slots are locked while awaiting review."
                                : "Confirmed slots are locked after approval."}
                            </p>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
