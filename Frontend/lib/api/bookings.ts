import { apiClient } from "./client"
import type {
  ApiBooking,
  BookingListQuery,
  BookingRequestPayload,
  PaginatedResponse,
  ReviewBookingPayload,
} from "./types"

export const bookingsApi = {
  async request(payload: BookingRequestPayload) {
    const response = await apiClient.post<{ booking: ApiBooking }, BookingRequestPayload>(
      "/bookings/request",
      { body: payload },
    )
    return response.data
  },

  async listMine(query?: BookingListQuery) {
    const response = await apiClient.get<PaginatedResponse<ApiBooking>>(
      "/bookings/my",
      { query },
    )
    return response.data
  },

  async listAdmin(query?: BookingListQuery) {
    const response = await apiClient.get<PaginatedResponse<ApiBooking>>(
      "/admin/bookings",
      { query },
    )
    return response.data
  },

  async review(bookingId: string, payload: ReviewBookingPayload) {
    const response = await apiClient.put<{ booking: ApiBooking }, ReviewBookingPayload>(
      `/admin/bookings/${bookingId}`,
      { body: payload },
    )
    return response.data
  },
}
