import { component } from 'imp'
import { a, img, span } from 'imp/html'
import { icon } from 'imp/std'
import { entryBadges } from './entry-badges.js'
import { iconOfEntry } from '../lib/files.js'
import { entryHref } from '../lib/routes.js'
import { thumbnailUrl } from '../lib/server.js'

const KIND_COLORS = {
  folder: 'amber',
  image: 'pink',
  video: 'violet',
  audio: 'purple',
  archive: 'brown',
  pdf: 'red',
  spreadsheet: 'green',
  code: 'blue',
}

const opensElsewhere = (event) =>
  event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

export const entryVisual = (entry, size = 'md') =>
  entry.isImage && !entry.isDeleted
    ? img({
      class: `thumbnail ${size}`,
      src: thumbnailUrl(entry.path),
      alt: '',
      loading: 'lazy',
      decoding: 'async',
    })
    : icon(iconOfEntry(entry), { size, color: KIND_COLORS[entry.kind] ?? 'secondary' })

export const entryName = component('rfm-entry-name', {
  styles: `
    :host { display: block; min-inline-size: 0 }
    .entry {
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      min-inline-size: 0;
      padding: 2px var(--imp-space-1, 4px);
      border-radius: var(--imp-radius-item, 6px);
      outline: var(--imp-border-width, 1px) solid transparent;
    }
    .entry.cursor {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 8%, transparent);
    }
    .thumbnail {
      inline-size: 1.5rem;
      block-size: 1.5rem;
      object-fit: cover;
      border-radius: var(--imp-radius-item, 6px);
      flex: none;
    }
    a {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      text-decoration: none;
      border-radius: var(--imp-radius-item, 6px);
    }
    a:hover { color: var(--imp-color-primary, #2563eb); text-decoration: underline }
    a:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    .directory a { font-weight: var(--imp-font-weight-bold, 600) }
    .deleted a { text-decoration: line-through; color: var(--imp-color-secondary, #64748b) }
    .broken a { color: var(--imp-color-danger, #dc2626) }
    @media (forced-colors: active) {
      .entry.cursor { outline-color: Highlight }
    }
  `,
  setup: (self, { entry, isCursor = false, onOpen }) => {
    const anchor = a(
      {
        href: entryHref(entry),
        title: entry.isDeleted ? `${entry.name} was deleted, open the diff` : entry.name,
        events: {
          click: (event) => {
            if (opensElsewhere(event)) return
            event.preventDefault()
            onOpen(entry)
          },
        },
      },
      entry.name,
    )
    self.box = span(
      {
        class: {
          entry: true,
          cursor: isCursor,
          directory: entry.isDirectory,
          deleted: entry.isDeleted,
          broken: entry.isBroken,
        },
        'data-path': entry.path,
      },
      entryVisual(entry),
      anchor,
      ...entryBadges(entry),
    )
    self.isCursor = isCursor
    self.host.dataset.path = entry.path
    return self.box
  },
  onMount: (self) => {
    if (self.isCursor) self.box.scrollIntoView({ block: 'nearest' })
  },
})
