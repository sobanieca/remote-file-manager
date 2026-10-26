import { init, mount } from 'imp'
import { root } from './app.js'

const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches

await init({
  theme: prefersDark ? 'imp-dark' : 'imp-light',
  translations: { en: () => import('./locales/en.js') },
})

mount('#app', root())
