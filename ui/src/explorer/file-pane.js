import { component } from 'imp'
import { div, input, span } from 'imp/html'
import { computed, initState } from 'imp/state'
import { button, icon, menuButton, text } from 'imp/std'
import { emptyState } from 'imp/std/display'
import { loader } from 'imp/std/feedback'
import { flex } from 'imp/std/layout'
import { segmented, textField } from 'imp/std/inputs'
import { breadcrumbs } from 'imp/std/shell'
import {
  luArrowLeft,
  luArrowRightLeft,
  luArrowUp,
  luClipboardPaste,
  luCopy,
  luDownload,
  luFilePlus,
  luFiles,
  luFolder,
  luFolderPlus,
  luFolderUp,
  luHouse,
  luLayoutGrid,
  luList,
  luRefreshCw,
  luTrash2,
  luUpload,
  luX,
} from 'imp/icons'
import { fileTable } from './file-table.js'
import { fileGrid } from './file-grid.js'
import { uploadDialog } from './upload-dialog.js'
import { entryActions } from '../lib/entry-actions.js'
import { formatFileSize, pluralize } from '../lib/format.js'
import { ROOT_PATH, segmentsOf } from '../lib/paths.js'
import { downloadArchive, downloadUrl, startDownload } from '../lib/server.js'

const VIEW_MODES = [
  { value: 'list', label: 'List view', icon: luList },
  { value: 'grid', label: 'Grid view', icon: luLayoutGrid },
]

const iconButton = (label, glyph, onClick) =>
  button(
    { variant: 'ghost', size: 'sm', square: true, label, events: { click: onClick } },
    icon(glyph),
  )

const trailOf = (path) => {
  const segments = segmentsOf(path ?? ROOT_PATH)
  return [
    { id: ROOT_PATH, label: 'root', icon: luHouse, href: '#' },
    ...segments.map((segment, index) => ({
      id: segments.slice(0, index + 1).join('/'),
      label: segment,
      href: '#',
    })),
  ]
}

const summaryOf = (listing, selectedCount) => {
  if (!listing) return ''
  const live = listing.entries.filter((entry) => !entry.isDeleted)
  const folders = live.filter((entry) => entry.isDirectory).length
  const files = live.length - folders
  const parts = [
    pluralize(folders, 'folder'),
    pluralize(files, 'file'),
    formatFileSize(listing.totalSize),
  ]
  if (selectedCount > 0) parts.push(`${selectedCount} selected`)
  return parts.join(' · ')
}

const downloadEntries = (entries) => {
  if (entries.length === 1) startDownload(downloadUrl(entries[0]))
  else if (entries.length > 1) downloadArchive(entries.map((entry) => entry.path))
}

export const filePane = component('rfm-file-pane', {
  styles: `
    :host { display: block; min-inline-size: 0; min-block-size: 0 }
    .pane {
      display: flex;
      flex-direction: column;
      block-size: 100%;
      min-block-size: 18rem;
      box-sizing: border-box;
      background: var(--imp-color-surface, #ffffff);
      border: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
      border-radius: var(--imp-radius-container, 10px);
      overflow: hidden;
    }
    .pane.active {
      border-color: var(--imp-color-primary, #2563eb);
      box-shadow: 0 0 0 1px var(--imp-color-primary, #2563eb);
    }
    .bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--imp-space-2, 8px);
      padding: var(--imp-space-2, 8px) var(--imp-space-3, 12px);
      border-block-end: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    .trail { flex: 1 1 12rem; min-inline-size: 0 }
    .filter { flex: 0 1 14rem; min-inline-size: 8rem }
    .spacer { flex: 1 }
    .bar[hidden] { display: none }
    .selection {
      background: color-mix(in srgb, var(--imp-color-primary, #2563eb) 8%, var(--imp-color-surface, #ffffff));
    }
    .body { flex: 1; min-block-size: 0; overflow: auto }
    .state { padding: var(--imp-space-6, 32px) var(--imp-space-3, 12px) }
    .status {
      padding: var(--imp-space-1, 4px) var(--imp-space-3, 12px);
      border-block-start: var(--imp-border-width, 1px) solid var(--imp-color-border, #cbd5e1);
    }
    @media (forced-colors: active) {
      .pane.active { border-color: Highlight }
    }
  `,
  setup: (self, { model, isSplit, isActive, viewMode, operations, otherPath, onActivate }) => {
    const uploadOpen = initState(self, 'rfm.upload-open', false)
    const directory = computed([model.path], (path) => path ?? ROOT_PATH)
    const currentDirectory = () => directory.get()

    const transfer = (entries, isMove) => operations.transfer(entries, otherPath(), isMove)
    const actionsFor = (entry) =>
      entryActions(entry, {
        operations,
        isSplit: isSplit.get(),
        onTransfer: (target, isMove) => transfer([target], isMove),
      })

    const folderInput = input({
      type: 'file',
      multiple: true,
      webkitdirectory: true,
      hidden: true,
      events: {
        change: () => {
          operations.upload(currentDirectory(), [...folderInput.files])
          folderInput.value = ''
        },
      },
    })

    const filterField = textField({
      value: model.filter,
      type: 'search',
      ariaLabel: 'Filter the entries of this folder',
      placeholder: 'Filter this folder',
    })
    filterField.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return
      model.filter.set('')
      event.target.blur?.()
    })

    const toolbar = div(
      { class: 'bar' },
      flex(
        { gap: 1 },
        iconButton('Back', luArrowLeft, model.back),
        iconButton('Parent directory', luArrowUp, model.up),
        iconButton('Refresh', luRefreshCw, model.load),
      ),
      div(
        { class: 'trail' },
        breadcrumbs({
          label: 'Folder path',
          items: computed([model.path], trailOf),
          events: {
            select: (event) => {
              event.preventDefault()
              model.navigateTo(event.detail.id)
            },
          },
        }),
      ),
      div({ class: 'filter' }, filterField),
    )

    const hasSelection = computed([model.selected], (paths) => paths.length > 0)

    const actions = div(
      { class: 'bar', hidden: hasSelection },
      button(
        {
          variant: 'primary',
          size: 'sm',
          events: { click: () => operations.createItem(currentDirectory(), true) },
        },
        icon(luFolderPlus, { size: 'sm' }),
        'New folder',
      ),
      button(
        { size: 'sm', events: { click: () => operations.createItem(currentDirectory(), false) } },
        icon(luFilePlus, { size: 'sm' }),
        'New file',
      ),
      menuButton(
        {
          trigger: 'arrow',
          size: 'sm',
          label: 'Upload',
          items: [
            {
              id: 'files',
              label: 'Upload files',
              icon: luFiles,
              onClick: () => uploadOpen.set(true),
            },
            {
              id: 'folder',
              label: 'Upload folder',
              icon: luFolder,
              onClick: () => folderInput.click(),
            },
          ],
        },
        flex({ gap: 2, verticalAlign: 'center' }, icon(luUpload, { size: 'sm' }), 'Upload'),
      ),
      button(
        { size: 'sm', events: { click: () => operations.pasteFromClipboard(currentDirectory()) } },
        icon(luClipboardPaste, { size: 'sm' }),
        'Paste',
      ),
      span({ class: 'spacer' }),
      segmented({ value: viewMode, ariaLabel: 'View mode', size: 'sm', options: VIEW_MODES }),
    )

    const selectionBar = div(
      {
        class: 'bar selection',
        hidden: computed([hasSelection], (isSelecting) => !isSelecting),
      },
      text(
        { inline: true, size: 'sm', weight: 'bold' },
        model.selected.text((paths) => `${paths.length} selected`),
      ),
      span({ class: 'spacer' }),
      isSplit.view((split) =>
        split
          ? [
            button(
              { size: 'sm', events: { click: () => transfer(model.selectedEntries(), false) } },
              icon(luCopy, { size: 'sm' }),
              'Copy to other pane',
            ),
            button(
              { size: 'sm', events: { click: () => transfer(model.selectedEntries(), true) } },
              icon(luArrowRightLeft, { size: 'sm' }),
              'Move to other pane',
            ),
          ]
          : null
      ),
      button(
        { size: 'sm', events: { click: () => downloadEntries(model.selectedEntries()) } },
        icon(luDownload, { size: 'sm' }),
        'Download',
      ),
      button(
        {
          size: 'sm',
          variant: 'danger',
          events: { click: () => operations.remove(model.selectedEntries()) },
        },
        icon(luTrash2, { size: 'sm' }),
        'Delete',
      ),
      button(
        { size: 'sm', variant: 'ghost', events: { click: model.clearSelection } },
        icon(luX, { size: 'sm' }),
        'Clear',
      ),
    )

    const contentState = computed(
      [model.listing, model.visible, viewMode],
      (listing, visible, mode) => {
        if (listing === undefined) return 'loading'
        if (listing.error) return 'error'
        if (listing.entries.length === 0) return 'empty'
        if (visible.length === 0) return 'no-matches'
        return mode
      },
    )

    const content = contentState.view((state) => {
      if (state === 'loading') {
        return div({ class: 'state' }, loader({ label: 'Loading the folder' }))
      }
      if (state === 'error') {
        return div(
          { class: 'state' },
          emptyState(
            {
              icon: luFolderUp,
              kind: 'error',
              title: 'Could not open this folder',
              description: model.listing.get().error,
            },
            button(
              { events: { click: () => model.navigateTo(ROOT_PATH) } },
              'Go to the root folder',
            ),
          ),
        )
      }
      if (state === 'empty') {
        return div(
          { class: 'state' },
          emptyState({ icon: luFolder, title: 'This folder is empty' }),
        )
      }
      if (state === 'no-matches') {
        return div(
          { class: 'state' },
          emptyState({ variant: 'noResults', description: 'No entries match the filter' }),
        )
      }
      return state === 'grid'
        ? fileGrid({ model, isSplit, actionsFor })
        : fileTable({ model, isSplit, actionsFor })
    })

    return div(
      {
        class: computed([isActive], (active) => ({ pane: true, active })),
        events: { pointerdown: onActivate, focusin: onActivate },
      },
      toolbar,
      actions,
      selectionBar,
      div({ class: 'body' }, content),
      div(
        { class: 'status' },
        text(
          { size: 'sm', tone: 'secondary' },
          computed(
            [model.listing, model.selected],
            (listing, paths) => summaryOf(listing, paths.length),
          ).text(),
        ),
      ),
      folderInput,
      uploadDialog({
        open: uploadOpen,
        directory,
        onUpload: (files) => operations.upload(currentDirectory(), files),
      }),
    )
  },
})
