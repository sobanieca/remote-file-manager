const MODIFIED_AT = '2026-09-01T10:00:00.000Z'

const README = [
  '# Sample project',
  '',
  'Read the [guide](docs/guide.md).',
  '',
  '| Command | Does |',
  '| --- | --- |',
  '| `rfm` | Starts the server |',
].join('\n')

const fileEntry = (path, size, extra = {}) => ({
  name: path.slice(path.lastIndexOf('/') + 1),
  path,
  isDirectory: false,
  isSymlink: false,
  isDeleted: false,
  size,
  mode: 0o100644,
  modifiedAt: MODIFIED_AT,
  isExecutable: false,
  kind: 'text',
  isImage: false,
  isMarkdown: path.endsWith('.md'),
  isText: true,
  isBroken: false,
  gitStatus: null,
  hasGitDiff: false,
  ...extra,
})

const folderEntry = (path) => ({
  ...fileEntry(path, null),
  isDirectory: true,
  mode: 0o40755,
  kind: 'folder',
  isMarkdown: false,
  isText: false,
})

const folders = new Map([
  ['.', [folderEntry('docs'), fileEntry('README.md', README.length)]],
  ['docs', [fileEntry('docs/guide.md', 12)]],
])

const contents = new Map([['README.md', README], ['docs/guide.md', '# The guide']])

const json = (body, status = 200) => ({ status, body })

const allEntries = () => [...folders.values()].flat()

export const mocks = [
  {
    match: (request) => request.path === '/api/git/summary',
    handler: () => json({ ok: true, repository: null }),
  },
  {
    match: (request) => request.method === 'GET' && request.path === '/api/entries',
    handler: (request) => {
      const path = request.query.path || '.'
      const entries = folders.get(path)
      if (!entries) return json({ ok: false, message: 'Directory not found' }, 404)
      const totalSize = entries.reduce((sum, entry) => sum + (entry.size ?? 0), 0)
      return json({ ok: true, path, entries, totalSize })
    },
  },
  {
    match: (request) => request.method === 'GET' && request.path === '/api/file',
    handler: (request) => {
      const entry = allEntries().find((candidate) => candidate.path === request.query.path)
      if (!entry) return json({ ok: false, message: 'File not found' }, 404)
      return json({ ok: true, entry, content: contents.get(entry.path) ?? '', isTooLarge: false })
    },
  },
  {
    match: (request) => request.method === 'POST' && request.path === '/api/create-item',
    handler: (request) => {
      const { path, name, type } = request.body
      const target = path === '.' ? name : `${path}/${name}`
      const entry = type === 'directory' ? folderEntry(target) : fileEntry(target, 0)
      folders.set(path, [...(folders.get(path) ?? []), entry])
      if (type === 'directory') folders.set(target, [])
      return json({ ok: true, path: target, message: `Folder "${name}" created` })
    },
  },
  {
    match: (request) => request.method === 'GET' && request.path === '/api/search',
    handler: (request) => {
      const term = (request.query.q ?? '').toLowerCase()
      const entries = allEntries()
      const results = term
        ? entries
          .filter((entry) => entry.path.toLowerCase().includes(term))
          .map((entry) => ({
            path: entry.path,
            name: entry.name,
            isDirectory: entry.isDirectory,
            isMarkdown: entry.isMarkdown,
            kind: entry.kind,
            positions: [],
          }))
        : []
      return json({
        ok: true,
        indexedCount: entries.length,
        truncated: false,
        total: results.length,
        results,
      })
    },
  },
  {
    match: (request) => request.method === 'GET' && request.path === '/api/thumbnail',
    handler: () => ({ status: 404, body: 'Not found' }),
  },
  {
    match: (request) => request.path.startsWith('/api/'),
    handler: (request) => json({ ok: false, message: `No mock for ${request.path}` }, 501),
  },
]
