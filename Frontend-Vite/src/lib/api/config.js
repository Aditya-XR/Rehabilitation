const DEFAULT_API_BASE_URL = "http://localhost:5000/api/v1"

const normalizeBaseUrl = (value) => value.replace(/\/+$/, "")

export const apiConfig = {
  baseUrl: normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL,
  ),
  timeoutMs: 15000,
}
