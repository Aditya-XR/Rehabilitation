import { apiClient } from "./client"
import { createFormData } from "./form-data"
import type {
  ApiContent,
  ContentListQuery,
  CreateContentPayload,
  PaginatedResponse,
  UpdateContentPayload,
} from "./types"

export const contentApi = {
  async listPublic(query?: Omit<ContentListQuery, "isPublished">) {
    const response = await apiClient.get<PaginatedResponse<ApiContent>>(
      "/content",
      { query },
    )
    return response.data
  },

  async getByKey(key: string) {
    const response = await apiClient.get<{ content: ApiContent }>(`/content/${key}`)
    return response.data
  },

  async listAdmin(query?: ContentListQuery) {
    const response = await apiClient.get<PaginatedResponse<ApiContent>>(
      "/admin/content",
      { query },
    )
    return response.data
  },

  async create(payload: CreateContentPayload) {
    const formData = createFormData({
      key: payload.key,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      contactInfo: payload.contactInfo,
      isPublished: payload.isPublished,
      images: payload.images,
    })

    const response = await apiClient.post<{ content: ApiContent }, FormData>(
      "/admin/content",
      { body: formData },
    )
    return response.data
  },

  async update(contentId: string, payload: UpdateContentPayload) {
    const formData = createFormData({
      key: payload.key,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      contactInfo: payload.contactInfo,
      isPublished: payload.isPublished,
      replaceImages: payload.replaceImages,
      images: payload.images,
    })

    const response = await apiClient.put<{ content: ApiContent }, FormData>(
      `/admin/content/${contentId}`,
      { body: formData },
    )
    return response.data
  },

  async remove(contentId: string) {
    const response = await apiClient.delete<null>(`/admin/content/${contentId}`)
    return response.data
  },
}
