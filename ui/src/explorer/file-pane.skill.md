# filePane - one explorer pane: toolbar, path trail, filter, actions, list or grid, status bar

```js
filePane({ model, isSplit, isActive, viewMode, operations, otherPath, onActivate })
```

| Prop         | Values                                  |
| ------------ | --------------------------------------- |
| `model`      | a pane model from `createPane`          |
| `isSplit`    | a state, true in split view             |
| `isActive`   | a state, draws the active ring          |
| `viewMode`   | a writable state, `'list'` or `'grid'`  |
| `operations` | from `createFileOperations`             |
| `otherPath`  | `() => string \| null`, the copy target |
| `onActivate` | called on pointer down and focus        |
