import { table } from 'imp/std/data'
import { markdown } from 'imp/std/display'
import { stack } from 'imp/std/layout'
import { splitMarkdownBlocks } from '../lib/markdown-blocks.js'

const cellKey = (index) => `column${index}`

const tableBlock = ({ header, alignments, rows }, position) =>
  table({
    label: `Table ${position}: ${header.join(', ')}`,
    columns: header.map((label, index) => ({
      key: cellKey(index),
      label,
      align: alignments[index] ?? 'start',
      render: (row) => markdown({ text: row[cellKey(index)] }),
    })),
    rows: rows.map((cells, rowIndex) => ({
      id: rowIndex,
      ...Object.fromEntries(header.map((_label, index) => [cellKey(index), cells[index] ?? ''])),
    })),
  })

export const markdownDocument = (text) => {
  let tableCount = 0
  return stack(
    { gap: 4 },
    ...splitMarkdownBlocks(text).map((block) => {
      if (block.type === 'prose') return markdown({ text: block.text })
      tableCount += 1
      return tableBlock(block, tableCount)
    }),
  )
}
