import { ApiClientError } from "@/lib/api"

export function getRequestErrorMessage(error, fallback) {
  if (error instanceof ApiClientError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return fallback
}
