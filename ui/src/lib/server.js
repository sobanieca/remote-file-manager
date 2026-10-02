import { env } from 'imp'
import { toUrlPath } from './paths.js'

const serverOrigin = () => env.API_URL || globalThis.location.origin

const serverUrl = (path, query = {}) => {
  const target = new URL(path, serverOrigin())
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null) target.searchParams.set(name, value)
  }
  return target.href
}

export const rawFileUrl = (path) => serverUrl(`/${toUrlPath(path)}`)

export const thumbnailUrl = (path) => serverUrl('/api/thumbnail', { path })

export const downloadUrl = (entry) =>
  serverUrl('/api/download-item', {
    path: entry.path,
    type: entry.isDirectory ? 'directory' : 'file',
  })

export const errorMessage = (error) =>
  error?.body?.message ?? error?.message ?? 'The request failed'

export const openInNewTab = (href) => globalThis.open(href, '_blank', 'noopener')

export const startDownload = (href) => globalThis.location.assign(href)

export const downloadArchive = (paths) => {
  const archiveForm = document.createElement('form')
  archiveForm.method = 'POST'
  archiveForm.action = serverUrl('/api/download-items')
  archiveForm.hidden = true
  for (const path of paths) {
    const field = document.createElement('input')
    field.name = 'paths'
    field.value = path
    archiveForm.append(field)
  }
  document.body.append(archiveForm)
  archiveForm.submit()
  setTimeout(() => archiveForm.remove(), 1000)
}
