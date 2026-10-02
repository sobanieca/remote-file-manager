import { notify } from 'imp/std/feedback'
import { filesHref } from './routes.js'
import { errorMessage } from './server.js'

export const switchWorktree = async (api, worktree, currentPath = '') => {
  try {
    const result = await api.post('/api/git/switch-worktree', {
      body: { path: worktree.path, currentPath },
    })
    notify({ kind: 'success', title: result.message })
    globalThis.location.assign(filesHref({ path: result.path }))
    globalThis.location.reload()
  } catch (error) {
    notify({
      kind: 'error',
      title: 'Could not switch the worktree',
      description: errorMessage(error),
    })
  }
}
