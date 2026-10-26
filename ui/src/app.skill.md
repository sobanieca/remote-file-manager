# root - the app frame: shell, router, the API client and the app-wide states

```js
import { root } from './app.js'

mount('#app', root())
```

Takes no props. It owns everything app-wide:

| Name              | Kind        | Holds                                                           |
| ----------------- | ----------- | --------------------------------------------------------------- |
| `rfm.api`         | http client | the server API, same origin as the page                         |
| `rfm.git`         | state       | `undefined` while loading, `null` outside git, else the summary |
| `rfm.search-open` | state       | whether the search palette is open                              |
| `rfm.dialog`      | state       | the request of `askName` / `askConfirmation`                    |
| `rfm.dialog-open` | state       | whether that dialog is open                                     |
| `rfm.active-pane` | state       | `'left'` or `'right'`, the pane the keyboard acts on            |

`Ctrl`/`Cmd` + `P` opens the search palette from anywhere. The git nodes carry the
`gitRepository` guard in `router({ guards })`; it waits for `rfm.git` and sends a
non-repository to the files screen at `/`.
The files screen binds the root, so it is the first tab of the bar. `src/locales/en.js` names it
"Files" through the message `appMap.label`.
