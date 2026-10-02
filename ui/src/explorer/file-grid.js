import { component } from 'imp'
import { a, div, input, span } from 'imp/html'
import { computed } from 'imp/state'
import { menuButton } from 'imp/std'
import { entryVisual } from './entry-name.js'
import { entryBadges } from './entry-badges.js'
import { entryHref } from '../lib/routes.js'

const tile = ({ entry, isCursor, isSelected }, { model, actionsFor }) => {
  const box = div(
    {
      class: { tile: true, cursor: isCursor, selected: isSelected, deleted: entry.isDeleted },
      events: {
        click: (event) => {
          if (
            event.composedPath().some((node) => node.tagName === 'A' || node.tagName === 'INPUT')
          ) return
          model.pick(entry.path, {
            isToggling: event.ctrlKey || event.metaKey,
            isExtending: event.shiftKey,
          })
        },
        dblclick: () => model.open(entry),
      },
    },
    div(
      { class: 'tile-head' },
      input({
        type: 'checkbox',
        checked: isSelected,
        'aria-label': `Select ${entry.name}`,
        events: { change: () => model.pick(entry.path, { isToggling: true }) },
      }),
      menuButton({
        size: 'sm',
        variant: 'ghost',
        label: `Actions for ${entry.name}`,
        items: actionsFor(entry),
      }),
    ),
    span({ class: 'visual' }, entryVisual(entry, 'lg')),
    a(
      {
        href: entryHref(entry),
        title: entry.name,
        events: {
          click: (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
            event.preventDefault()
            model.open(entry)
          },
        },
      },
      entry.name,
    ),
    span({ class: 'badges' }, ...entryBadges(entry)),
  )
  if (isCursor) requestAnimationFrame(() => box.scrollIntoView({ block: 'nearest' }))
  return box
}

export const fileGrid = component('rfm-file-grid', {
  styles: `
    :host { display: block }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(8.5rem, 1fr));
      gap: var(--imp-space-3, 12px);
      padding: var(--imp-space-3, 12px);
    }
    .tile {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--imp-space-1, 4px);
      padding: var(--imp-space-2, 8px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background: var(--imp-color-surface, #ffffff);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      min-inline-size: 0;
      cursor: default;
    }
    .tile:hover { background: var(--imp-color-surface-hover, #f1f5f9) }
    .tile.selected {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 10%, var(--imp-color-surface, #ffffff));
      border-color: color-mix(in srgb, var(--imp-color-primary, #2563eb) 50%, transparent);
    }
    .tile.cursor { outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb) }
    .tile-head { display: flex; align-self: stretch; justify-content: space-between; align-items: center }
    .visual { display: grid; place-items: center; block-size: 4rem }
    .thumbnail.lg { inline-size: 4rem; block-size: 4rem; object-fit: cover; border-radius: var(--imp-radius-item, 6px) }
    a {
      max-inline-size: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: inherit;
      text-decoration: none;
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    a:hover { color: var(--imp-color-primary, #2563eb); text-decoration: underline }
    a:focus-visible, input:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    .deleted a { text-decoration: line-through; color: var(--imp-color-secondary, #64748b) }
    .badges { display: flex; gap: var(--imp-space-1, 4px); min-block-size: 1.25rem }
    @media (forced-colors: active) {
      .tile.selected { border-color: Highlight }
      .tile.cursor { outline-color: Highlight }
    }
  `,
  setup: (_self, { model, isSplit, actionsFor }) => {
    const tiles = computed(
      [model.visible, model.cursor, model.selected, isSplit],
      (entries, cursorPath, selectedPaths, split) =>
        entries.map((entry) => ({
          entry,
          isCursor: entry.path === cursorPath,
          isSelected: selectedPaths.includes(entry.path),
          split,
        })),
    )
    return div(
      { class: 'grid', role: 'list', 'aria-label': 'Folder contents' },
      tiles.each(
        (item) => tile(item, { model, actionsFor }),
        ({ entry, isCursor, isSelected, split }) =>
          `${entry.path}:${isCursor}:${isSelected}:${split}:${entry.modifiedAt}:${entry.gitStatus}`,
      ),
    )
  },
})
