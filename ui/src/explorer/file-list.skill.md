# fileList - the compact list view of a narrow pane: one row per entry with checkbox, name, size and menu

```js
fileList({ model, actionsFor })
```

`model` is a pane model from `createPane`. `actionsFor(entry)` returns the menu items of a row.

The pane shows it in place of the std `table` when the list view is on and the pane is at most 30rem wide,
because the table turns every row into a tall card there. The header has the select-all checkbox and
the Name and Size sort buttons, which cycle ascending, descending and off like the table headers. A tap on a
row or its checkbox toggles the selection, `Shift` extends it, the name link and a double click open the
entry.
