import { component } from 'imp'
import { code } from 'imp/html'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { button, heading, icon, text } from 'imp/std'
import { card, descriptionList, tag } from 'imp/std/display'
import { list, timeline } from 'imp/std/data'
import { loader, notice } from 'imp/std/feedback'
import { flex, stack } from 'imp/std/layout'
import { luArrowRight, luEye, luFileDiff, luGitBranch, luRotateCcwClock } from 'imp/icons'
import { loadFailure } from '../components/load-failure.js'
import { pageHeader } from '../components/page-header.js'
import { GIT_STATUSES } from '../lib/files.js'
import { diffHref, historyHref, viewHref } from '../lib/routes.js'
import { switchWorktree } from '../lib/worktrees.js'

const sectionCard = ({ title, count, actions = [] }, ...content) =>
  card(
    {
      header: flex(
        { horizontalAlign: 'justify', verticalAlign: 'center', wrap: true },
        flex(
          { gap: 2, verticalAlign: 'center' },
          heading({ level: 2 }, title),
          count === undefined ? null : tag({ size: 'sm' }, count),
        ),
        actions.length > 0 ? flex({ gap: 2 }, ...actions) : null,
      ),
    },
    ...content,
  )

const smallButton = (label, glyph, onClick) =>
  button({ size: 'sm', events: { click: onClick } }, icon(glyph, { size: 'sm' }), label)

const changeItem = (change, mode) => {
  const status = GIT_STATUSES[change.status] ?? GIT_STATUSES.modified
  let href
  if (change.canDiff) href = diffHref({ path: change.servedPath, mode })
  else if (change.canOpen) href = viewHref(change.servedPath)
  return {
    id: change.path,
    title: change.displayPath,
    description: change.originalDisplayPath
      ? `Renamed from ${change.originalDisplayPath}`
      : undefined,
    tag: { text: change.statusCode, color: status.color },
    href,
  }
}

const changeSection = (title, changes, mode, actions) => {
  if (changes.length === 0) return null
  const byPath = new Map(changes.map((change) => [change.path, change]))
  return sectionCard(
    { title, count: changes.length, actions },
    list({
      label: title,
      items: changes.map((change) => changeItem(change, mode)),
      actions: (item) => {
        const change = byPath.get(item.id)
        return change.canDiff && change.canOpen
          ? button(
            {
              size: 'sm',
              variant: 'ghost',
              square: true,
              label: `Open ${change.displayPath}`,
              events: { click: () => navigate(viewHref(change.servedPath)) },
            },
            icon(luEye, { size: 'sm' }),
          )
          : null
      },
    }),
  )
}

const worktreeTag = (worktree) => {
  if (worktree.isCurrent) return { text: 'current', color: 'green' }
  if (worktree.isPrunable) return { text: 'missing', color: 'red' }
  if (worktree.isLocked) return { text: 'locked', color: 'amber' }
  if (worktree.isDetached) return { text: 'detached', color: 'gray' }
  return undefined
}

const worktreeSection = (api, worktrees) => {
  if (worktrees.length < 2) return null
  const byPath = new Map(worktrees.map((worktree) => [worktree.path, worktree]))
  return sectionCard(
    { title: 'Worktrees', count: worktrees.length },
    text({ size: 'sm', tone: 'secondary' }, "Switching serves that worktree's files."),
    list({
      label: 'Worktrees',
      items: worktrees.map((worktree) => ({
        id: worktree.path,
        title: worktree.label,
        description: `${worktree.path} · ${worktree.shortHead ?? '—'}`,
        icon: luGitBranch,
        tag: worktreeTag(worktree),
      })),
      actions: (item) => {
        const worktree = byPath.get(item.id)
        return worktree.isCurrent ? null : button(
          {
            size: 'sm',
            disabled: worktree.isPrunable,
            events: { click: () => switchWorktree(api, worktree) },
          },
          icon(luArrowRight, { size: 'sm' }),
          'Switch',
        )
      },
    }),
  )
}

const recentCommits = (commits) => {
  if (commits.length === 0) return null
  return sectionCard(
    {
      title: 'Recent commits',
      actions: [smallButton('View all', luRotateCcwClock, () => navigate(historyHref()))],
    },
    timeline({
      label: 'Recent commits',
      items: commits.map((commit) => ({
        id: commit.hash,
        time: commit.date,
        title: commit.subject,
        description: `${commit.shortHash} · ${commit.author}`,
        href: diffHref({ commit: commit.hash }),
      })),
    }),
  )
}

const summaryItems = (status) => {
  const { repository } = status
  return [
    { term: 'HEAD', details: code(repository.head ?? '—') },
    { term: 'Upstream', details: repository.upstream ?? 'none' },
    repository.upstream
      ? { term: 'Ahead / behind', details: `↑${repository.ahead} ↓${repository.behind}` }
      : null,
    { term: 'Changes', details: String(status.changeCount) },
  ].filter(Boolean)
}

export const gitStatusPanel = component('rfm-git-status-panel', {
  loading: () => loader({ label: 'Reading the repository' }),
  error: (_self, error) => loadFailure('Could not read the git status', error),
  setup: async (self) => {
    const api = useHttpClient(self, 'rfm.api')
    const status = await api.get('/api/git/status')
    const { repository, scopePath } = status
    return stack(
      { gap: 4 },
      pageHeader({
        glyph: luGitBranch,
        title: repository.branch,
        subtitle: scopePath
          ? `${repository.repoRoot} · changes in ${scopePath}/ only`
          : repository.repoRoot,
        actions: [smallButton('Commit history', luRotateCcwClock, () => navigate(historyHref()))],
      }),
      card({ padding: 'sm' }, descriptionList({ columns: 3, items: summaryItems(status) })),
      status.changeCount === 0
        ? notice({
          kind: 'success',
          title: scopePath ? 'No changes in this directory' : 'The working tree is clean',
        })
        : null,
      worktreeSection(api, status.worktrees),
      changeSection('Staged changes', status.staged, 'staged', [
        smallButton('View staged diff', luFileDiff, () => navigate(diffHref({ staged: '1' }))),
      ]),
      changeSection('Unstaged changes', status.unstaged, 'unstaged', [
        smallButton('View all changes', luFileDiff, () => navigate(diffHref({ all: '1' }))),
      ]),
      changeSection('Untracked files', status.untracked, 'unstaged'),
      recentCommits(status.recentCommits),
    )
  },
})
