import { component } from 'imp'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { button, icon } from 'imp/std'
import { loader } from 'imp/std/feedback'
import { stack } from 'imp/std/layout'
import { luArrowLeft, luFileDiff, luPencil, luRotateCcwClock } from 'imp/icons'
import { diffView } from '../components/diff-view.js'
import { loadFailure } from '../components/load-failure.js'
import { pageHeader } from '../components/page-header.js'
import { formatRelativeTime } from '../lib/format.js'
import { parentOf } from '../lib/paths.js'
import { editHref, filesHref, historyHref, statusHref } from '../lib/routes.js'

const BACK_TARGETS = {
  history: { label: 'Back to history', href: () => historyHref() },
  status: { label: 'Back to status', href: () => statusHref() },
  files: {
    label: 'Back to files',
    href: (filePath) => filesHref({ path: parentOf(filePath ?? '.') }),
  },
}

const subtitleOf = (diff) => {
  if (diff.commit) {
    return `${diff.commit.shortHash} · ${diff.commit.author} · ${
      formatRelativeTime(diff.commit.date)
    }`
  }
  return diff.subtitle ?? ''
}

const navigationButton = (label, glyph, href) =>
  button(
    { size: 'sm', events: { click: () => navigate(href) } },
    icon(glyph, { size: 'sm' }),
    label,
  )

export const gitDiffPanel = component('rfm-git-diff-panel', {
  loading: () => loader({ label: 'Reading the diff' }),
  error: (_self, error) => loadFailure('Could not read the diff', error),
  setup: async (self, { query }) => {
    const api = useHttpClient(self, 'rfm.api')
    const diff = await api.get('/api/git/diff', { query })
    const back = BACK_TARGETS[diff.back] ?? BACK_TARGETS.status

    return stack(
      { gap: 4 },
      pageHeader({
        glyph: luFileDiff,
        title: diff.title,
        subtitle: subtitleOf(diff),
        actions: [
          diff.filePath ? navigationButton('Edit', luPencil, editHref(diff.filePath)) : null,
          diff.filePath
            ? navigationButton('History', luRotateCcwClock, historyHref(diff.filePath))
            : null,
          navigationButton(back.label, luArrowLeft, back.href(diff.filePath)),
        ].filter(Boolean),
      }),
      diffView({ files: diff.files }),
    )
  },
})
