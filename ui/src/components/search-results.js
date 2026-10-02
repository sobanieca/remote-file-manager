import { component } from 'imp'
import { div, kbd, span } from 'imp/html'
import { searchResult } from './search-result.js'

export const searchResults = component('rfm-search-results', {
  styles: `
    :host { display: block }
    .results {
      max-block-size: min(60dvb, 28rem);
      overflow: auto;
    }
    .hints {
      display: flex;
      flex-wrap: wrap;
      gap: var(--imp-space-3, 12px);
      margin-block-start: var(--imp-space-3, 12px);
      color: var(--imp-color-secondary, #64748b);
      font-family: var(--imp-font-family, system-ui, sans-serif);
      font-size: var(--imp-font-size-sm, 0.875rem);
    }
    kbd {
      padding: 0 var(--imp-space-1, 4px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-item, 6px);
      font-family: var(--imp-font-family-mono, monospace);
    }
  `,
  setup: (_self, { rows, onOpen, onHover }) =>
    div(
      div(
        { class: 'results', role: 'list', 'aria-label': 'Matching files' },
        rows.each(
          ({ result, isActive, position }) =>
            searchResult({ result, isActive, onOpen, onHover: () => onHover(position) }),
          ({ result, isActive, position }) => `${position}:${result.path}:${isActive}`,
        ),
      ),
      div(
        { class: 'hints' },
        span(kbd('↑'), kbd('↓'), ' move'),
        span(kbd('Enter'), ' open'),
        span(kbd('Shift'), '+', kbd('Enter'), ' reveal in files'),
        span(kbd('Esc'), ' close'),
      ),
    ),
})
