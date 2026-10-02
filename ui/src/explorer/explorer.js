import { component } from 'imp'
import { div } from 'imp/html'
import { useHttpClient } from 'imp/http'
import { navigate } from 'imp/router'
import { computed, initState, useState } from 'imp/state'
import { button, icon } from 'imp/std'
import { flex } from 'imp/std/layout'
import { segmented } from 'imp/std/inputs'
import { notify } from 'imp/std/feedback'
import {
  luArrowRightLeft,
  luColumns2,
  luCopy,
  luEye,
  luFolderPlus,
  luPanelLeft,
  luPencil,
  luTextCursorInput,
  luTrash2,
} from 'imp/icons'
import { createPane } from './pane-model.js'
import { app } from '../app-map.js'
import { screenQuery } from '../lib/screen-query.js'
import { filePane } from './file-pane.js'
import { createFileOperations, extensionForType } from '../lib/file-operations.js'
import { loadRepository } from '../lib/repository.js'
import { ROOT_PATH } from '../lib/paths.js'
import { editHref, filesHref } from '../lib/routes.js'
import { readSetting, writeSetting } from '../lib/settings.js'

const VIEW_MODE_SETTING = 'rfm-view-mode'

const LAYOUTS = [
  { value: 'single', label: 'Single pane', icon: luPanelLeft },
  { value: 'split', label: 'Split panes', icon: luColumns2 },
]

const TYPING_TAGS = ['INPUT', 'TEXTAREA', 'SELECT']

const isTyping = (event) => {
  const origin = event.composedPath()[0]
  return TYPING_TAGS.includes(origin?.tagName) || origin?.isContentEditable === true
}

const isInsideMenu = (event) =>
  event.composedPath().some((node) =>
    /^(menu|menuitem|listbox|option)/.test(node.getAttribute?.('role') ?? '')
  )

const commandButton = (label, glyph, onClick, variant = 'default') =>
  button({ size: 'sm', variant, events: { click: onClick } }, icon(glyph, { size: 'sm' }), label)

export const explorer = component('rfm-explorer', {
  styles: `
    :host { display: flex; flex-direction: column; flex: 1; min-block-size: 0 }
    .explorer {
      display: flex;
      flex-direction: column;
      gap: var(--imp-space-3, 12px);
      flex: 1;
      min-block-size: 0;
      padding: var(--imp-space-3, 12px);
    }
    .panes {
      flex: 1;
      min-block-size: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      grid-auto-rows: minmax(0, 1fr);
      gap: var(--imp-space-3, 12px);
    }
    .panes.split { grid-template-columns: repeat(2, minmax(0, 1fr)) }
    @media (max-width: 47.99rem) {
      .explorer { min-block-size: auto }
      .panes, .panes.split { grid-template-columns: minmax(0, 1fr); grid-auto-rows: minmax(24rem, auto) }
    }
  `,
  setup: (self) => {
    const api = useHttpClient(self, 'rfm.api')
    const dialogRequest = useState(self, 'rfm.dialog')
    const dialogOpen = useState(self, 'rfm.dialog-open')
    const searchOpen = useState(self, 'rfm.search-open')
    const activePane = useState(self, 'rfm.active-pane')
    const repository = useState(self, 'rfm.git')
    const query = screenQuery(app.files)
    const currentQuery = () => query.get() ?? {}

    const leftPath = computed([query], (current) => (current ? current.path || ROOT_PATH : null))
    const rightPath = computed(
      [query],
      (current) => (current?.right === undefined ? null : current.right || ROOT_PATH),
    )
    const isSplit = computed([rightPath], (path) => path !== null)
    const viewMode = initState(self, 'rfm.view-mode', readSetting(VIEW_MODE_SETTING, 'list'))
    const layout = initState(self, 'rfm.layout', isSplit.get() ? 'split' : 'single')

    const navigatePane = (side, path) => {
      const current = currentQuery()
      const otherRight = current.right === undefined ? undefined : current.right || ROOT_PATH
      navigate(
        filesHref({
          path: side === 'left' ? path : current.path || ROOT_PATH,
          right: side === 'right' ? path : otherRight,
        }),
        { replace: true },
      )
    }

    const panes = {
      left: createPane(self, {
        side: 'left',
        path: leftPath,
        api,
        onNavigate: (path) => navigatePane('left', path),
      }),
      right: createPane(self, {
        side: 'right',
        path: rightPath,
        api,
        onNavigate: (path) => navigatePane('right', path),
      }),
    }
    const active = () => (isSplit.get() ? panes[activePane.get()] : panes.left)
    const other = () => (activePane.get() === 'left' ? panes.right : panes.left)
    const otherPath = () => (isSplit.get() ? other().path.get() : null)

    if (!isSplit.get()) activePane.set('left')

    const refreshAll = async () => {
      await Promise.all([panes.left.load(), panes.right.load()])
      loadRepository(api, repository)
    }
    const operations = createFileOperations({ api, dialogRequest, onChanged: refreshAll })

    const applyReveal = (current) => {
      if (!current?.reveal) return
      active().reveal(current.reveal)
      navigate(filesHref({ path: current.path || ROOT_PATH, right: current.right }), {
        replace: true,
      })
    }
    query.watch(self, applyReveal)

    viewMode.watch(self, (mode) => writeSetting(VIEW_MODE_SETTING, mode))
    isSplit.watch(self, (split) => {
      layout.set(split ? 'split' : 'single')
      if (!split) activePane.set('left')
    })
    layout.watch(self, (value) => {
      if ((value === 'split') === isSplit.get()) return
      const leftSide = currentQuery().path || ROOT_PATH
      navigate(
        filesHref({ path: leftSide, right: value === 'split' ? leftSide : undefined }),
        { replace: true },
      )
    })

    const focusedEntry = () => active().focusedOrFirstSelected()

    const runCommand = {
      rename: () => {
        const entry = focusedEntry()
        if (entry) operations.rename(entry)
        else notify({ kind: 'warning', title: 'Nothing selected' })
      },
      view: () => active().open(focusedEntry()),
      edit: () => {
        const entry = focusedEntry()
        if (entry && !entry.isDirectory) navigate(editHref(entry.path))
      },
      copy: () => operations.transfer(active().targets(), otherPath(), false),
      move: () => operations.transfer(active().targets(), otherPath(), true),
      newFolder: () => operations.createItem(active().path.get(), true),
      remove: () => operations.remove(active().targets()),
    }

    const handleKey = (event) => {
      if (event.defaultPrevented || dialogOpen.get() || searchOpen.get()) return
      if (isTyping(event) || isInsideMenu(event)) return
      const pane = active()
      const withModifier = event.ctrlKey || event.metaKey
      if (event.key === 'Tab' && isSplit.get() && !withModifier && !event.altKey) {
        event.preventDefault()
        activePane.set(activePane.get() === 'left' ? 'right' : 'left')
      } else if (withModifier && event.key.toLowerCase() === 'a') {
        event.preventDefault()
        pane.selectAll()
      } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault()
        pane.moveCursor(event.key === 'ArrowDown' ? 1 : -1, event.shiftKey)
      } else if (event.key === 'Enter' && pane.cursorEntry()) {
        event.preventDefault()
        pane.open(pane.cursorEntry())
      } else if (event.key === ' ' && pane.cursorEntry()) {
        event.preventDefault()
        pane.toggleCursorSelection()
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        pane.up()
      } else if (event.key === 'Delete') {
        event.preventDefault()
        runCommand.remove()
      }
    }

    const handlePaste = (event) => {
      if (dialogOpen.get() || isTyping(event) || !event.clipboardData) return
      const directory = active().path.get()
      const file = event.clipboardData.files?.[0]
      if (file) {
        event.preventDefault()
        operations.saveBlob(directory, file, extensionForType(file.type))
        return
      }
      const markup = event.clipboardData.getData('text/html')
      const plainText = event.clipboardData.getData('text/plain')
      if (!markup && !plainText) return
      event.preventDefault()
      operations.saveBlob(
        directory,
        new Blob([markup || plainText], { type: markup ? 'text/html' : 'text/plain' }),
        markup ? 'html' : 'txt',
      )
    }

    document.addEventListener('keydown', handleKey, { signal: self.abortSignal })
    document.addEventListener('paste', handlePaste, { signal: self.abortSignal })

    const paneView = (side) =>
      filePane({
        model: panes[side],
        isSplit,
        isActive: computed([activePane, isSplit], (current, split) => split && current === side),
        viewMode,
        operations,
        otherPath,
        onActivate: () => {
          if (activePane.get() !== side) activePane.set(side)
        },
      })

    return div(
      { class: 'explorer' },
      flex(
        { gap: 2, verticalAlign: 'center', wrap: true },
        segmented({ value: layout, ariaLabel: 'Pane layout', size: 'sm', options: LAYOUTS }),
      ),
      div(
        { class: computed([isSplit], (split) => ({ panes: true, split })) },
        paneView('left'),
        isSplit.view((split) => (split ? paneView('right') : null)),
      ),
      flex(
        { gap: 2, wrap: true },
        commandButton('Rename', luTextCursorInput, runCommand.rename),
        commandButton('View', luEye, runCommand.view),
        commandButton('Edit', luPencil, runCommand.edit),
        isSplit.view((split) =>
          split
            ? [
              commandButton('Copy', luCopy, runCommand.copy),
              commandButton('Move', luArrowRightLeft, runCommand.move),
            ]
            : null
        ),
        commandButton('New folder', luFolderPlus, runCommand.newFolder),
        commandButton('Delete', luTrash2, runCommand.remove, 'danger'),
      ),
    )
  },
})
