import { component } from 'imp'
import { useHttpClient } from 'imp/http'
import { navigate, useRoute } from 'imp/router'
import { useState } from 'imp/state'
import { button, icon, menuButton } from 'imp/std'
import { tag } from 'imp/std/display'
import { flex } from 'imp/std/layout'
import { luGitBranch, luGitCompareArrows } from 'imp/icons'
import { statusHref } from '../lib/routes.js'
import { switchWorktree } from '../lib/worktrees.js'

const trackingTags = (repository) => [
  repository.ahead > 0 ? tag({ size: 'sm', color: 'blue' }, `↑${repository.ahead}`) : null,
  repository.behind > 0 ? tag({ size: 'sm', color: 'orange' }, `↓${repository.behind}`) : null,
  repository.changeCount > 0 ? tag({ size: 'sm', color: 'amber' }, repository.changeCount) : null,
]

const triggerContent = (repository) =>
  flex(
    { gap: 2, verticalAlign: 'center' },
    icon(luGitBranch, { size: 'sm' }),
    repository.branch,
    ...trackingTags(repository),
  )

export const branchMenu = component('rfm-branch-menu', {
  setup: (self) => {
    const api = useHttpClient(self, 'rfm.api')
    const repository = useState(self, 'rfm.git')
    const route = useRoute()

    const switchTo = (worktree) => {
      const current = route.get()
      return switchWorktree(api, worktree, current.path === '/' ? current.query.path : '')
    }

    const worktreeItems = (worktrees) =>
      worktrees.map((worktree) => ({
        id: worktree.path,
        label: `${worktree.label} · ${worktree.path}`,
        checked: worktree.isCurrent,
        disabled: worktree.isCurrent || worktree.isPrunable,
        onClick: () => switchTo(worktree),
      }))

    return repository.view((current) => {
      if (!current) return null
      if (current.worktrees.length < 2) {
        return button(
          { variant: 'ghost', size: 'sm', events: { click: () => navigate(statusHref()) } },
          triggerContent(current),
        )
      }
      return menuButton(
        {
          trigger: 'arrow',
          variant: 'ghost',
          size: 'sm',
          label: `Branch ${current.branch}, switch worktree`,
          items: [
            ...worktreeItems(current.worktrees),
            {
              id: 'status',
              label: 'Git status',
              icon: luGitCompareArrows,
              onClick: () => navigate(statusHref()),
            },
          ],
        },
        triggerContent(current),
      )
    })
  },
})
