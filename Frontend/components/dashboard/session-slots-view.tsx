"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar } from "lucide-react"
import { SLOT_STATUS, type SlotStatus } from "@/lib/constants"

interface Slot {
  id: string
  date: string
  startTime: string
  endTime: string
  status: SlotStatus
}

// Mock data
const initialSlots: Slot[] = [
  { id: "1", date: "2026-04-15", startTime: "09:00", endTime: "10:00", status: "available" },
  { id: "2", date: "2026-04-15", startTime: "10:30", endTime: "11:30", status: "pending" },
  { id: "3", date: "2026-04-16", startTime: "14:00", endTime: "15:00", status: "confirmed" },
  { id: "4", date: "2026-04-17", startTime: "09:00", endTime: "10:00", status: "available" },
  { id: "5", date: "2026-04-18", startTime: "16:00", endTime: "17:00", status: "cancelled" },
]

const statusColors: Record<SlotStatus, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function SessionSlotsView() {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newSlot, setNewSlot] = useState({
    date: "",
    startTime: "",
    endTime: "",
    status: "available" as SlotStatus,
  })

  const handleAddSlot = () => {
    if (newSlot.date && newSlot.startTime && newSlot.endTime) {
      const slot: Slot = {
        id: String(Date.now()),
        ...newSlot,
      }
      setSlots([...slots, slot])
      setNewSlot({ date: "", startTime: "", endTime: "", status: "available" })
      setIsDialogOpen(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-semibold text-foreground tracking-wide">
            Session Slots
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage meditation and intimacy coaching session availability
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-foreground">Add New Session Slot</DialogTitle>
              <DialogDescription>
                Create a new time slot for meditation or coaching sessions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="slot-date" className="text-foreground">Date</Label>
                <Input
                  id="slot-date"
                  type="date"
                  value={newSlot.date}
                  onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-time" className="text-foreground">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newSlot.startTime}
                    onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time" className="text-foreground">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newSlot.endTime}
                    onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                    className="bg-card border-border"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="slot-status" className="text-foreground">Status</Label>
                <Select
                  value={newSlot.status}
                  onValueChange={(value) => setNewSlot({ ...newSlot, status: value as SlotStatus })}
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
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddSlot} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Add Slot
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(SLOT_STATUS).map(([key, value]) => {
          const count = slots.filter((s) => s.status === value).length
          return (
            <Card key={key} className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="capitalize">{value}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{count}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Slots Table */}
      <Card className="bg-card border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif text-foreground">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Start Time</TableHead>
                  <TableHead className="text-muted-foreground">End Time</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id} className="border-border">
                    <TableCell className="font-medium text-foreground">
                      {formatDate(slot.date)}
                    </TableCell>
                    <TableCell className="text-foreground">{formatTime(slot.startTime)}</TableCell>
                    <TableCell className="text-foreground">{formatTime(slot.endTime)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize ${statusColors[slot.status]}`}
                      >
                        {slot.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
