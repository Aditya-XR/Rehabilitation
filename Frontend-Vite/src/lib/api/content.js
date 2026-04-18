import { apiClient } from "./client"
import { createFormData } from "./form-data"

export const contentApi = {
  async listPublic(query) {
    const response = await apiClient.get(
      "/content",
      { query },
    )
    return response.data
  },

  async getByKey(key) {
    const response = await apiClient.get(`/content/${key}`)
    return response.data
  },

  async listAdmin(query) {
    const response = await apiClient.get(
      "/admin/content",
      { query },
    )
    return response.data
  },

  async create(payload) {
    const formData = createFormData({
      key: payload.key,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      contactInfo: payload.contactInfo,
      isPublished: payload.isPublished,
      images: payload.images,
    })

    const response = await apiClient.post(
      "/admin/content",
      { body: formData },
    )
    return response.data
  },

  async update(contentId, payload) {
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

    const response = await apiClient.put(
      `/admin/content/${contentId}`,
      { body: formData },
    )
    return response.data
  },

  async remove(contentId) {
    const response = await apiClient.delete(`/admin/content/${contentId}`)
    return response.data
  },
}
