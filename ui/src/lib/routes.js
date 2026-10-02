import { app } from '../app-map.js'
import { ROOT_PATH } from './paths.js'

const withQuery = (handle, query = {}) => {
  const params = new URLSearchParams()
  for (const [name, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== false) params.set(name, value)
  }
  const search = params.toString()
  return search ? `${handle.href()}?${search}` : handle.href()
}

export const filesHref = ({ path = ROOT_PATH, right, reveal } = {}) =>
  withQuery(app.files, {
    path: path === ROOT_PATH && right === undefined && !reveal ? undefined : path,
    right,
    reveal,
  })

export const viewHref = (path) => withQuery(app.files.view, { path })

export const editHref = (path) => withQuery(app.files.edit, { path })

export const statusHref = () => app.status.href()

export const historyHref = (path) => withQuery(app.history, { path })

export const diffHref = (query) => withQuery(app.diff, query)

export const compareHref = (from, to) => withQuery(app.compare, { from, to })

export const entryHref = (entry) => {
  if (entry.isDeleted) return diffHref({ path: entry.path })
  return entry.isDirectory ? filesHref({ path: entry.path }) : viewHref(entry.path)
}
