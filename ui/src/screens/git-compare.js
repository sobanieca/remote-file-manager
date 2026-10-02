import { component } from 'imp'
import { gitComparePanel } from './git-compare-panel.js'
import { app } from '../app-map.js'
import { screenFrame } from '../components/screen-frame.js'
import { screenQuery } from '../lib/screen-query.js'

export const gitCompare = component('rfm-git-compare', {
  setup: () => {
    const query = screenQuery(app.compare)
    return screenFrame(
      query.view((current) =>
        current ? gitComparePanel({ from: current.from ?? '', to: current.to ?? '' }) : null
      ),
    )
  },
})
