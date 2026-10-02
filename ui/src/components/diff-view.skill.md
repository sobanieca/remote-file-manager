# diffView - the summary bar and every file of a diff, with the remembered layout switch

```js
diffView({ files, focus })
```

| Prop    | Values                           | Notes                      |
| ------- | -------------------------------- | -------------------------- |
| `files` | array of parsed diff files       | read once                  |
| `focus` | a state holding a path, optional | passed to every `diffFile` |

Shows an empty state with no files. The layout is stored in `localStorage` as `rfm-diff-mode`.
