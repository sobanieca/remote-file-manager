import { component } from 'imp'
import { gitHistoryPanel } from './git-history-panel.js'
import { app } from '../app-map.js'
import { screenFrame } from '../components/screen-frame.js'
import { screenQuery } from '../lib/screen-query.js'

export const gitHistory = component('rfm-git-history', {
  setup: () => {
    const query = screenQuery(app.history)
    return screenFrame(
      query.view((current) => (current ? gitHistoryPanel({ path: current.path ?? '' }) : null)),
    )
  },
})
