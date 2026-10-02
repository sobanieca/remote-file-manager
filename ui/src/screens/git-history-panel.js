import { component } from 'imp'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { computed, initState } from 'imp/state'
import { button, icon, link, text } from 'imp/std'
import { emptyState } from 'imp/std/display'
import { list } from 'imp/std/data'
import { loader, notice, notify } from 'imp/std/feedback'
import { flex, stack } from 'imp/std/layout'
import { luArrowRightLeft, luFileDiff, luGitCompareArrows, luRotateCcwClock } from 'imp/icons'
import { loadFailure } from '../components/load-failure.js'
import { pageHeader } from '../components/page-header.js'
import { formatRelativeTime } from '../lib/format.js'
import { compareHref, diffHref, historyHref, statusHref } from '../lib/routes.js'

const refLabel = (ref) => ref.replace(/^HEAD -> /, '')

const commitItem = (commit) => ({
  id: commit.hash,
  title: commit.subject,
  description: `${commit.shortHash} · ${commit.author} · ${formatRelativeTime(commit.date)}`,
  href: diffHref({ commit: commit.hash }),
  tag: commit.refs.length > 0
    ? {
      text: refLabel(commit.refs[0]),
      color: commit.refs[0].startsWith('HEAD') ? 'green' : 'blue',
    }
    : undefined,
})

const pickButton = (label, side, commit, picks) =>
  button(
    {
      size: 'sm',
      pressed: computed([picks], (current) => current[side] === commit.hash),
      label: `Compare ${side === 'from' ? 'from' : 'to'} ${commit.shortHash}`,
      events: { click: () => picks.set((current) => ({ ...current, [side]: commit.hash })) },
    },
    label,
  )

const shortOf = (commits, hash) => commits.find((commit) => commit.hash === hash)?.shortHash ?? ''

export const gitHistoryPanel = component('rfm-git-history-panel', {
  loading: () => loader({ label: 'Reading the history' }),
  error: (_self, error) => loadFailure('Could not read the history', error),
  setup: async (self, { path }) => {
    const api = useHttpClient(self, 'rfm.api')
    const firstPage = await api.get('/api/git/log', { query: { path: path || undefined, skip: 0 } })
    if (self.abortSignal.aborted) return null

    const commits = initState(self, 'rfm.history-commits', firstPage.commits)
    const hasMore = initState(self, 'rfm.history-more', firstPage.hasMore)
    const picks = initState(self, 'rfm.history-picks', {
      from: firstPage.commits[1]?.hash ?? null,
      to: firstPage.commits[0]?.hash ?? null,
    })

    const loadMore = async () => {
      const page = await api.get('/api/git/log', {
        query: { path: path || undefined, skip: commits.get().length },
      })
      commits.set((loaded) => [...loaded, ...page.commits])
      hasMore.set(page.hasMore)
    }

    const compare = () => {
      const { from, to } = picks.get()
      if (!from || !to) return notify({ kind: 'warning', title: 'Pick both an A and a B commit' })
      if (from === to) return notify({ kind: 'warning', title: 'Pick two different commits' })
      return navigate(compareHref(from, to))
    }

    const header = pageHeader({
      glyph: luRotateCcwClock,
      title: 'Commit history',
      subtitle: firstPage.repository.branch,
      actions: [
        button(
          { size: 'sm', events: { click: () => navigate(statusHref()) } },
          icon(luGitCompareArrows, { size: 'sm' }),
          'Git status',
        ),
      ],
    })

    const scope = firstPage.scopePath
      ? notice(
        { kind: 'info', title: `History for ${firstPage.scopePath}` },
        link({ href: historyHref() }, 'Show the whole history'),
      )
      : null

    if (firstPage.commits.length === 0) {
      return stack(
        { gap: 4 },
        header,
        scope,
        emptyState({
          icon: luRotateCcwClock,
          title: `No commits found${firstPage.scopePath ? ' for this path' : ''}`,
        }),
      )
    }

    return stack(
      { gap: 4 },
      header,
      scope,
      flex(
        { gap: 2, verticalAlign: 'center', wrap: true },
        text(
          { inline: true, size: 'sm', tone: 'secondary' },
          'Pick A (from) and B (to) to compare:',
        ),
        text(
          { inline: true, size: 'sm', weight: 'bold' },
          computed(
            [picks, commits],
            ({ from, to }, loaded) =>
              from && to ? `${shortOf(loaded, from)} → ${shortOf(loaded, to)}` : '',
          ).text(),
        ),
        button(
          {
            size: 'sm',
            events: { click: () => picks.set(({ from, to }) => ({ from: to, to: from })) },
          },
          icon(luArrowRightLeft, { size: 'sm' }),
          'Swap',
        ),
        button(
          { size: 'sm', variant: 'primary', events: { click: compare } },
          icon(luGitCompareArrows, { size: 'sm' }),
          'Compare',
        ),
      ),
      list({
        label: 'Commits',
        items: computed([commits], (loaded) => loaded.map(commitItem)),
        hasMore,
        onLoadMore: loadMore,
        leading: (item) => {
          const commit = commits.get().find((candidate) => candidate.hash === item.id)
          return flex(
            { joined: true },
            pickButton('A', 'from', commit, picks),
            pickButton('B', 'to', commit, picks),
          )
        },
        actions: (item) =>
          button(
            {
              size: 'sm',
              variant: 'ghost',
              square: true,
              label: `View the changes of ${item.title}`,
              events: { click: () => navigate(diffHref({ commit: item.id })) },
            },
            icon(luFileDiff, { size: 'sm' }),
          ),
      }),
    )
  },
})
