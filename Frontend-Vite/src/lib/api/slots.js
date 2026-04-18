import { apiClient } from "./client"

export const slotsApi = {
  async listAvailable(query) {
    const response = await apiClient.get(
      "/slots/available",
      { query },
    )
    return response.data
  },

  async listAdmin(query) {
    const response = await apiClient.get(
      "/admin/slots",
      { query },
    )
    return response.data
  },

  async create(payload) {
    const response = await apiClient.post(
      "/admin/slots",
      { body: payload },
    )
    return response.data
  },

  async update(slotId, payload) {
    const response = await apiClient.put(
      `/admin/slots/${slotId}`,
      { body: payload },
    )
    return response.data
  },

  async remove(slotId) {
    const response = await apiClient.delete(`/admin/slots/${slotId}`)
    return response.data
  },
}
