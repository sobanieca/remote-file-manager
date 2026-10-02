import { filesHref, viewHref } from './routes.js'
import { rawFileUrl } from './server.js'
import { ROOT_PATH } from './paths.js'

const LINK_PATTERN = /(!?)\[([^\]]*)\]\(\s*<?([^\s)>]+)>?((?:\s+"[^"]*")?)\s*\)/g
const EXTERNAL_URL_PATTERN = /^([a-z][a-z0-9+.-]*:|\/\/)/i

const resolveWithinRoot = (directory, linkPath) => {
  const segments = []
  const start = linkPath.startsWith('/') ? '' : directory === ROOT_PATH ? '' : directory
  for (const segment of `${start}/${linkPath}`.split('/')) {
    if (segment === '' || segment === '.') continue
    if (segment === '..') {
      if (segments.length === 0) return null
      segments.pop()
      continue
    }
    segments.push(segment)
  }
  return segments.join('/') || ROOT_PATH
}

const decodeLinkPath = (linkPath) => {
  try {
    return decodeURI(linkPath)
  } catch {
    return linkPath
  }
}

const splitSuffix = (href) => {
  const index = href.search(/[?#]/)
  return index === -1 ? [href, ''] : [href.slice(0, index), href.slice(index)]
}

const resolveTarget = (href, directory, isImage) => {
  if (href.startsWith('#') || EXTERNAL_URL_PATTERN.test(href)) return href
  const [linkPath, suffix] = splitSuffix(href)
  if (!linkPath) return href
  const path = resolveWithinRoot(directory, decodeLinkPath(linkPath))
  if (path === null) return href
  if (isImage) return rawFileUrl(path) + suffix
  if (linkPath.endsWith('/') || path === ROOT_PATH) return filesHref({ path })
  return viewHref(path)
}

export const resolveMarkdownLinks = (markdown, directory) =>
  markdown.replace(LINK_PATTERN, (_match, bang, text, href, title) => {
    const target = resolveTarget(href, directory, bang === '!')
    return `${bang}[${text}](${target}${title})`
  })
