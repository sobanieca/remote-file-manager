import { component } from 'imp'
import { details, div, span, summary, table, tbody, td, tr } from 'imp/html'
import { button, icon } from 'imp/std'
import { tag } from 'imp/std/display'
import { navigate } from 'imp/router'
import { luArrowRight, luEye } from 'imp/icons'
import { pairHunkLines } from '../lib/diff.js'
import { GIT_STATUSES } from '../lib/files.js'
import { viewHref } from '../lib/routes.js'

const MARKERS = { added: '+', removed: '-', context: ' ' }

const hunkHeading = (hunk) => `@@ ${hunk.range} @@${hunk.heading ? ` ${hunk.heading}` : ''}`

const unifiedRow = (line) =>
  line.type === 'note'
    ? tr(
      { class: 'note' },
      td({ class: 'gutter' }),
      td({ class: 'gutter' }),
      td({ class: 'code' }, line.content),
    )
    : tr(
      { class: line.type },
      td({ class: 'gutter' }, line.oldLineNumber ?? ''),
      td({ class: 'gutter' }, line.newLineNumber ?? ''),
      td({ class: 'code' }, span({ class: 'marker' }, MARKERS[line.type]), line.content),
    )

const unifiedTable = (file) =>
  table(
    tbody(
      file.hunks.flatMap((hunk) => [
        tr(
          { class: 'hunk' },
          td({ class: 'gutter', colspan: '2' }, '⋯'),
          td({ class: 'code' }, hunkHeading(hunk)),
        ),
        ...hunk.lines.map(unifiedRow),
      ]),
    ),
  )

const splitCell = (line, side) => {
  if (!line) return [td({ class: 'gutter' }), td({ class: 'code empty' })]
  if (line.type === 'note') {
    return [td({ class: 'gutter' }), td({ class: 'code note' }, line.content)]
  }
  const lineNumber = side === 'left' ? line.oldLineNumber : line.newLineNumber
  return [
    td({ class: 'gutter' }, lineNumber ?? ''),
    td({ class: ['code', line.type] }, line.content),
  ]
}

const splitTable = (file) =>
  table(
    { class: 'split' },
    tbody(
      file.hunks.flatMap((hunk) => [
        tr(
          { class: 'hunk' },
          td({ class: 'gutter' }, '⋯'),
          td({ class: 'code' }, hunkHeading(hunk)),
          td({ class: 'gutter' }, '⋯'),
          td({ class: 'code' }),
        ),
        ...pairHunkLines(hunk.lines).map((pair) =>
          tr(...splitCell(pair.left, 'left'), ...splitCell(pair.right, 'right'))
        ),
      ]),
    ),
  )

const fileBody = (file, mode) => {
  if (file.isBinary) {
    return div({ class: 'empty-note' }, 'Binary file, there is no textual diff to show.')
  }
  if (file.hunks.length === 0) {
    return div({ class: 'empty-note' }, 'No changes to show for this file.')
  }
  return div(
    { class: 'scroll' },
    mode.view((current) => (current === 'split' ? splitTable(file) : unifiedTable(file))),
  )
}

export const diffFile = component('rfm-diff-file', {
  styles: `
    :host { display: block; scroll-margin-block-start: var(--imp-space-4, 16px) }
    details {
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background: var(--imp-color-surface, #ffffff);
      overflow: hidden;
    }
    summary {
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px) var(--imp-space-3, 12px);
      background: var(--imp-color-surface-sunken, #f1f5f9);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      cursor: pointer;
    }
    summary:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: -2px;
    }
    .path {
      flex: 1;
      min-inline-size: 0;
      display: flex;
      align-items: center;
      gap: var(--imp-space-1, 4px);
      overflow: hidden;
      font-family: var(--imp-font-family-mono, monospace);
      font-size: var(--imp-font-size-sm, 0.875rem);
      overflow-wrap: anywhere;
    }
    .from { color: var(--imp-color-secondary, #64748b) }
    .scroll { overflow-x: auto }
    table {
      inline-size: 100%;
      border-collapse: collapse;
      font-family: var(--imp-font-family-mono, monospace);
      font-size: var(--imp-font-size-sm, 0.875rem);
      line-height: 1.5;
      color: var(--imp-color-text, #0f172a);
    }
    table.split { table-layout: fixed }
    table.split .gutter { inline-size: 3.5rem }
    .gutter {
      inline-size: 1%;
      padding: 0 var(--imp-space-2, 8px);
      color: var(--imp-color-secondary, #64748b);
      text-align: end;
      white-space: nowrap;
      user-select: none;
      vertical-align: top;
    }
    .code { padding: 0 var(--imp-space-2, 8px); white-space: pre; }
    table.split .code { white-space: pre-wrap; overflow-wrap: anywhere }
    .marker { display: inline-block; inline-size: 1.25ch; user-select: none; color: var(--imp-color-secondary, #64748b) }
    .added, td.added { background: color-mix(in srgb, var(--imp-color-success, #16a34a) 14%, transparent) }
    .removed, td.removed { background: color-mix(in srgb, var(--imp-color-danger, #dc2626) 14%, transparent) }
    .hunk td { background: color-mix(in srgb, var(--imp-color-info, #0284c7) 10%, transparent); color: var(--imp-color-secondary, #64748b) }
    .note, td.note { color: var(--imp-color-secondary, #64748b); font-style: italic }
    td.empty { background: var(--imp-color-surface-sunken, #f1f5f9) }
    .empty-note {
      padding: var(--imp-space-3, 12px);
      color: var(--imp-color-secondary, #64748b);
      font-family: var(--imp-font-family, system-ui, sans-serif);
    }
    @media (forced-colors: active) {
      .added .marker, .removed .marker { color: CanvasText }
    }
  `,
  setup: (self, { file, mode, focus }) => {
    const status = GIT_STATUSES[file.status] ?? GIT_STATUSES.modified
    const panel = details(
      { open: true },
      summary(
        tag({ size: 'sm', color: status.color }, file.status),
        span(
          { class: 'path' },
          file.originalPath ? span({ class: 'from' }, file.originalPath) : null,
          file.originalPath ? icon(luArrowRight, { size: 'sm' }) : null,
          file.path,
        ),
        tag({ size: 'sm', color: 'green' }, `+${file.added}`),
        tag({ size: 'sm', color: 'red' }, `-${file.removed}`),
        file.servedPath
          ? button(
            {
              size: 'sm',
              variant: 'ghost',
              square: true,
              label: `Open ${file.servedPath}`,
              events: {
                click: (event) => {
                  event.preventDefault()
                  navigate(viewHref(file.servedPath))
                },
              },
            },
            icon(luEye, { size: 'sm' }),
          )
          : null,
      ),
      fileBody(file, mode),
    )
    focus?.watch(self, (path) => {
      if (path !== file.path) return
      panel.open = true
      self.host.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return panel
  },
})
