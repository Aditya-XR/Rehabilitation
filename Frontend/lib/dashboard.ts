import type {
  ApiBooking,
  ApiContactInfo,
  ApiContent,
  ApiSlot,
  BookingStatus,
  ContentType,
  SlotStatus,
} from "@/lib/api"

export const slotStatusClasses: Record<SlotStatus, string> = {
  available: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export const bookingStatusClasses: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export const contentTypeClasses: Record<ContentType, string> = {
  hero: "bg-primary/10 text-primary border-primary/20",
  section: "bg-accent/10 text-accent border-accent/20",
  facility: "bg-sky-100 text-sky-700 border-sky-200",
  gallery: "bg-amber-100 text-amber-700 border-amber-200",
  contact: "bg-rose-100 text-rose-700 border-rose-200",
  generic: "bg-secondary text-foreground border-border",
}

export const contentTypeLabels: Record<ContentType, string> = {
  hero: "Hero",
  section: "Section",
  facility: "Facility",
  gallery: "Gallery",
  contact: "Contact",
  generic: "General",
}

const DEFAULT_LOCALE = "en-US"

export function getInitials(name?: string | null) {
  if (!name) {
    return "SC"
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatDateLabel(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(DEFAULT_LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatShortDateLabel(dateValue: string) {
  return new Date(dateValue).toLocaleDateString(DEFAULT_LOCALE, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })
}

export function formatTimeLabel(time: string) {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours, 10)

  if (Number.isNaN(hour)) {
    return time
  }

  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

export function formatSlotTimeRange(slot: Pick<ApiSlot, "startTime" | "endTime">) {
  return `${formatTimeLabel(slot.startTime)} - ${formatTimeLabel(slot.endTime)}`
}

export function formatSlotDateTime(slot: Pick<ApiSlot, "date" | "startTime" | "endTime">) {
  return `${formatDateLabel(slot.date)} at ${formatSlotTimeRange(slot)}`
}

export function isSlotEditable(status: SlotStatus) {
  return status === "available" || status === "cancelled"
}

export function getLatestReviewNote(booking: ApiBooking) {
  const latestReview = [...booking.statusHistory]
    .reverse()
    .find(
      (entry) =>
        (entry.to === "approved" || entry.to === "rejected") &&
        typeof entry.note === "string" &&
        entry.note.trim(),
    )

  return latestReview?.note ?? ""
}

export function getPrimaryContentImage(content: ApiContent) {
  return content.images[0]?.url ?? ""
}

export function groupPublishedContent(items: ApiContent[]) {
  const order: ContentType[] = [
    "hero",
    "section",
    "facility",
    "gallery",
    "contact",
    "generic",
  ]

  return order
    .map((type) => ({
      type,
      label: contentTypeLabels[type],
      items: items.filter((item) => item.type === type),
    }))
    .filter((group) => group.items.length > 0)
}

export function hasContactInfo(contactInfo?: ApiContactInfo) {
  if (!contactInfo) {
    return false
  }

  return Boolean(
    contactInfo.email ||
      contactInfo.phone ||
      contactInfo.address ||
      contactInfo.website,
  )
}
