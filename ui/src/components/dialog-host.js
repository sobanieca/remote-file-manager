import { component } from 'imp'
import { li, ul } from 'imp/html'
import { computed, useState } from 'imp/state'
import { button, text } from 'imp/std'
import { dialog, flex, stack } from 'imp/std/layout'
import { form, submitForm, textField } from 'imp/std/inputs'

const pendingAnswers = new Map()
let lastRequestId = 0

const ask = (dialogRequest, request) =>
  new Promise((resolve) => {
    lastRequestId += 1
    pendingAnswers.set(lastRequestId, resolve)
    dialogRequest.set({ ...request, id: lastRequestId })
  })

export const askName = async (dialogRequest, { title, label, value = '', confirmLabel }) => {
  const answer = await ask(dialogRequest, { kind: 'name', title, label, value, confirmLabel })
  return typeof answer === 'string' && answer.trim() ? answer.trim() : null
}

export const askConfirmation = async (
  dialogRequest,
  { title, message, items = [], confirmLabel, isDanger = false },
) =>
  Boolean(
    await ask(dialogRequest, { kind: 'confirm', title, message, items, confirmLabel, isDanger }),
  )

const actionRow = (request, answer, confirmButton) =>
  flex(
    { horizontalAlign: 'end', gap: 2 },
    button({ events: { click: () => answer(null) } }, 'Cancel'),
    confirmButton,
  )

const confirmButtonOf = (request, onClick) =>
  button(
    { variant: request.isDanger ? 'danger' : 'primary', events: { click: onClick } },
    request.confirmLabel,
  )

const nameForm = (self, request, answer) => {
  self.focusTarget = textField({ field: 'name', label: request.label, required: true })
  return form(
    {
      initialValues: { name: request.value },
      onSubmit: (values) => answer(values.name),
    },
    self.focusTarget,
    actionRow(request, answer, confirmButtonOf(request, submitForm)),
  )
}

const confirmation = (self, request, answer) => {
  self.focusTarget = confirmButtonOf(request, () => answer(true))
  return stack(
    { gap: 4 },
    text(request.message),
    request.items.length > 0 ? ul(request.items.map((item) => li(item))) : null,
    actionRow(request, answer, self.focusTarget),
  )
}

export const dialogHost = component('rfm-dialog-host', {
  setup: (self) => {
    const request = useState(self, 'rfm.dialog')
    const open = useState(self, 'rfm.dialog-open')
    const title = computed([request], (current) => current?.title ?? '')

    const answer = (value) => {
      const current = request.get()
      const resolve = current ? pendingAnswers.get(current.id) : undefined
      if (!resolve) return
      pendingAnswers.delete(current.id)
      open.set(false)
      resolve(value)
    }

    request.watch(self, (current) => {
      if (!current) return
      open.set(true)
      requestAnimationFrame(() => self.focusTarget?.focus())
    })
    open.watch(self, (isOpen) => {
      if (!isOpen) answer(null)
    })

    return dialog(
      { title, open },
      request.view((current) => {
        if (!current) return null
        return current.kind === 'name'
          ? nameForm(self, current, answer)
          : confirmation(self, current, answer)
      }),
    )
  },
})
