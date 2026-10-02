import { component } from 'imp'
import { fileEditorPanel } from './file-editor-panel.js'
import { app } from '../app-map.js'
import { screenFrame } from '../components/screen-frame.js'
import { screenQuery } from '../lib/screen-query.js'

export const fileEditor = component('rfm-file-editor', {
  setup: () => {
    const query = screenQuery(app.files.edit)
    return screenFrame(
      query.view((current) => (current ? fileEditorPanel({ path: current.path ?? '' }) : null)),
    )
  },
})
