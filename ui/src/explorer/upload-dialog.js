import { component } from 'imp'
import { computed } from 'imp/state'
import { button } from 'imp/std'
import { dialog, flex, stack } from 'imp/std/layout'
import { fileUpload, form, submitForm } from 'imp/std/inputs'
import { describePath } from '../lib/paths.js'

export const uploadDialog = component('rfm-upload-dialog', {
  setup: (self, { open, directory, onUpload }) => {
    self.chosenFiles = []
    const title = computed([directory], (path) => `Upload to ${describePath(path ?? '.')}`)
    return dialog(
      { title, open },
      open.view((isOpen) =>
        isOpen
          ? form(
            {
              initialValues: { files: [] },
              onSubmit: () => {
                open.set(false)
                return onUpload(self.chosenFiles)
              },
            },
            stack(
              { gap: 4 },
              fileUpload({
                field: 'files',
                label: 'Files',
                multiple: true,
                required: true,
                onFiles: (files) => {
                  self.chosenFiles = files
                },
              }),
              flex(
                { horizontalAlign: 'end', gap: 2 },
                button({ events: { click: () => open.set(false) } }, 'Cancel'),
                button({ variant: 'primary', events: { click: submitForm } }, 'Upload'),
              ),
            ),
          )
          : null
      ),
    )
  },
})
