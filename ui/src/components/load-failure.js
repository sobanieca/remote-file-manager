import { button } from 'imp/std'
import { emptyState } from 'imp/std/display'
import { luTriangleAlert } from 'imp/icons'
import { errorMessage } from '../lib/server.js'

export const loadFailure = (title, error, retry) =>
  emptyState(
    { icon: luTriangleAlert, kind: 'error', title, description: errorMessage(error) },
    retry ? button({ events: { click: retry } }, 'Try again') : null,
  )
