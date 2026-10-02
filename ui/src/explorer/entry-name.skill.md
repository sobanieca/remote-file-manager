# entryName - the name cell of a directory entry: icon or thumbnail, link, git and flag badges, cursor ring

```js
entryName({ entry, isCursor, onOpen })
```

| Prop       | Values                       | Notes                                        |
| ---------- | ---------------------------- | -------------------------------------------- |
| `entry`    | an entry from `/api/entries` |                                              |
| `isCursor` | boolean                      | draws the keyboard cursor and scrolls to it  |
| `onOpen`   | `(entry) => void`            | a plain click; a modified click follows href |

The host carries `data-path`, which the table uses to resolve a double click (a second click, because the first one redraws the row).
