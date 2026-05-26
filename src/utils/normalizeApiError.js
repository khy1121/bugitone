function toErrorMessage(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  if (typeof value?.message === 'string') return value.message
  if (typeof value?.error === 'string') return value.error

  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

export function normalizeApiError(error) {
  const response = error?.response
  const data = response?.data
  const message =
    toErrorMessage(data?.message) ||
    toErrorMessage(data?.error) ||
    toErrorMessage(error?.message) ||
    'Request failed.'

  return {
    status: response?.status || 0,
    message,
    data,
    originalError: error,
  }
}
