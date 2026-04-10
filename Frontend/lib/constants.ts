export const SLOT_STATUS = {
  AVAILABLE: "available",
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
} as const;

export const BOOKING_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const CONTENT_TYPES = {
  HERO: "hero",
  SECTION: "section",
  FACILITY: "facility",
  GALLERY: "gallery",
  CONTACT: "contact",
  GENERIC: "generic",
} as const;

export type SlotStatus = (typeof SLOT_STATUS)[keyof typeof SLOT_STATUS];
export type BookingStatus = (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];
export type ContentType = (typeof CONTENT_TYPES)[keyof typeof CONTENT_TYPES];
