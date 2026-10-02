# searchPalette - the fuzzy file search dialog opened with Ctrl+P

```js
searchPalette() // once, inside the root
```

No props. Opens on the `rfm.search-open` state. Queries `/api/search` 70ms after the last keystroke,
aborting the previous request. Arrow keys move, `Enter` opens, `Shift` + `Enter` reveals the entry in
the active explorer pane.
