# searchResult - one row of the search palette: the highlighted path and a reveal button

```js
searchResult({ result, isActive, onOpen, onHover })
```

`result` is a search hit with `positions` of the matched characters. `onOpen(result, reveal)` runs
on a click, with `reveal` true for the reveal button or a Shift-click. `onHover` runs on pointer move.
