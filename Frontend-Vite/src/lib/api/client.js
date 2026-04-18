import { apiConfig } from "./config"
import { buildQueryString } from "./query"

const isFormData = (value) =>
  typeof FormData !== "undefined" && value instanceof FormData

const isBodyInit = (value) =>
  typeof value === "string" ||
  value instanceof URLSearchParams ||
  value instanceof Blob ||
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value) ||
  value instanceof ReadableStream

const isApiErrorResponse = (value) => {
  if (!value || typeof value !== "object") {
    return false
  }

  return "success" in value && value.success === false && "message" in value
}

const isApiSuccessResponse = (value) => {
  if (!value || typeof value !== "object") {
    return false
  }

  return "success" in value && value.success === true && "data" in value
}

const buildUrl = (path, query) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${apiConfig.baseUrl}${normalizedPath}${buildQueryString(query)}`
}

const parseResponseBody = async (response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const buildRequestBody = (body, headers) => {
  if (body === undefined) {
    return undefined
  }

  if (isFormData(body) || isBodyInit(body)) {
    return body
  }

  headers.set("Content-Type", "application/json")
  return JSON.stringify(body)
}

const withTimeout = async (input, init, timeoutMs) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(input, {
      ...init,
      signal: init.signal ?? controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

export class ApiClientError extends Error {
  constructor(message, options) {
    super(message, { cause: options.cause })
    this.name = "ApiClientError"
    this.statusCode = options.statusCode
    this.errors = options.errors ?? []
    this.response = options.response
  }
}

class ApiClient {
  async request(path, options = {}) {
    const headers = new Headers(options.headers)
    headers.set("Accept", "application/json")

    const response = await withTimeout(
      buildUrl(path, options.query),
      {
        ...options,
        method: options.method ?? "GET",
        headers,
        credentials: options.credentials ?? "include",
        cache: options.cache ?? "no-store",
        body: buildRequestBody(options.body, headers),
      },
      options.timeoutMs ?? apiConfig.timeoutMs,
    )

    const payload = await parseResponseBody(response)

    if (!response.ok) {
      if (isApiErrorResponse(payload)) {
        throw new ApiClientError(payload.message, {
          statusCode: response.status,
          errors: payload.errors,
          response: payload,
        })
      }

      throw new ApiClientError("Request failed", {
        statusCode: response.status,
      })
    }

    if (!isApiSuccessResponse(payload)) {
      throw new ApiClientError("Unexpected API response", {
        statusCode: response.status,
      })
    }

    return payload
  }

  get(path, options) {
    return this.request(path, { ...options, method: "GET" })
  }

  post(path, options) {
    return this.request(path, { ...options, method: "POST" })
  }

  put(path, options) {
    return this.request(path, { ...options, method: "PUT" })
  }

  patch(path, options) {
    return this.request(path, { ...options, method: "PATCH" })
  }

  delete(path, options) {
    return this.request(path, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
