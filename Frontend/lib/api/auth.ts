import { apiClient } from "./client"
import { createFormData } from "./form-data"
import type {
  ApiUser,
  ChangePasswordPayload,
  ForgotPasswordPayload,
  GoogleLoginPayload,
  LoginPayload,
  ResetPasswordPayload,
  SignupPayload,
  UpdateProfilePayload,
  VerifyEmailPayload,
} from "./types"

const authPath = "/auth"

export const authApi = {
  async signup(payload: SignupPayload) {
    const response = await apiClient.post<{ user: ApiUser }, SignupPayload>(
      `${authPath}/signup`,
      { body: payload },
    )
    return response.data
  },

  async login(payload: LoginPayload) {
    const response = await apiClient.post<{ user: ApiUser }, LoginPayload>(
      `${authPath}/login`,
      { body: payload },
    )
    return response.data
  },

  async googleLogin(payload: GoogleLoginPayload) {
    const response = await apiClient.post<{ user: ApiUser }, GoogleLoginPayload>(
      `${authPath}/google`,
      { body: payload },
    )
    return response.data
  },

  async refreshSession() {
    const response = await apiClient.post<{ user: ApiUser }>(
      `${authPath}/refresh-token`,
    )
    return response.data
  },

  async logout() {
    const response = await apiClient.post<null>(`${authPath}/logout`)
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get<{ user: ApiUser }>(`${authPath}/me`)
    return response.data
  },

  async updateProfile(payload: UpdateProfilePayload) {
    const formData = createFormData({
      name: payload.name,
      avatar: payload.avatarFile,
    })
    const response = await apiClient.patch<{ user: ApiUser }, FormData>(
      `${authPath}/profile`,
      { body: formData },
    )
    return response.data
  },

  async verifyEmail(payload: VerifyEmailPayload) {
    const response = await apiClient.post<null, VerifyEmailPayload>(
      `${authPath}/verify-email`,
      { body: payload },
    )
    return response.data
  },

  async forgotPassword(payload: ForgotPasswordPayload) {
    const response = await apiClient.post<null, ForgotPasswordPayload>(
      `${authPath}/forgot-password`,
      { body: payload },
    )
    return response.data
  },

  async resetPassword(token: string, payload: ResetPasswordPayload) {
    const response = await apiClient.post<null, ResetPasswordPayload>(
      `${authPath}/reset-password/${token}`,
      { body: payload },
    )
    return response.data
  },

  async changePassword(payload: ChangePasswordPayload) {
    const response = await apiClient.post<null, ChangePasswordPayload>(
      `${authPath}/change-password`,
      { body: payload },
    )
    return response.data
  },
}
