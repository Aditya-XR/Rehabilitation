const appendQueryValue = (searchParams, key, value) => {
  if (value === undefined || value === null) {
    return
  }

  if (value instanceof Date) {
    searchParams.append(key, value.toISOString())
    return
  }

  searchParams.append(key, String(value))
}

export const buildQueryString = (query) => {
  if (!query) {
    return ""
  }

  const searchParams = new URLSearchParams()

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => appendQueryValue(searchParams, key, item))
      return
    }

    appendQueryValue(searchParams, key, value)
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}
