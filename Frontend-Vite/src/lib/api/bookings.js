import { apiClient } from "./client"

export const bookingsApi = {
  async request(payload) {
    const response = await apiClient.post(
      "/bookings/request",
      { body: payload },
    )
    return response.data
  },

  async listMine(query) {
    const response = await apiClient.get(
      "/bookings/my",
      { query },
    )
    return response.data
  },

  async listAdmin(query) {
    const response = await apiClient.get(
      "/admin/bookings",
      { query },
    )
    return response.data
  },

  async review(bookingId, payload) {
    const response = await apiClient.put(
      `/admin/bookings/${bookingId}`,
      { body: payload },
    )
    return response.data
  },
}
