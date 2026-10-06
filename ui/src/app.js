import { component } from 'imp'
import { initHttpClient } from 'imp/http'
import { guard, router, wait } from 'imp/router'
import { initState } from 'imp/state'
import { icon } from 'imp/std'
import { emptyState } from 'imp/std/display'
import { toast } from 'imp/std/feedback'
import { appLogo, shell, themeSelect } from 'imp/std/shell'
import { luFolder, luFolderOpen, luGitCompareArrows, luRotateCcwClock } from 'imp/icons'
import { app } from './app-map.js'
import { branchMenu } from './components/branch-menu.js'
import { dialogHost } from './components/dialog-host.js'
import { searchPalette } from './components/search-palette.js'
import { searchTrigger } from './components/search-trigger.js'
import { explorer } from './explorer/explorer.js'
import { fileView } from './screens/file-view.js'
import { fileEditor } from './screens/file-editor.js'
import { gitStatus } from './screens/git-status.js'
import { gitHistory } from './screens/git-history.js'
import { gitDiff } from './screens/git-diff.js'
import { gitCompare } from './screens/git-compare.js'
import { loadRepository } from './lib/repository.js'

const access = guard(['rfm.git'], (repository, { need }) => {
  if (need !== 'git') return true
  if (repository === undefined) return wait
  return repository ? true : '/'
})

const isSearchShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey &&
  event.key.toLowerCase() === 'p'

export const root = component('rfm-root', {
  setup: (self) => {
    const api = initHttpClient(self, 'rfm.api', {
      baseUrl: '',
      headers: { accept: 'application/json' },
      requestId: false,
    })
    const repository = initState(self, 'rfm.git')
    const searchOpen = initState(self, 'rfm.search-open', false)
    initState(self, 'rfm.dialog', null)
    initState(self, 'rfm.dialog-open', false)
    initState(self, 'rfm.active-pane', 'left')

    loadRepository(api, repository)

    globalThis.addEventListener('keydown', (event) => {
      if (!isSearchShortcut(event)) return
      event.preventDefault()
      event.stopPropagation()
      searchOpen.set(true)
    }, { capture: true, signal: self.abortSignal })

    return shell(
      {
        logo: appLogo({
          label: 'Remote File Manager',
          icon: icon(luFolderOpen, { size: 'lg', color: 'primary' }),
          href: app.files.href(),
        }),
        navbar: {
          label: 'Sections',
          map: app,
          icons: {
            [app.files]: luFolder,
            [app.status]: luGitCompareArrows,
            [app.history]: luRotateCcwClock,
          },
        },
        extras: [searchTrigger(), branchMenu(), themeSelect()],
        breadcrumbs: false,
        maxWidth: 'none',
      },
      toast(),
      dialogHost(),
      searchPalette(),
      router({
        map: app,
        access,
        title: ({ crumbs }) => `${crumbs.at(-1)} · Remote File Manager`,
        screens: {
          [app.files]: () => explorer(),
          [app.files.view]: () => fileView(),
          [app.files.edit]: () => fileEditor(),
          [app.status]: () => gitStatus(),
          [app.history]: () => gitHistory(),
          [app.diff]: () => gitDiff(),
          [app.compare]: () => gitCompare(),
        },
        notFound: () => emptyState({ title: 'Page not found' }),
      }),
    )
  },
})
