import { component } from 'imp'
import { code, span } from 'imp/html'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { useState } from 'imp/state'
import { button, icon } from 'imp/std'
import { card, descriptionList, tag } from 'imp/std/display'
import { loader } from 'imp/std/feedback'
import { flex, stack } from 'imp/std/layout'
import { filePreview } from './file-preview.js'
import { pageHeader } from '../components/page-header.js'
import { loadFailure } from '../components/load-failure.js'
import { gitStatusTag } from '../explorer/entry-badges.js'
import { entryActions } from '../lib/entry-actions.js'
import { createFileOperations } from '../lib/file-operations.js'
import { iconOfEntry } from '../lib/files.js'
import {
  formatFileSize,
  formatOctalPermissions,
  formatPermissions,
  formatRelativeTime,
  formatTimestamp,
} from '../lib/format.js'
import { describePath, parentOf } from '../lib/paths.js'
import { loadRepository } from '../lib/repository.js'
import { filesHref, viewHref } from '../lib/routes.js'

const metaItems = (entry) => {
  const octal = formatOctalPermissions(entry.mode)
  const flags = [
    entry.isExecutable ? tag({ size: 'sm', color: 'lime' }, 'executable') : null,
    entry.isSymlink ? tag({ size: 'sm', color: 'sky' }, 'symlink') : null,
  ].filter(Boolean)
  return [
    {
      term: 'Size',
      details: span({ title: `${entry.size ?? 0} bytes` }, formatFileSize(entry.size ?? 0)),
    },
    {
      term: 'Permissions',
      details: code(
        { title: octal ? `Mode ${octal}` : '' },
        formatPermissions(entry.mode, entry.isDirectory, entry.isSymlink) || '—',
      ),
    },
    {
      term: 'Modified',
      details: span(
        { title: formatTimestamp(entry.modifiedAt) },
        formatRelativeTime(entry.modifiedAt) || '—',
      ),
    },
    { term: 'Kind', details: entry.kind },
    flags.length > 0 ? { term: 'Flags', details: flex({ gap: 1 }, ...flags) } : null,
  ].filter(Boolean)
}

const actionButton = (action) =>
  button(
    {
      size: 'sm',
      variant: action.id === 'delete' ? 'danger' : 'default',
      events: { click: action.onClick },
    },
    icon(action.icon, { size: 'sm' }),
    action.label,
  )

export const fileDetails = component('rfm-file-details', {
  loading: () => loader({ label: 'Loading the file' }),
  error: (_self, error) => loadFailure('Could not open the file', error),
  setup: async (self, { path }) => {
    const api = useHttpClient(self, 'rfm.api')
    const dialogRequest = useState(self, 'rfm.dialog')
    const repository = useState(self, 'rfm.git')

    let response
    try {
      response = await api.get('/api/file', { query: { path } })
    } catch (error) {
      if (!error.body?.isDirectory) throw error
      navigate(filesHref({ path: error.body.path }), { replace: true })
      return null
    }
    const { entry, content, isTooLarge } = response
    const parentPath = parentOf(entry.path)

    const operations = createFileOperations({
      api,
      dialogRequest,
      onChanged: () => loadRepository(api, repository),
    })
    const viewerOperations = {
      ...operations,
      rename: async (target) => {
        const result = await operations.rename(target)
        if (result?.ok) navigate(viewHref(result.path), { replace: true })
      },
      remove: async (targets) => {
        const result = await operations.remove(targets)
        if (result?.ok) navigate(filesHref({ path: parentPath }), { replace: true })
      },
    }

    return stack(
      { gap: 4 },
      pageHeader({
        glyph: iconOfEntry(entry),
        title: entry.name,
        subtitle: { href: filesHref({ path: parentPath }), label: describePath(parentPath) },
        badges: [gitStatusTag(entry.gitStatus)],
      }),
      card({ padding: 'sm' }, descriptionList({ columns: 3, items: metaItems(entry) })),
      flex(
        { gap: 2, wrap: true },
        ...entryActions(entry, { operations: viewerOperations, inViewer: true }).map(actionButton),
      ),
      filePreview(entry, content, isTooLarge),
    )
  },
})
