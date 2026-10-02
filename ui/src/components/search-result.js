import { component } from 'imp'
import { button as plainButton, div, mark, span } from 'imp/html'
import { button, icon } from 'imp/std'
import { luFolderSearch } from 'imp/icons'
import { iconOfKind } from '../lib/files.js'

const highlighted = (text, offset, marks) =>
  [...text].map((character, index) => marks.has(offset + index) ? mark(character) : character)

const pathLabel = (result) => {
  const marks = new Set(result.positions ?? [])
  const slash = result.path.lastIndexOf('/')
  const directory = slash === -1 ? '' : result.path.slice(0, slash + 1)
  const name = result.path.slice(slash + 1)
  return [
    span({ class: 'name' }, highlighted(name, slash + 1, marks)),
    directory ? span({ class: 'directory' }, highlighted(directory, 0, marks)) : null,
  ]
}

export const searchResult = component('rfm-search-result', {
  styles: `
    :host { display: block }
    .row { display: flex; align-items: center; gap: var(--imp-space-1, 4px) }
    .open {
      flex: 1;
      min-inline-size: 0;
      display: flex;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px);
      border: var(--imp-border-width, 1px) solid transparent;
      border-radius: var(--imp-radius-item, 6px);
      background: none;
      color: var(--imp-color-text, #0f172a);
      font: inherit;
      text-align: start;
      cursor: pointer;
    }
    .open:focus-visible {
      outline: var(--imp-focus-ring-width, 2px) solid var(--imp-color-primary, #2563eb);
      outline-offset: 1px;
    }
    .row.active .open { background: var(--imp-color-surface-hover, #f1f5f9) }
    .label { display: flex; flex-direction: column; min-inline-size: 0 }
    .name, .directory { overflow: hidden; text-overflow: ellipsis; white-space: nowrap }
    .directory { color: var(--imp-color-secondary, #64748b); font-size: var(--imp-font-size-sm, 0.875rem) }
    mark {
      background: color-mix(in srgb, var(--imp-color-warning, #d97706) 30%, transparent);
      color: inherit;
      border-radius: 2px;
    }
    @media (forced-colors: active) {
      .row.active .open { border-color: Highlight }
    }
  `,
  setup: (_self, { result, isActive, onOpen, onHover }) => {
    const row = div(
      {
        class: { row: true, active: isActive },
        role: 'listitem',
        events: { pointermove: onHover },
      },
      plainButton(
        {
          class: 'open',
          type: 'button',
          tabindex: '-1',
          title: result.path,
          events: { click: (event) => onOpen(result, event.shiftKey) },
        },
        icon(iconOfKind(result.kind)),
        span({ class: 'label' }, pathLabel(result)),
      ),
      button(
        {
          variant: 'ghost',
          size: 'sm',
          square: true,
          label: `Reveal ${result.path} in the file explorer`,
          events: { click: () => onOpen(result, true) },
        },
        icon(luFolderSearch, { size: 'sm' }),
      ),
    )
    if (isActive) requestAnimationFrame(() => row.scrollIntoView({ block: 'nearest' }))
    return row
  },
})
