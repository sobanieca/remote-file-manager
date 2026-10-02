# uploadDialog - a modal with the std file picker that uploads into a folder

```js
uploadDialog({ open, directory, onUpload })
```

`open` is a writable state, `directory` a state of the target folder, `onUpload(files)` receives the
`File` objects when the person presses Upload.
