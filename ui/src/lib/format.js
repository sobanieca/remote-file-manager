const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export const formatFileSize = (bytes) => {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) return ''
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < FILE_SIZE_UNITS.length - 1) {
    size /= 1024
    unitIndex++
  }
  const rounded = unitIndex === 0 || size >= 100 ? Math.round(size) : Math.round(size * 10) / 10
  return `${rounded} ${FILE_SIZE_UNITS[unitIndex]}`
}

const PERMISSION_TRIPLETS = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx']

const withSpecialBit = (triplet, isSet, specialCharacter) => {
  if (!isSet) return triplet
  const isExecutable = triplet[2] === 'x'
  return triplet.slice(0, 2) +
    (isExecutable ? specialCharacter.toLowerCase() : specialCharacter.toUpperCase())
}

export const formatPermissions = (mode, isDirectory, isSymlink) => {
  if (typeof mode !== 'number') return ''
  const entryType = isSymlink ? 'l' : isDirectory ? 'd' : '-'
  const owner = withSpecialBit(PERMISSION_TRIPLETS[(mode >> 6) & 0o7], (mode & 0o4000) !== 0, 's')
  const group = withSpecialBit(PERMISSION_TRIPLETS[(mode >> 3) & 0o7], (mode & 0o2000) !== 0, 's')
  const others = withSpecialBit(PERMISSION_TRIPLETS[mode & 0o7], (mode & 0o1000) !== 0, 't')
  return entryType + owner + group + others
}

export const formatOctalPermissions = (mode) =>
  typeof mode === 'number' ? (mode & 0o7777).toString(8).padStart(4, '0') : ''

const toDate = (value) => {
  if (value === null || value === undefined) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const TIME_UNITS = [
  { limit: 60, seconds: 1, name: 'second' },
  { limit: 3600, seconds: 60, name: 'minute' },
  { limit: 86400, seconds: 3600, name: 'hour' },
  { limit: 2592000, seconds: 86400, name: 'day' },
  { limit: 31536000, seconds: 2592000, name: 'month' },
  { limit: Infinity, seconds: 31536000, name: 'year' },
]

export const formatRelativeTime = (value, now = Date.now()) => {
  const date = toDate(value)
  if (!date) return ''
  const elapsedSeconds = Math.max(0, (now - date.getTime()) / 1000)
  if (elapsedSeconds < 45) return 'just now'
  const unit = TIME_UNITS.find((candidate) => elapsedSeconds < candidate.limit)
  const count = Math.round(elapsedSeconds / unit.seconds)
  return `${count} ${unit.name}${count === 1 ? '' : 's'} ago`
}

export const formatTimestamp = (value) => {
  const date = toDate(value)
  if (!date) return ''
  const pad = (number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${
    pad(date.getHours())
  }:${pad(date.getMinutes())}`
}

export const pluralize = (count, noun) => `${count} ${noun}${count === 1 ? '' : 's'}`
