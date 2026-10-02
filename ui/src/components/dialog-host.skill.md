# dialogHost - the one modal that asks for a name or a confirmation, driven by askName and askConfirmation

```js
import { askConfirmation, askName, dialogHost } from './dialog-host.js'

dialogHost() // once, inside the root
const name = await askName(dialogRequest, {
  title: 'New folder',
  label: 'Name',
  confirmLabel: 'Create',
})
const isConfirmed = await askConfirmation(dialogRequest, {
  title: 'Delete',
  message: 'Delete "a.txt"?',
  items: [],
  confirmLabel: 'Delete',
  isDanger: true,
})
```

`dialogRequest` is the `rfm.dialog` state. `askName` resolves to the trimmed text, or `null` when the
person cancels. `askConfirmation` resolves to a boolean. Escape, the backdrop and Cancel all answer
`null`/`false`. The text field, or the confirm button, takes the focus when the dialog opens.
