const FENCE_PATTERN = /^\s*(```|~~~)/
const DELIMITER_PATTERN = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/

const splitCells = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/(?<!\\)\|$/, '')
    .split(/(?<!\\)\|/)
    .map((cell) => cell.trim().replaceAll('\\|', '|'))

const alignmentOf = (delimiter) => {
  const isLeft = delimiter.startsWith(':')
  const isRight = delimiter.endsWith(':')
  if (isLeft && isRight) return 'center'
  return isRight ? 'end' : 'start'
}

const isTableStart = (line, nextLine) =>
  line.includes('|') && nextLine !== undefined && nextLine.includes('|') &&
  DELIMITER_PATTERN.test(nextLine)

export const splitMarkdownBlocks = (markdown) => {
  const lines = markdown.split('\n')
  const blocks = []
  let prose = []
  let isInFence = false

  const flushProse = () => {
    if (prose.some((line) => line.trim())) blocks.push({ type: 'prose', text: prose.join('\n') })
    prose = []
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (FENCE_PATTERN.test(line)) isInFence = !isInFence
    if (isInFence || !isTableStart(line, lines[index + 1])) {
      prose.push(line)
      continue
    }
    flushProse()
    const header = splitCells(line)
    const alignments = splitCells(lines[index + 1]).map(alignmentOf)
    const rows = []
    index += 2
    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      rows.push(splitCells(lines[index]))
      index++
    }
    index--
    blocks.push({ type: 'table', header, alignments, rows })
  }
  flushProse()
  return blocks
}
