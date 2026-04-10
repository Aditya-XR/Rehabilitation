import { apiClient } from "./client"
import type {
  ApiSlot,
  CreateSlotPayload,
  PaginatedResponse,
  SlotListQuery,
  UpdateSlotPayload,
} from "./types"

export const slotsApi = {
  async listAvailable(query?: Omit<SlotListQuery, "status">) {
    const response = await apiClient.get<PaginatedResponse<ApiSlot>>(
      "/slots/available",
      { query },
    )
    return response.data
  },

  async listAdmin(query?: SlotListQuery) {
    const response = await apiClient.get<PaginatedResponse<ApiSlot>>(
      "/admin/slots",
      { query },
    )
    return response.data
  },

  async create(payload: CreateSlotPayload) {
    const response = await apiClient.post<{ slot: ApiSlot }, CreateSlotPayload>(
      "/admin/slots",
      { body: payload },
    )
    return response.data
  },

  async update(slotId: string, payload: UpdateSlotPayload) {
    const response = await apiClient.put<{ slot: ApiSlot }, UpdateSlotPayload>(
      `/admin/slots/${slotId}`,
      { body: payload },
    )
    return response.data
  },

  async remove(slotId: string) {
    const response = await apiClient.delete<null>(`/admin/slots/${slotId}`)
    return response.data
  },
}
