import { notify } from 'imp/std/feedback'
import { askConfirmation, askName } from '../components/dialog-host.js'
import { errorMessage } from './server.js'
import { nameOf } from './paths.js'

const describeTargets = (entries) =>
  entries.length === 1 ? `"${entries[0].name}"` : `${entries.length} items`

const report = (result) => notify({ kind: result.ok ? 'success' : 'error', title: result.message })

const reportFailure = (title, error) =>
  notify({ kind: 'error', title, description: errorMessage(error) })

const reportNothingSelected = () => notify({ kind: 'warning', title: 'Nothing selected' })

const pastedFileName = (extension) => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  return `pasted-${date}-${time}.${extension}`
}

const IMAGE_EXTENSIONS = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
}

export const extensionForType = (type) => {
  if (!type) return 'txt'
  if (IMAGE_EXTENSIONS[type]) return IMAGE_EXTENSIONS[type]
  if (type.startsWith('image/')) return type.split('/')[1] || 'img'
  if (type === 'text/html') return 'html'
  return 'txt'
}

export const createFileOperations = ({ api, dialogRequest, onChanged }) => {
  const run = async (failureTitle, call) => {
    try {
      const result = await call()
      report(result)
      await onChanged()
      return result
    } catch (error) {
      reportFailure(failureTitle, error)
      return null
    }
  }

  const createItem = async (directory, isDirectory) => {
    const name = await askName(dialogRequest, {
      title: isDirectory ? 'New folder' : 'New file',
      label: 'Name',
      confirmLabel: 'Create',
    })
    if (!name) return null
    return run(`Could not create "${name}"`, () =>
      api.post('/api/create-item', {
        body: { path: directory, name, type: isDirectory ? 'directory' : 'file' },
      }))
  }

  const rename = async (entry) => {
    const newName = await askName(dialogRequest, {
      title: 'Rename',
      label: 'New name',
      value: entry.name,
      confirmLabel: 'Rename',
    })
    if (!newName || newName === entry.name) return null
    return run(
      `Could not rename "${entry.name}"`,
      () => api.post('/api/rename-item', { body: { path: entry.path, newName } }),
    )
  }

  const deletePaths = async (paths, recursive) => {
    try {
      const result = await api.post('/api/delete-items', { body: { paths, recursive } })
      if (result.notEmpty?.length > 0) {
        const confirmed = await askConfirmation(dialogRequest, {
          title: 'Folder not empty',
          message: `${result.notEmpty.join(', ')} is not empty. Delete everything inside?`,
          confirmLabel: 'Delete recursively',
          isDanger: true,
        })
        if (confirmed) {
          return deletePaths(paths.filter((path) => result.notEmpty.includes(nameOf(path))), true)
        }
      }
      report(result)
      await onChanged()
      return result
    } catch (error) {
      reportFailure('Could not delete', error)
      return null
    }
  }

  const remove = async (entries) => {
    if (entries.length === 0) return reportNothingSelected()
    const confirmed = await askConfirmation(dialogRequest, {
      title: 'Delete',
      message: `Permanently delete ${describeTargets(entries)}? This cannot be undone.`,
      confirmLabel: 'Delete',
      isDanger: true,
    })
    if (!confirmed) return null
    return deletePaths(entries.map((entry) => entry.path), false)
  }

  const transfer = async (entries, targetPath, isMove, overwrite = false) => {
    if (entries.length === 0) return reportNothingSelected()
    if (targetPath === null) {
      return notify({ kind: 'warning', title: 'Enable split view to copy or move between panes' })
    }
    const verb = isMove ? 'move' : 'copy'
    try {
      const result = await api.post(isMove ? '/api/move-items' : '/api/copy-items', {
        body: { paths: entries.map((entry) => entry.path), targetPath, overwrite },
      })
      if (result.conflicts?.length > 0) {
        const confirmed = await askConfirmation(dialogRequest, {
          title: 'Already exists',
          message: 'These items already exist in the target folder. Overwrite them?',
          items: result.conflicts,
          confirmLabel: 'Overwrite',
          isDanger: true,
        })
        if (confirmed) {
          const conflicting = entries.filter((entry) => result.conflicts.includes(entry.name))
          return transfer(conflicting, targetPath, isMove, true)
        }
      }
      report(result)
      await onChanged()
      return result
    } catch (error) {
      reportFailure(`Could not ${verb} ${describeTargets(entries)}`, error)
      return null
    }
  }

  const upload = (directory, files) => {
    if (files.length === 0) return null
    const body = new FormData()
    body.append('path', directory)
    for (const file of files) body.append('files', file, file.webkitRelativePath || file.name)
    notify({ title: `Uploading ${files.length} file${files.length === 1 ? '' : 's'}` })
    return run('Upload failed', () => api.post('/api/upload-files', { body }))
  }

  const saveBlob = async (directory, blob, extension) => {
    const name = await askName(dialogRequest, {
      title: 'Save clipboard content',
      label: 'File name',
      value: pastedFileName(extension),
      confirmLabel: 'Save',
    })
    if (!name) return null
    const body = new FormData()
    body.append('path', directory)
    body.append('filename', name)
    body.append('file', blob, name)
    return run(`Could not save "${name}"`, () => api.post('/api/paste-content', { body }))
  }

  const pasteFromClipboard = async (directory) => {
    try {
      const items = await navigator.clipboard.read()
      for (const item of items) {
        const imageType = item.types.find((type) => type.startsWith('image/'))
        if (imageType) {
          return saveBlob(directory, await item.getType(imageType), extensionForType(imageType))
        }
      }
      const clipboardText = await navigator.clipboard.readText()
      if (clipboardText.trim()) {
        return saveBlob(directory, new Blob([clipboardText], { type: 'text/plain' }), 'txt')
      }
      return notify({ kind: 'warning', title: 'The clipboard is empty' })
    } catch {
      return notify({ kind: 'error', title: 'Clipboard access was denied. Use Ctrl+V instead.' })
    }
  }

  return { createItem, rename, remove, transfer, upload, saveBlob, pasteFromClipboard }
}
