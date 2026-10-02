import { component } from 'imp'
import { code } from 'imp/html'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { initState } from 'imp/state'
import { button, heading, icon, text } from 'imp/std'
import { card, tag } from 'imp/std/display'
import { list } from 'imp/std/data'
import { loader } from 'imp/std/feedback'
import { flex, stack } from 'imp/std/layout'
import { luArrowLeft, luArrowRight, luGitCompareArrows } from 'imp/icons'
import { diffView } from '../components/diff-view.js'
import { loadFailure } from '../components/load-failure.js'
import { pageHeader } from '../components/page-header.js'
import { GIT_STATUSES } from '../lib/files.js'
import { formatRelativeTime, formatTimestamp, pluralize } from '../lib/format.js'
import { historyHref } from '../lib/routes.js'

const revisionCard = (label, { revision, commit }) =>
  card(
    { header: text({ size: 'sm', tone: 'secondary', weight: 'bold' }, label) },
    stack(
      { gap: 1 },
      code(commit ? commit.shortHash : revision),
      commit ? text(commit.subject) : text({ tone: 'secondary' }, 'Unresolved revision'),
      commit
        ? text(
          { size: 'sm', tone: 'secondary' },
          `${commit.author} · ${formatRelativeTime(commit.date)} (${formatTimestamp(commit.date)})`,
        )
        : null,
    ),
  )

const changeTags = (change) =>
  change.added === null ? tag({ size: 'sm' }, 'binary') : flex(
    { gap: 1 },
    tag({ size: 'sm', color: 'green' }, `+${change.added}`),
    tag({ size: 'sm', color: 'red' }, `-${change.deleted}`),
  )

export const gitComparePanel = component('rfm-git-compare-panel', {
  loading: () => loader({ label: 'Comparing the commits' }),
  error: (_self, error) => loadFailure('Could not compare the commits', error),
  setup: async (self, { from, to }) => {
    const api = useHttpClient(self, 'rfm.api')
    const comparison = await api.get('/api/git/compare', { query: { from, to } })
    if (self.abortSignal.aborted) return null
    const focus = initState(self, 'rfm.compare-focus', null)
    const changes = comparison.changes

    return stack(
      { gap: 4 },
      pageHeader({
        glyph: luGitCompareArrows,
        title: 'Comparing commits',
        subtitle: `${pluralize(changes.length, 'file')} changed`,
        actions: [
          button(
            { size: 'sm', events: { click: () => navigate(historyHref()) } },
            icon(luArrowLeft, { size: 'sm' }),
            'Back to history',
          ),
        ],
      }),
      flex(
        { gap: 3, verticalAlign: 'center', wrap: true },
        revisionCard('From (A)', comparison.from),
        icon(luArrowRight, { color: 'secondary' }),
        revisionCard('To (B)', comparison.to),
      ),
      changes.length > 0
        ? card(
          {
            header: flex(
              { gap: 2, verticalAlign: 'center' },
              heading({ level: 2 }, 'Changed files'),
              tag({ size: 'sm' }, changes.length),
            ),
          },
          list({
            label: 'Changed files',
            items: changes.map((change) => ({
              id: change.path,
              title: change.path,
              description: change.originalPath ? `Renamed from ${change.originalPath}` : undefined,
              tag: {
                text: change.statusCode,
                color: (GIT_STATUSES[change.status] ?? GIT_STATUSES.modified).color,
              },
            })),
            actions: (item) => changeTags(changes.find((change) => change.path === item.id)),
            events: {
              select: (event) => {
                focus.set(null)
                focus.set(event.detail.id)
              },
            },
          }),
        )
        : null,
      diffView({ files: comparison.files, focus }),
    )
  },
})
