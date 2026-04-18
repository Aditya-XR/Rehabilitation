import { apiClient } from "./client"

const authPath = "/auth"

export const authApi = {
  async signup(payload) {
    const response = await apiClient.post(
      `${authPath}/signup`,
      { body: payload },
    )
    return response.data
  },

  async login(payload) {
    const response = await apiClient.post(
      `${authPath}/login`,
      { body: payload },
    )
    return response.data
  },

  async googleLogin(payload) {
    const response = await apiClient.post(
      `${authPath}/google`,
      { body: payload },
    )
    return response.data
  },

  async refreshSession() {
    const response = await apiClient.post(
      `${authPath}/refresh-token`,
    )
    return response.data
  },

  async logout() {
    const response = await apiClient.post(`${authPath}/logout`)
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get(`${authPath}/me`)
    return response.data
  },

  async updateProfile(payload) {
    const formData = createFormData({
      name: payload.name,
      avatar: payload.avatarFile,
    })
    const response = await apiClient.patch(
      `${authPath}/profile`,
      { body: formData },
    )
    return response.data
  },

  async verifyEmail(payload) {
    const response = await apiClient.post(
      `${authPath}/verify-email`,
      { body: payload },
    )
    return response.data
  },

  async forgotPassword(payload) {
    const response = await apiClient.post(
      `${authPath}/forgot-password`,
      { body: payload },
    )
    return response.data
  },

  async resetPassword(token, payload) {
    const response = await apiClient.post(
      `${authPath}/reset-password/${token}`,
      { body: payload },
    )
    return response.data
  },

  async changePassword(payload) {
    const response = await apiClient.post(
      `${authPath}/change-password`,
      { body: payload },
    )
    return response.data
  },
}
