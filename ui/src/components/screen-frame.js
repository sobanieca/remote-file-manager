import { component } from 'imp'
import { div } from 'imp/html'

export const screenFrame = component('rfm-screen-frame', {
  styles: `
    :host { display: block }
    .frame {
      display: flex;
      flex-direction: column;
      gap: var(--imp-space-4, 16px);
      padding: var(--imp-space-4, 16px) var(--imp-space-page, 16px);
    }
  `,
  setup: (_self, ...content) => div({ class: 'frame' }, ...content),
})
