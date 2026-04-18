const isBlob = (value) =>
  typeof Blob !== "undefined" && value instanceof Blob

const isDate = (value) => value instanceof Date

const isPlainObject = (value) => {
  if (value === null || typeof value !== "object") {
    return false
  }

  return Object.getPrototypeOf(value) === Object.prototype
}

const appendFormDataValue = (formData, key, value) => {
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

export const createFormData = (values) => {
  const formData = new FormData()

  Object.entries(values).forEach(([key, value]) => {
    appendFormDataValue(formData, key, value)
  })

  return formData
}
