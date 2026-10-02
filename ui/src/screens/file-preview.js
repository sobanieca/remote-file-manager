import { button, icon } from 'imp/std'
import { codeBlock, emptyState } from 'imp/std/display'
import { tabs } from 'imp/std/layout'
import { luDownload, luFileQuestionMark } from 'imp/icons'
import { markdownDocument } from '../components/markdown-document.js'
import { mediaPreview } from '../components/media-preview.js'
import { languageOf, previewKindOf, stripFrontmatter } from '../lib/files.js'
import { formatFileSize } from '../lib/format.js'
import { resolveMarkdownLinks } from '../lib/markdown-links.js'
import { parentOf } from '../lib/paths.js'
import { downloadUrl, rawFileUrl, startDownload } from '../lib/server.js'

const MAX_HIGHLIGHT_BYTES = 1_000_000
const MAX_HIGHLIGHT_LINES = 20_000

const sourceView = (entry, content) => {
  const isTooLarge = (entry.size ?? 0) > MAX_HIGHLIGHT_BYTES ||
    content.split('\n').length > MAX_HIGHLIGHT_LINES
  return codeBlock({
    code: content,
    language: isTooLarge ? 'text' : languageOf(entry.path),
    lineNumbers: true,
    id: 'source',
    label: entry.name,
  })
}

const unavailable = (entry, description) =>
  emptyState(
    { icon: luFileQuestionMark, title: 'No inline preview', description },
    button(
      { variant: 'primary', events: { click: () => startDownload(downloadUrl(entry)) } },
      icon(luDownload, { size: 'sm' }),
      'Download',
    ),
  )

export const filePreview = (entry, content, isTooLarge) => {
  const kind = previewKindOf(entry)
  if (['image', 'video', 'audio', 'pdf'].includes(kind)) {
    return mediaPreview({ kind, source: rawFileUrl(entry.path), name: entry.name })
  }
  if (content === null) {
    return unavailable(
      entry,
      isTooLarge
        ? `This file is ${formatFileSize(entry.size)}, too large to show in the browser.`
        : 'There is no inline preview for this type of file.',
    )
  }
  if (kind === 'markdown') {
    return tabs({
      label: 'Markdown views',
      items: [
        {
          id: 'rendered',
          label: 'Rendered',
          content: markdownDocument(
            resolveMarkdownLinks(stripFrontmatter(content), parentOf(entry.path)),
          ),
        },
        { id: 'source', label: 'Source', content: sourceView(entry, content) },
      ],
    })
  }
  if (kind === 'html') {
    return tabs({
      label: 'HTML views',
      items: [
        { id: 'source', label: 'Source', content: sourceView(entry, content) },
        {
          id: 'rendered',
          label: 'Rendered',
          content: mediaPreview({ kind: 'html', source: rawFileUrl(entry.path), name: entry.name }),
        },
      ],
    })
  }
  return sourceView(entry, content)
}
