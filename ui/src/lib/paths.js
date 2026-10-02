export const ROOT_PATH = '.'

export const parentOf = (path) => {
  const slash = path.lastIndexOf('/')
  return slash === -1 ? ROOT_PATH : path.slice(0, slash)
}

export const nameOf = (path) => path.slice(path.lastIndexOf('/') + 1)

export const segmentsOf = (path) => (path === ROOT_PATH ? [] : path.split('/'))

export const toUrlPath = (path) => path.split('/').map(encodeURIComponent).join('/')

export const describePath = (path) => (path === ROOT_PATH ? 'root' : path)
