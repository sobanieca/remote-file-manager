# fileGrid - the icon grid view of a pane

```js
fileGrid({ model, isSplit, actionsFor })
```

`model` is a pane model from `createPane`. `isSplit` is a state. `actionsFor(entry)` returns the menu
items of a tile. A click moves the cursor, `Ctrl`/`Cmd`-click toggles, `Shift`-click extends, the
checkbox toggles, a double click opens.
