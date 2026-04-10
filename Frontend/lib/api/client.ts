import { apiConfig } from "./config"
import { buildQueryString } from "./query"
import type {
  ApiErrorResponse,
  ApiFieldError,
  ApiSuccessResponse,
  QueryParams,
} from "./types"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

type RequestBody = BodyInit | FormData | Record<string, unknown> | undefined

export interface ApiRequestOptions<TBody = RequestBody>
  extends Omit<RequestInit, "body" | "headers" | "method"> {
  body?: TBody
  headers?: HeadersInit
  method?: HttpMethod
  query?: QueryParams
  timeoutMs?: number
}

export class ApiClientError extends Error {
  statusCode: number
  errors: ApiFieldError[]
  response?: ApiErrorResponse

  constructor(
    message: string,
    options: {
      statusCode: number
      errors?: ApiFieldError[]
      response?: ApiErrorResponse
      cause?: unknown
    },
  ) {
    super(message, { cause: options.cause })
    this.name = "ApiClientError"
    this.statusCode = options.statusCode
    this.errors = options.errors ?? []
    this.response = options.response
  }
}

const isFormData = (value: unknown): value is FormData =>
  typeof FormData !== "undefined" && value instanceof FormData

const isBodyInit = (value: unknown): value is BodyInit =>
  typeof value === "string" ||
  value instanceof URLSearchParams ||
  value instanceof Blob ||
  value instanceof ArrayBuffer ||
  ArrayBuffer.isView(value) ||
  value instanceof ReadableStream

const isApiErrorResponse = (value: unknown): value is ApiErrorResponse => {
  if (!value || typeof value !== "object") {
    return false
  }

  return "success" in value && value.success === false && "message" in value
}

const isApiSuccessResponse = <TData>(
  value: unknown,
): value is ApiSuccessResponse<TData> => {
  if (!value || typeof value !== "object") {
    return false
  }

  return "success" in value && value.success === true && "data" in value
}

const buildUrl = (path: string, query?: QueryParams) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${apiConfig.baseUrl}${normalizedPath}${buildQueryString(query)}`
}

const parseResponseBody = async <TData>(response: Response) => {
  const text = await response.text()

  if (!text) {
    return null as TData | null
  }

  try {
    return JSON.parse(text) as TData
  } catch {
    return null as TData | null
  }
}

const buildRequestBody = (body: RequestBody, headers: Headers) => {
  if (body === undefined) {
    return undefined
  }

  if (isFormData(body) || isBodyInit(body)) {
    return body
  }

  headers.set("Content-Type", "application/json")
  return JSON.stringify(body)
}

const withTimeout = async (input: RequestInfo | URL, init: RequestInit, timeoutMs: number) => {
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

class ApiClient {
  async request<TData, TBody = RequestBody>(
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ) {
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
        body: buildRequestBody(options.body as RequestBody, headers),
      },
      options.timeoutMs ?? apiConfig.timeoutMs,
    )

    const payload = await parseResponseBody<
      ApiSuccessResponse<TData> | ApiErrorResponse
    >(response)

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

    if (!isApiSuccessResponse<TData>(payload)) {
      throw new ApiClientError("Unexpected API response", {
        statusCode: response.status,
      })
    }

    return payload
  }

  get<TData>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<TData>(path, { ...options, method: "GET" })
  }

  post<TData, TBody = RequestBody>(
    path: string,
    options?: Omit<ApiRequestOptions<TBody>, "method">,
  ) {
    return this.request<TData, TBody>(path, { ...options, method: "POST" })
  }

  put<TData, TBody = RequestBody>(
    path: string,
    options?: Omit<ApiRequestOptions<TBody>, "method">,
  ) {
    return this.request<TData, TBody>(path, { ...options, method: "PUT" })
  }

  patch<TData, TBody = RequestBody>(
    path: string,
    options?: Omit<ApiRequestOptions<TBody>, "method">,
  ) {
    return this.request<TData, TBody>(path, { ...options, method: "PATCH" })
  }

  delete<TData>(path: string, options?: Omit<ApiRequestOptions, "method" | "body">) {
    return this.request<TData>(path, { ...options, method: "DELETE" })
  }
}

export const apiClient = new ApiClient()
