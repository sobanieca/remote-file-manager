import { component } from 'imp'
import { useHttpClient } from 'imp/http'
import { beforeLeave, navigate } from 'imp/router'
import { computed, initState, useState } from 'imp/state'
import { button, icon, text } from 'imp/std'
import { emptyState } from 'imp/std/display'
import { loader, notify } from 'imp/std/feedback'
import { flex, stack } from 'imp/std/layout'
import { codeEditor } from 'imp/std/inputs'
import { luDownload, luEye, luFileX, luSave } from 'imp/icons'
import { askConfirmation } from '../components/dialog-host.js'
import { loadFailure } from '../components/load-failure.js'
import { pageHeader } from '../components/page-header.js'
import { iconOfEntry, languageOf } from '../lib/files.js'
import { formatFileSize } from '../lib/format.js'
import { describePath, parentOf } from '../lib/paths.js'
import { loadRepository } from '../lib/repository.js'
import { filesHref, viewHref } from '../lib/routes.js'
import { downloadUrl, errorMessage, startDownload } from '../lib/server.js'

const LINE_HEIGHT = 24
const RESERVED_HEIGHT = 320

const rowsForWindow = () =>
  Math.max(10, Math.floor((globalThis.innerHeight - RESERVED_HEIGHT) / LINE_HEIGHT))

const isSaveShortcut = (event) =>
  (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's'

const headerOf = (entry, actions = []) =>
  pageHeader({
    glyph: iconOfEntry(entry),
    title: entry.name,
    subtitle: {
      href: filesHref({ path: parentOf(entry.path) }),
      label: describePath(parentOf(entry.path)),
    },
    actions,
  })

const notEditable = (entry, isTooLarge) =>
  stack(
    { gap: 4 },
    headerOf(entry),
    emptyState(
      {
        icon: luFileX,
        title: 'This file cannot be edited',
        description: isTooLarge
          ? `The file is ${formatFileSize(entry.size)}, too large to edit in the browser.`
          : 'It looks like a binary file, so it cannot be edited as text.',
      },
      button(
        { events: { click: () => navigate(viewHref(entry.path)) } },
        icon(luEye, { size: 'sm' }),
        'View details',
      ),
      button(
        { events: { click: () => startDownload(downloadUrl(entry)) } },
        icon(luDownload, { size: 'sm' }),
        'Download',
      ),
    ),
  )

export const fileEditorPanel = component('rfm-file-editor-panel', {
  loading: () => loader({ label: 'Loading the file' }),
  error: (_self, error) => loadFailure('Could not open the file', error),
  setup: async (self, { path }) => {
    const api = useHttpClient(self, 'rfm.api')
    const dialogRequest = useState(self, 'rfm.dialog')
    const repository = useState(self, 'rfm.git')

    let response
    try {
      response = await api.get('/api/file', { query: { path } })
    } catch (error) {
      if (!error.body?.isDirectory) throw error
      navigate(filesHref({ path: error.body.path }), { replace: true })
      return null
    }
    if (self.abortSignal.aborted) return null

    const { entry, content, isTooLarge } = response
    if (!entry.isText || content === null) return notEditable(entry, isTooLarge)

    const draft = initState(self, 'rfm.editor-draft', content)
    const saved = initState(self, 'rfm.editor-saved', content)
    const isSaving = initState(self, 'rfm.editor-saving', false)
    const rows = initState(self, 'rfm.editor-rows', rowsForWindow())
    const isDirty = computed([draft, saved], (current, stored) => current !== stored)

    const save = async () => {
      if (isSaving.get()) return
      const contentToSave = draft.get()
      isSaving.set(true)
      try {
        const result = await api.post('/api/save-file', {
          body: { path: entry.path, content: contentToSave },
        })
        saved.set(contentToSave)
        notify({ kind: 'success', title: result.message })
        loadRepository(api, repository)
      } catch (error) {
        notify({
          kind: 'error',
          title: 'Could not save the file',
          description: errorMessage(error),
        })
      } finally {
        isSaving.set(false)
      }
    }

    beforeLeave(self, () =>
      !isDirty.get() ||
      askConfirmation(dialogRequest, {
        title: 'Unsaved changes',
        message: `Discard the unsaved changes to ${entry.name}?`,
        confirmLabel: 'Discard',
        isDanger: true,
      }))

    const options = { signal: self.abortSignal }
    globalThis.addEventListener('beforeunload', (event) => {
      if (isDirty.get()) event.preventDefault()
    }, options)
    globalThis.addEventListener('resize', () => rows.set(rowsForWindow()), options)
    document.addEventListener('keydown', (event) => {
      if (!isSaveShortcut(event)) return
      event.preventDefault()
      save()
    }, options)

    return stack(
      { gap: 3 },
      headerOf(entry, [
        button(
          { size: 'sm', events: { click: () => navigate(viewHref(entry.path)) } },
          icon(luEye, { size: 'sm' }),
          'View',
        ),
        button(
          {
            size: 'sm',
            variant: 'primary',
            loading: isSaving,
            disabled: computed([isDirty], (dirty) => !dirty),
            events: { click: save },
          },
          icon(luSave, { size: 'sm' }),
          'Save',
        ),
      ]),
      flex(
        { gap: 2, verticalAlign: 'center' },
        text({ inline: true, size: 'sm', tone: 'secondary' }, languageOf(entry.path)),
        text(
          { inline: true, size: 'sm', tone: 'secondary' },
          isDirty.text((dirty) => (dirty ? '· Unsaved changes' : '· Saved')),
        ),
      ),
      codeEditor({
        value: draft,
        language: languageOf(entry.path),
        lineNumbers: true,
        rows,
        ariaLabel: `Contents of ${entry.name}`,
      }),
    )
  },
})
