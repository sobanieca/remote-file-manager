import { navigate } from 'imp/router'
import { notify } from 'imp/std/feedback'
import {
  luArrowRightLeft,
  luClipboardCopy,
  luCopy,
  luDownload,
  luExternalLink,
  luEye,
  luFileDiff,
  luFolderOpen,
  luPencil,
  luRotateCcwClock,
  luTextCursorInput,
  luTrash2,
} from 'imp/icons'
import { copyText } from './clipboard.js'
import { diffHref, editHref, entryHref, historyHref } from './routes.js'
import { downloadUrl, openInNewTab, rawFileUrl, startDownload } from './server.js'

const historyAction = (entry) => ({
  id: 'history',
  label: entry.isDirectory ? 'Folder history' : 'File history',
  icon: luRotateCcwClock,
  onClick: () => navigate(historyHref(entry.path)),
})

const diffAction = (entry) => ({
  id: 'diff',
  label: 'View git diff',
  icon: luFileDiff,
  onClick: () => navigate(diffHref({ path: entry.path })),
})

const copyPath = async (path) => {
  const isCopied = await copyText(path)
  notify({
    kind: isCopied ? 'success' : 'error',
    title: isCopied ? 'Path copied' : 'Could not copy the path',
  })
}

const openActions = (entry, inViewer) => {
  const open = inViewer ? null : {
    id: 'open',
    label: entry.isMarkdown ? 'Open rendered' : 'Open',
    icon: entry.isDirectory ? luFolderOpen : luEye,
    onClick: () => navigate(entryHref(entry)),
  }
  if (entry.isDirectory) return [open]
  return [
    open,
    entry.isText
      ? { id: 'edit', label: 'Edit', icon: luPencil, onClick: () => navigate(editHref(entry.path)) }
      : null,
    {
      id: 'raw',
      label: 'Open raw',
      icon: luExternalLink,
      onClick: () => openInNewTab(rawFileUrl(entry.path)),
    },
  ]
}

export const entryActions = (
  entry,
  { operations, isSplit = false, onTransfer, inViewer = false },
) => {
  if (entry.isDeleted) return [diffAction(entry), historyAction(entry)]

  const actions = [
    ...openActions(entry, inViewer),
    {
      id: 'download',
      label: entry.isDirectory ? 'Download as ZIP' : 'Download',
      icon: luDownload,
      onClick: () => startDownload(downloadUrl(entry)),
    },
    entry.hasGitDiff && (entry.isDirectory || entry.isText) ? diffAction(entry) : null,
    historyAction(entry),
    {
      id: 'rename',
      label: 'Rename',
      icon: luTextCursorInput,
      onClick: () => operations.rename(entry),
    },
    {
      id: 'copy-path',
      label: 'Copy path',
      icon: luClipboardCopy,
      onClick: () => copyPath(entry.path),
    },
    isSplit
      ? {
        id: 'copy',
        label: 'Copy to other pane',
        icon: luCopy,
        onClick: () => onTransfer(entry, false),
      }
      : null,
    isSplit
      ? {
        id: 'move',
        label: 'Move to other pane',
        icon: luArrowRightLeft,
        onClick: () => onTransfer(entry, true),
      }
      : null,
    { id: 'delete', label: 'Delete', icon: luTrash2, onClick: () => operations.remove([entry]) },
  ]
  return actions.filter(Boolean)
}
