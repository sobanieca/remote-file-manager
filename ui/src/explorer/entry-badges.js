import { tag } from 'imp/std/display'
import { GIT_STATUSES } from '../lib/files.js'

export const gitStatusTag = (status) => {
  const details = GIT_STATUSES[status]
  return details ? tag({ size: 'sm', color: details.color }, details.label) : null
}

export const entryBadges = (entry) => [
  gitStatusTag(entry.gitStatus),
  entry.isExecutable ? tag({ size: 'sm', color: 'lime' }, 'exec') : null,
  entry.isSymlink ? tag({ size: 'sm', color: 'sky' }, 'link') : null,
]
