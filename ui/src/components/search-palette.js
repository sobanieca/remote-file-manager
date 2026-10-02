import { component } from 'imp'
import { useHttpClient } from 'imp/http'
import { navigate, useRoute } from 'imp/router'
import { computed, initState, useState } from 'imp/state'
import { text } from 'imp/std'
import { dialog, stack } from 'imp/std/layout'
import { textField } from 'imp/std/inputs'
import { searchResults } from './search-results.js'
import { errorMessage } from '../lib/server.js'
import { parentOf } from '../lib/paths.js'
import { filesHref, viewHref } from '../lib/routes.js'

const SEARCH_DELAY = 70

const describeIndex = (summary) =>
  `${summary.indexedCount.toLocaleString()} entries${summary.truncated ? ' (partial index)' : ''}`

const describeOutcome = (response, query) => {
  if (!query) return describeIndex(response)
  if (response.results.length === 0) return 'No matches'
  if (response.total > response.results.length) {
    return `Top ${response.results.length} of ${response.total.toLocaleString()} matches`
  }
  return `${response.total} ${response.total === 1 ? 'match' : 'matches'}`
}

const explorerTarget = (route, activePane, path, reveal) => {
  const isExplorer = route.path === '/'
  const right = isExplorer ? route.query.right : undefined
  if (isExplorer && right !== undefined && activePane === 'right') {
    return filesHref({ path: route.query.path, right: path, reveal })
  }
  return filesHref({ path, right, reveal })
}

export const searchPalette = component('rfm-search-palette', {
  styles: ':host { --imp-dialog-inline-size: 44rem }',
  setup: (self) => {
    const api = useHttpClient(self, 'rfm.api')
    const open = useState(self, 'rfm.search-open')
    const activePane = useState(self, 'rfm.active-pane')
    const query = initState(self, 'rfm.search-query', '')
    const results = initState(self, 'rfm.search-results', [])
    const activeIndex = initState(self, 'rfm.search-active', 0)
    const status = initState(self, 'rfm.search-status', '')
    const route = useRoute()

    const search = async () => {
      self.controller?.abort()
      const controller = new AbortController()
      self.controller = controller
      const term = query.get().trim()
      try {
        const response = await api.get('/api/search', {
          query: { q: term },
          signal: controller.signal,
        })
        if (controller.signal.aborted) return
        results.set(response.results ?? [])
        activeIndex.set(0)
        status.set(describeOutcome(response, term))
      } catch (error) {
        if (!controller.signal.aborted) status.set(errorMessage(error))
      }
    }

    const scheduleSearch = () => {
      clearTimeout(self.searchTimer)
      self.searchTimer = setTimeout(search, SEARCH_DELAY)
    }

    const openResult = (result, reveal) => {
      open.set(false)
      if (reveal) {
        navigate(explorerTarget(route.get(), activePane.get(), parentOf(result.path), result.path))
      } else if (result.isDirectory) {
        navigate(explorerTarget(route.get(), activePane.get(), result.path))
      } else {
        navigate(viewHref(result.path))
      }
    }

    const moveActive = (step) => {
      const count = results.get().length
      if (count === 0) return
      activeIndex.set((index) => Math.min(Math.max(index + step, 0), count - 1))
    }

    const field = textField({
      value: query,
      type: 'search',
      ariaLabel: 'Search files',
      placeholder: 'Search files and folders by name or path',
      autocomplete: 'off',
    })
    field.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        moveActive(event.key === 'ArrowDown' ? 1 : -1)
      } else if (event.key === 'Enter') {
        event.preventDefault()
        const result = results.get()[activeIndex.get()]
        if (result) openResult(result, event.shiftKey)
      }
    })

    query.watch(self, scheduleSearch)
    open.watch(self, (isOpen) => {
      if (!isOpen) {
        self.controller?.abort()
        return
      }
      search()
      requestAnimationFrame(() => field.focus())
    })

    const rows = computed(
      [results, activeIndex],
      (items, index) =>
        items.map((result, position) => ({ result, position, isActive: position === index })),
    )

    return dialog(
      { title: 'Search files', open },
      stack(
        { gap: 3 },
        field,
        text({ size: 'sm', tone: 'secondary' }, status.text()),
        searchResults({
          rows,
          onOpen: openResult,
          onHover: (position) => {
            if (position !== activeIndex.get()) activeIndex.set(position)
          },
        }),
      ),
    )
  },
  onRemove: (self) => {
    clearTimeout(self.searchTimer)
    self.controller?.abort()
  },
})
