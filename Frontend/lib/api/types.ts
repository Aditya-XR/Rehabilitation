export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Date
  | Array<string | number | boolean | Date | null | undefined>

export type QueryParams = Record<string, QueryValue>

export type UserRole = "user" | "admin"
export type SlotStatus = "available" | "pending" | "confirmed" | "cancelled"
export type BookingStatus = "pending" | "approved" | "rejected"
export type ContentType =
  | "hero"
  | "section"
  | "facility"
  | "gallery"
  | "contact"
  | "generic"

export interface ApiFieldError {
  field?: string
  message: string
}

export interface ApiErrorResponse {
  success: false
  message: string
  errors: ApiFieldError[]
  stack?: string
}

export interface ApiSuccessResponse<TData> {
  success: true
  statusCode: number
  data: TData
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<TItem> {
  items: TItem[]
  pagination: PaginationMeta
}

export interface ApiUser {
  _id: string
  name: string
  email: string
  googleId: string | null
  avatar: string
  role: UserRole
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ApiUserSummary {
  _id: string
  name: string
  email: string
  avatar?: string
  role?: UserRole
}

export interface ApiMediaAsset {
  url: string
  publicId: string
  resourceType: string
  width: number | null
  height: number | null
  format: string
}

export interface ApiContactInfo {
  email?: string
  phone?: string
  address?: string
  website?: string
}

export interface ApiSlot {
  _id: string
  date: string
  startTime: string
  endTime: string
  startsAt: string
  endsAt: string
  status: SlotStatus
  createdBy?: string | ApiUserSummary
  createdAt: string
  updatedAt: string
}

export interface ApiBookingStatusHistory {
  from?: BookingStatus
  to: BookingStatus
  actor: string | ApiUserSummary
  note: string
  changedAt: string
}

export interface ApiBooking {
  _id: string
  user: ApiUser | ApiUserSummary
  slot: ApiSlot
  status: BookingStatus
  notes: string
  reviewedBy: string | ApiUserSummary | null
  reviewedAt: string | null
  statusHistory: ApiBookingStatusHistory[]
  createdAt: string
  updatedAt: string
}

export interface ApiContent {
  _id: string
  key: string
  type: ContentType
  title: string
  body: string
  images: ApiMediaAsset[]
  contactInfo: ApiContactInfo
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface DateRangeQuery {
  dateFrom?: string
  dateTo?: string
}

export interface PaginationQuery {
  [key: string]: QueryValue
  page?: number
  limit?: number
}

export interface SlotListQuery extends PaginationQuery, DateRangeQuery {
  status?: SlotStatus
}

export interface BookingListQuery extends PaginationQuery {
  status?: BookingStatus
}

export interface ContentListQuery extends PaginationQuery {
  type?: ContentType
  isPublished?: boolean
}

export interface SignupPayload {
  name: string
  email: string
  password: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface GoogleLoginPayload {
  idToken: string
}

export interface VerifyEmailPayload {
  token: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  newPassword: string
}

export interface ChangePasswordPayload {
  oldPassword: string
  newPassword: string
}

export interface UpdateProfilePayload {
  name?: string
  avatarFile?: Blob
}

export interface BookingRequestPayload {
  slotId: string
  notes?: string
}

export interface ReviewBookingPayload {
  action: "approve" | "reject"
  notes?: string
}

export interface CreateSlotPayload {
  date: string
  startTime: string
  endTime: string
  status?: Extract<SlotStatus, "available" | "cancelled">
}

export interface UpdateSlotPayload {
  date?: string
  startTime?: string
  endTime?: string
  status?: Extract<SlotStatus, "available" | "cancelled">
}

export interface CreateContentPayload {
  key: string
  type?: ContentType
  title?: string
  body?: string
  contactInfo?: ApiContactInfo
  isPublished?: boolean
  images?: Blob[]
}

export interface UpdateContentPayload {
  key?: string
  type?: ContentType
  title?: string
  body?: string
  contactInfo?: ApiContactInfo
  isPublished?: boolean
  replaceImages?: boolean
  images?: Blob[]
}
