import { expect, test } from 'imp/test'
import { describePath, nameOf, parentOf, segmentsOf, toUrlPath } from '../src/lib/paths.js'
import { languageOf, previewKindOf, rendersInBrowser } from '../src/lib/files.js'
import { pairHunkLines } from '../src/lib/diff.js'

test('walks served paths', () => {
  expect(parentOf('src/lib/paths.js')).toEqual('src/lib')
  expect(parentOf('README.md')).toEqual('.')
  expect(nameOf('src/lib/paths.js')).toEqual('paths.js')
  expect(segmentsOf('.')).toEqual([])
  expect(segmentsOf('a/b')).toEqual(['a', 'b'])
  expect(describePath('.')).toEqual('root')
  expect(toUrlPath('my docs/a#b.md')).toEqual('my%20docs/a%23b.md')
})

test('picks a highlighting language by name and extension', () => {
  expect(languageOf('src/main.js')).toEqual('javascript')
  expect(languageOf('Dockerfile')).toEqual('dockerfile')
  expect(languageOf('notes.unknown')).toEqual('text')
})

test('picks a preview by file type', () => {
  expect(previewKindOf({ name: 'a.png', isImage: true })).toEqual('image')
  expect(previewKindOf({ name: 'a.mp4', isImage: false })).toEqual('video')
  expect(previewKindOf({ name: 'a.md', isImage: false, isMarkdown: true })).toEqual('markdown')
  expect(previewKindOf({ name: 'a.txt', isImage: false, isMarkdown: false })).toEqual(null)
})

test('offers the raw file only when the browser renders it', () => {
  expect(rendersInBrowser({ name: 'index.HTML' })).toEqual(true)
  expect(rendersInBrowser({ name: 'report.pdf' })).toEqual(true)
  expect(rendersInBrowser({ name: 'logo.svg' })).toEqual(true)
  expect(rendersInBrowser({ name: 'README.md' })).toEqual(false)
  expect(rendersInBrowser({ name: 'notes.txt' })).toEqual(false)
  expect(rendersInBrowser({ name: 'clip.mkv' })).toEqual(false)
})

test('pairs removed and added lines for the side by side diff', () => {
  const lines = [
    { type: 'context', content: 'a' },
    { type: 'removed', content: 'b' },
    { type: 'removed', content: 'c' },
    { type: 'added', content: 'd' },
  ]
  expect(
    pairHunkLines(lines).map(({ left, right }) => [left?.content ?? null, right?.content ?? null]),
  )
    .toEqual([['a', 'a'], ['b', 'd'], ['c', null]])
})
