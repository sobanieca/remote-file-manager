import { component } from 'imp'
import { gitDiffPanel } from './git-diff-panel.js'
import { app } from '../app-map.js'
import { screenFrame } from '../components/screen-frame.js'
import { screenQuery } from '../lib/screen-query.js'

export const gitDiff = component('rfm-git-diff', {
  setup: () => {
    const query = screenQuery(app.diff)
    return screenFrame(query.view((current) => (current ? gitDiffPanel({ query: current }) : null)))
  },
})
