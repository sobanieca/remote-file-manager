# mediaPreview - an image, video, audio, PDF or HTML file shown inline from its raw URL

```js
mediaPreview({ kind: 'image', source: rawFileUrl(path), name })
```

| Prop     | Values                                             |
| -------- | -------------------------------------------------- |
| `kind`   | `'image'`, `'video'`, `'audio'`, `'pdf'`, `'html'` |
| `source` | an absolute URL of the raw file                    |
| `name`   | the file name, the `alt` or the frame title        |
