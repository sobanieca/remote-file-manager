import { component } from 'imp'
import { div, input, span } from 'imp/html'
import { computed } from 'imp/state'
import { button, icon, menuButton } from 'imp/std'
import { luArrowDown, luArrowUp } from 'imp/icons'
import { entryName } from './entry-name.js'
import { sizeCell } from './file-table.js'

const NEXT_DIRECTION = { ascending: 'descending', descending: 'none', none: 'ascending' }

const isOnControl = (event) =>
  event.composedPath().some((node) => ['A', 'INPUT', 'BUTTON'].includes(node.tagName))

const sortButton = (key, label, { model }) => {
  const direction = computed([model.sort], (sort) => sort.key === key ? sort.direction : 'none')
  return button(
    {
      variant: 'ghost',
      size: 'sm',
      label: computed([direction], (current) => `Sort by ${label}, ${current}`),
      events: {
        click: () => model.setSort({ key, direction: NEXT_DIRECTION[direction.get()] }),
      },
    },
    label,
    direction.view((current) =>
      current === 'none'
        ? null
        : icon(current === 'ascending' ? luArrowUp : luArrowDown, { size: 'sm' })
    ),
  )
}

const row = ({ entry, isCursor, isSelected }, { model, actionsFor }) =>
  div(
    {
      class: { row: true, selected: isSelected },
      role: 'listitem',
      events: {
        click: (event) => {
          if (isOnControl(event)) return
          model.pick(entry.path, { isToggling: true, isExtending: event.shiftKey })
        },
        dblclick: (event) => {
          if (!isOnControl(event)) model.open(entry)
        },
      },
    },
    input({
      type: 'checkbox',
      checked: isSelected,
      'aria-label': `Select ${entry.name}`,
      events: {
        click: (event) => model.pick(entry.path, { isToggling: true, isExtending: event.shiftKey }),
      },
    }),
    entryName({ entry, isCursor, onOpen: model.open }),
    span({ class: 'size' }, sizeCell({ entry })),
    menuButton({
      size: 'sm',
      variant: 'ghost',
      label: `Actions for ${entry.name}`,
      items: actionsFor(entry),
    }),
  )

export const fileList = component('rfm-file-list', {
  styles: `
    :host { display: block }
    .head, .row {
      display: grid;
      grid-template-columns: 1.75rem minmax(0, 1fr) auto 2rem;
      align-items: center;
      column-gap: var(--imp-space-1, 4px);
      padding-inline: var(--imp-space-2, 8px);
      color: var(--imp-color-text, #0f172a);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    .head {
      padding-block: var(--imp-space-1, 4px);
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    .row {
      min-block-size: 2.5rem;
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      content-visibility: auto;
      contain-intrinsic-block-size: auto 2.5rem;
      cursor: default;
    }
    .row:hover { background: var(--imp-color-surface-hover, #f1f5f9) }
    .row.selected {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 10%, var(--imp-color-surface, #ffffff));
    }
    .size {
      color: var(--imp-color-secondary, #64748b);
      text-align: end;
      white-space: nowrap;
    }
    input { margin: 0; justify-self: center }
    input:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 2px;
    }
    @media (forced-colors: active) {
      .row.selected { outline: var(--imp-border-width, 1px) solid Highlight }
    }
  `,
  setup: (self, { model, actionsFor }) => {
    const rows = computed(
      [model.visible, model.cursor, model.selected],
      (entries, cursorPath, selectedPaths) =>
        entries.map((entry) => ({
          entry,
          isCursor: entry.path === cursorPath,
          isSelected: selectedPaths.includes(entry.path),
        })),
    )
    const selectedCount = computed(
      [model.visible, model.selected],
      (entries, selectedPaths) =>
        entries.filter((entry) => selectedPaths.includes(entry.path)).length,
    )
    const selectAll = input({
      type: 'checkbox',
      'aria-label': 'Select all',
      checked: computed(
        [selectedCount, model.visible],
        (count, entries) => count > 0 && count === entries.length,
      ),
      events: {
        change: (event) => event.target.checked ? model.selectAll() : model.clearSelection(),
      },
    })
    const markPartial = () => {
      const count = selectedCount.get()
      selectAll.indeterminate = count > 0 && count < model.visible.get().length
    }
    markPartial()
    selectedCount.watch(self, markPartial)
    model.visible.watch(self, markPartial)

    return div(
      div(
        { class: 'head' },
        selectAll,
        span({ class: 'name' }, sortButton('name', 'Name', { model })),
        span({ class: 'size' }, sortButton('size', 'Size', { model })),
        span(),
      ),
      div(
        { role: 'list', 'aria-label': 'Folder contents' },
        rows.each((item) => row(item, { model, actionsFor }), (item) => item.entry.path),
      ),
    )
  },
})
