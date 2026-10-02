# gitDiffPanel - loads one diff and shows it with its header and back link

```js
import { gitDiffPanel } from './git-diff-panel.js'

gitDiffPanel({ query })
```

The router renders it; a screen reads its query with `screenQuery`, so it ignores the route that replaces it.
