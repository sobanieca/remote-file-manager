import { component } from 'imp'
import { audio, div, iframe, img, video } from 'imp/html'

const MEDIA = {
  image: (source, name) => img({ src: source, alt: name }),
  video: (source) => video({ src: source, controls: true, preload: 'metadata' }),
  audio: (source) => audio({ src: source, controls: true, preload: 'metadata' }),
  pdf: (source, name) => iframe({ src: source, title: name }),
  html: (source, name) => iframe({ src: source, title: name }),
}

export const mediaPreview = component('rfm-media-preview', {
  styles: `
    :host { display: block }
    .preview {
      display: grid;
      place-items: center;
      padding: var(--imp-space-4, 16px);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      background-color: var(--imp-color-surface-sunken, #f1f5f9);
    }
    .preview.image {
      background-image: conic-gradient(
        var(--imp-color-surface, #ffffff) 25%,
        var(--imp-color-surface-sunken, #f1f5f9) 0 50%,
        var(--imp-color-surface, #ffffff) 0 75%,
        var(--imp-color-surface-sunken, #f1f5f9) 0
      );
      background-size: 1.25rem 1.25rem;
    }
    .preview.pdf, .preview.html { padding: 0; overflow: hidden }
    img, video { max-inline-size: 100%; max-block-size: 75dvb }
    audio { inline-size: min(100%, 40rem) }
    iframe { inline-size: 100%; block-size: 75dvb; border: 0; background: #ffffff }
  `,
  setup: (_self, { kind, source, name }) =>
    div({ class: ['preview', kind] }, MEDIA[kind](source, name)),
})
