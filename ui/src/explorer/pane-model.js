import { navigate } from 'imp/router'
import { computed, initState } from 'imp/state'
import { notify } from 'imp/std/feedback'
import { errorMessage } from '../lib/server.js'
import { parentOf, ROOT_PATH } from '../lib/paths.js'
import { entryHref, viewHref } from '../lib/routes.js'
import { readSetting, writeSetting } from '../lib/settings.js'

const SORT_SETTING = 'rfm-sort'
const DEFAULT_SORT = { key: 'name', direction: 'ascending' }
const SORT_KEYS = ['name', 'size', 'modified']

const readSort = () => {
  const [key, direction] = readSetting(SORT_SETTING, '').split(':')
  return SORT_KEYS.includes(key) && ['ascending', 'descending'].includes(direction)
    ? { key, direction }
    : DEFAULT_SORT
}

const timeOf = (entry) => (entry.modifiedAt ? new Date(entry.modifiedAt).getTime() : 0)

const compareNames = (first, second) =>
  first.name.localeCompare(second.name, undefined, { numeric: true, sensitivity: 'base' })

const COMPARATORS = {
  name: compareNames,
  size: (first, second) => (first.size ?? -1) - (second.size ?? -1),
  modified: (first, second) => timeOf(first) - timeOf(second),
}

const compareEntries = (sort) => (first, second) => {
  if (first.isDirectory !== second.isDirectory) return first.isDirectory ? -1 : 1
  const result = COMPARATORS[sort.key](first, second) || first.name.localeCompare(second.name)
  return sort.direction === 'descending' ? -result : result
}

const filterEntries = (entries, needle) => {
  const term = needle.trim().toLowerCase()
  return term ? entries.filter((entry) => entry.name.toLowerCase().includes(term)) : entries
}

export const createPane = (self, { side, path, api, onNavigate }) => {
  const scope = `rfm.pane-${side}`
  const listing = initState(self, `${scope}.listing`)
  const loading = initState(self, `${scope}.loading`, false)
  const filter = initState(self, `${scope}.filter`, '')
  const selected = initState(self, `${scope}.selected`, [])
  const cursor = initState(self, `${scope}.cursor`, null)
  const sort = initState(self, `${scope}.sort`, readSort())

  const visible = computed(
    [listing, filter, sort],
    (current, needle, order) =>
      [...filterEntries(current?.entries ?? [], needle)].sort(compareEntries(order)),
  )

  const history = []
  let shownPath = path.get()
  let isGoingBack = false
  let anchor = null
  let pendingReveal = null
  let requestNumber = 0

  const entryAt = (entryPath) => visible.get().find((entry) => entry.path === entryPath)

  const applyReveal = () => {
    if (pendingReveal === null) return
    const target = pendingReveal
    pendingReveal = null
    const entry = entryAt(target)
    if (!entry) {
      notify({ kind: 'warning', title: `Could not find ${target}` })
      return
    }
    selected.set([entry.path])
    cursor.set(entry.path)
    anchor = entry.path
  }

  const keepKnown = (paths) => {
    const known = new Set(visible.get().map((entry) => entry.path))
    return paths.filter((entryPath) => known.has(entryPath))
  }

  const load = async () => {
    const targetPath = path.get()
    if (targetPath === null) return
    requestNumber += 1
    const number = requestNumber
    loading.set(true)
    try {
      const response = await api.get('/api/entries', { query: { path: targetPath } })
      if (number !== requestNumber) return
      listing.set({ path: response.path, entries: response.entries, totalSize: response.totalSize })
      selected.set(keepKnown)
      cursor.set((current) => (current !== null && entryAt(current) ? current : null))
      applyReveal()
    } catch (error) {
      if (number !== requestNumber) return
      if (error.body?.isFile) {
        navigate(viewHref(error.body.path))
        return
      }
      listing.set({ path: targetPath, entries: [], totalSize: 0, error: errorMessage(error) })
    } finally {
      if (number === requestNumber) loading.set(false)
    }
  }

  path.watch(self, (nextPath) => {
    if (nextPath === shownPath) return
    if (!isGoingBack && shownPath !== null && nextPath !== null) history.push(shownPath)
    isGoingBack = false
    shownPath = nextPath
    filter.set('')
    selected.set([])
    cursor.set(null)
    anchor = null
    load()
  })

  filter.watch(self, () => selected.set(keepKnown))

  sort.watch(self, (order) => writeSetting(SORT_SETTING, `${order.key}:${order.direction}`))

  const navigateTo = (targetPath) => onNavigate(targetPath)

  const back = () => {
    if (history.length === 0) return
    isGoingBack = true
    onNavigate(history.pop())
  }

  const up = () => {
    const current = path.get()
    if (current && current !== ROOT_PATH) navigateTo(parentOf(current))
  }

  const open = (entry) => {
    if (!entry) return
    if (entry.isDirectory && !entry.isDeleted) navigateTo(entry.path)
    else navigate(entryHref(entry))
  }

  const reveal = (targetPath) => {
    pendingReveal = targetPath
    if (!loading.get() && listing.get()?.path === parentOf(targetPath)) applyReveal()
  }

  const cursorEntry = () => (cursor.get() === null ? null : entryAt(cursor.get()) ?? null)

  const selectedEntries = () => {
    const chosen = new Set(selected.get())
    return visible.get().filter((entry) => chosen.has(entry.path))
  }

  const targets = () => {
    const chosen = selectedEntries()
    if (chosen.length > 0) return chosen
    const focused = cursorEntry()
    return focused ? [focused] : []
  }

  const focusedOrFirstSelected = () => cursorEntry() ?? selectedEntries()[0] ?? null

  const selectRange = (fromPath, toPath) => {
    const paths = visible.get().map((entry) => entry.path)
    const fromIndex = paths.indexOf(fromPath)
    const toIndex = paths.indexOf(toPath)
    if (fromIndex === -1 || toIndex === -1) return
    selected.set(paths.slice(Math.min(fromIndex, toIndex), Math.max(fromIndex, toIndex) + 1))
  }

  const moveCursor = (step, isExtending) => {
    const entries = visible.get()
    if (entries.length === 0) return
    const currentIndex = entries.findIndex((entry) => entry.path === cursor.get())
    const nextIndex = currentIndex === -1
      ? (step > 0 ? 0 : entries.length - 1)
      : Math.min(Math.max(currentIndex + step, 0), entries.length - 1)
    const nextPath = entries[nextIndex].path
    if (isExtending) {
      anchor = anchor ?? cursor.get() ?? nextPath
      selectRange(anchor, nextPath)
    } else {
      anchor = null
    }
    cursor.set(nextPath)
  }

  const toggleSelection = (entryPath) => {
    selected.set((paths) =>
      paths.includes(entryPath)
        ? paths.filter((candidate) => candidate !== entryPath)
        : [...paths, entryPath]
    )
    anchor = entryPath
  }

  const toggleCursorSelection = () => {
    if (cursor.get() !== null) toggleSelection(cursor.get())
  }

  const pick = (entryPath, { isToggling = false, isExtending = false } = {}) => {
    if (isExtending && anchor !== null) selectRange(anchor, entryPath)
    else if (isToggling) toggleSelection(entryPath)
    else anchor = entryPath
    cursor.set(entryPath)
  }

  const selectAll = () => selected.set(visible.get().map((entry) => entry.path))

  const clearSelection = () => selected.set([])

  const setSort = ({ key, direction }) =>
    sort.set(direction === 'none' || !SORT_KEYS.includes(key) ? DEFAULT_SORT : { key, direction })

  load()

  return {
    side,
    path,
    listing,
    loading,
    filter,
    selected,
    cursor,
    visible,
    load,
    navigateTo,
    back,
    up,
    open,
    reveal,
    cursorEntry,
    focusedOrFirstSelected,
    selectedEntries,
    targets,
    moveCursor,
    toggleCursorSelection,
    pick,
    selectAll,
    clearSelection,
    setSort,
  }
}
