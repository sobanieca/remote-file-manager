# searchResults - the scrolling list of search rows and the keyboard hints

```js
searchResults({ rows, onOpen, onHover })
```

`rows` is a state of `{ result, position, isActive }`. `onHover(position)` reports the row under the
pointer.
