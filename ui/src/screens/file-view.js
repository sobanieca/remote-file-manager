import { component } from 'imp'
import { fileDetails } from './file-details.js'
import { app } from '../app-map.js'
import { screenFrame } from '../components/screen-frame.js'
import { screenQuery } from '../lib/screen-query.js'

export const fileView = component('rfm-file-view', {
  setup: () => {
    const query = screenQuery(app.files.view)
    return screenFrame(
      query.view((current) => (current ? fileDetails({ path: current.path ?? '' }) : null)),
    )
  },
})
