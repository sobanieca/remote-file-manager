# diffFile - one file of a diff, collapsible, in unified or side by side layout

```js
diffFile({ file, mode, focus })
```

| Prop    | Values                                   | Notes                                                                         |
| ------- | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `file`  | a parsed diff file from the server       | `{ path, originalPath, status, hunks, added, removed, isBinary, servedPath }` |
| `mode`  | a state holding `'unified'` or `'split'` | live                                                                          |
| `focus` | a state holding a path, optional         | the file of that path opens and scrolls in view                               |

The eye button opens the served file when `servedPath` is set.
