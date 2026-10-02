import { expect, test } from 'imp/test'
import { splitMarkdownBlocks } from '../src/lib/markdown-blocks.js'
import { resolveMarkdownLinks } from '../src/lib/markdown-links.js'
import { stripFrontmatter } from '../src/lib/files.js'
import { filesHref, viewHref } from '../src/lib/routes.js'

test('splits pipe tables out of the prose', () => {
  const blocks = splitMarkdownBlocks(
    [
      '# Title',
      '',
      '| Name | Size |',
      '| :--- | ---: |',
      '| a | 1 |',
      '| b \\| c | 2 |',
      '',
      'After',
    ].join('\n'),
  )
  expect(blocks.map((block) => block.type)).toEqual(['prose', 'table', 'prose'])
  expect(blocks[1].header).toEqual(['Name', 'Size'])
  expect(blocks[1].alignments).toEqual(['start', 'end'])
  expect(blocks[1].rows).toEqual([['a', '1'], ['b | c', '2']])
})

test('leaves tables inside a fenced code block alone', () => {
  const blocks = splitMarkdownBlocks(['```', '| a | b |', '| - | - |', '```'].join('\n'))
  expect(blocks.map((block) => block.type)).toEqual(['prose'])
})

test('points relative links at the app and images at the served files', () => {
  const resolved = resolveMarkdownLinks(
    '[Guide](guide.md) [Up](../README.md) [Folder](assets/) ![Logo](img/logo.png "Logo") [Site](https://example.com)',
    'docs',
  )
  expect(resolved).toContain(`[Guide](${viewHref('docs/guide.md')})`)
  expect(resolved).toContain(`[Up](${viewHref('README.md')})`)
  expect(resolved).toContain(`[Folder](${filesHref({ path: 'docs/assets' })})`)
  expect(resolved).toContain('/docs/img/logo.png "Logo")')
  expect(resolved).toContain('[Site](https://example.com)')
})

test('keeps links that escape the served directory untouched', () => {
  expect(resolveMarkdownLinks('[Out](../../secret.md)', 'docs')).toEqual('[Out](../../secret.md)')
})

test('drops a leading frontmatter block', () => {
  expect(stripFrontmatter('---\ntitle: x\n---\n# Body')).toEqual('# Body')
})
