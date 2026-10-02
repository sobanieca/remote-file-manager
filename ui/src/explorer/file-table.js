import { code, span } from 'imp/html'
import { computed } from 'imp/state'
import { menuButton } from 'imp/std'
import { table } from 'imp/std/data'
import { entryName } from './entry-name.js'
import {
  formatFileSize,
  formatOctalPermissions,
  formatPermissions,
  formatRelativeTime,
  formatTimestamp,
} from '../lib/format.js'
import { describePath } from '../lib/paths.js'

const sizeCell = ({ entry }) =>
  entry.isDirectory || entry.isDeleted
    ? '—'
    : span({ title: `${entry.size ?? 0} bytes` }, formatFileSize(entry.size))

const permissionsCell = ({ entry }) => {
  const octal = formatOctalPermissions(entry.mode)
  return code(
    { title: octal ? `Mode ${octal}` : 'Unavailable' },
    formatPermissions(entry.mode, entry.isDirectory, entry.isSymlink) || '—',
  )
}

const modifiedCell = ({ entry }) =>
  entry.isDeleted ? 'deleted' : span(
    { title: formatTimestamp(entry.modifiedAt) },
    formatRelativeTime(entry.modifiedAt) || '—',
  )

const tableRows = (model, isSplit) => {
  let known = new Map()
  return computed([model.visible, model.cursor, isSplit], (entries, cursorPath, split) => {
    const next = new Map()
    const rows = entries.map((entry) => {
      const isCursor = entry.path === cursorPath
      const previous = known.get(entry.path)
      const row = previous && previous.entry === entry && previous.isCursor === isCursor &&
          previous.split === split
        ? previous
        : { id: entry.path, entry, isCursor, split }
      next.set(entry.path, row)
      return row
    })
    known = next
    return rows
  })
}

const rowPathOf = (event) => {
  const row = event.composedPath().find((node) => node.tagName === 'TR')
  return row?.querySelector('rfm-entry-name')?.dataset.path ?? null
}

export const fileTable = ({ model, isSplit, actionsFor }) => {
  let isExtendingClick = false
  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => entryName({ entry: row.entry, isCursor: row.isCursor, onOpen: model.open }),
    },
    { key: 'size', label: 'Size', align: 'end', sortable: true, render: sizeCell },
    { key: 'permissions', label: 'Permissions', render: permissionsCell },
    { key: 'modified', label: 'Modified', sortable: true, render: modifiedCell },
    {
      key: 'actions',
      label: 'Actions',
      align: 'end',
      render: (row) =>
        menuButton({
          size: 'sm',
          variant: 'ghost',
          label: `Actions for ${row.entry.name}`,
          items: actionsFor(row.entry),
        }),
    },
  ]

  const files = table({
    label: computed([model.path], (path) => `Contents of ${describePath(path ?? '.')}`),
    columns,
    rows: tableRows(model, isSplit),
    selection: 'multiple',
    selected: model.selected,
    events: {
      sort: (event) => {
        event.preventDefault()
        model.setSort(event.detail)
      },
      rowSelect: (event) => {
        if (isExtendingClick) model.pick(event.detail.key, { isExtending: true })
        else model.pick(event.detail.key)
      },
    },
  })
  files.addEventListener('click', (event) => {
    isExtendingClick = event.shiftKey
    if (event.detail !== 2) return
    const path = rowPathOf(event)
    const entry = path === null
      ? null
      : model.visible.get().find((candidate) => candidate.path === path)
    if (entry) model.open(entry)
  }, { capture: true })
  return files
}
