export const resolveProfileImage = (value) => {
  if (!value || typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  if (!trimmed) return ''

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }

  const normalized = trimmed.replace(/^\/+/g, '')

  if (normalized.startsWith('uploads/')) {
    return `/api/${normalized}`
  }

  return `/api/uploads/profile/${encodeURIComponent(normalized)}`
}
