const isBlob = (value: unknown): value is Blob =>
  typeof Blob !== "undefined" && value instanceof Blob

const isDate = (value: unknown): value is Date => value instanceof Date

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}

const appendFormDataValue = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) {
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => appendFormDataValue(formData, key, item))
    return
  }

  if (isBlob(value)) {
    formData.append(key, value)
    return
  }

  if (isDate(value)) {
    formData.append(key, value.toISOString())
    return
  }

  if (isPlainObject(value)) {
    formData.append(key, JSON.stringify(value))
    return
  }

  formData.append(key, String(value))
}

export const createFormData = (values: Record<string, unknown>) => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    appendFormDataValue(formData, key, value)
  })

  return formData
}
