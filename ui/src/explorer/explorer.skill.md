# explorer - the files screen: one or two panes, the layout switch, the command bar and the keyboard

```js
explorer()
```

No props. The URL is the state: `?path=` is the left pane, `?right=` the right pane (split view),
`?reveal=` selects an entry once. Keys: arrows, `Shift`+arrows, `Enter`, `Space`, `Tab`,
`Backspace`, `Delete`, `Ctrl`/`Cmd`+`A`. Pasting a file or text saves it into the active pane.
