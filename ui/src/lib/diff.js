export const pairHunkLines = (lines) => {
  const pairs = []
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    if (line.type === 'context' || line.type === 'note') {
      pairs.push({ left: line, right: line })
      index++
      continue
    }
    const removed = []
    const added = []
    while (index < lines.length && lines[index].type === 'removed') removed.push(lines[index++])
    while (index < lines.length && lines[index].type === 'added') added.push(lines[index++])
    for (let offset = 0; offset < Math.max(removed.length, added.length); offset++) {
      pairs.push({ left: removed[offset] ?? null, right: added[offset] ?? null })
    }
  }
  return pairs
}

export const diffTotals = (files) =>
  files.reduce(
    (sum, file) => ({ added: sum.added + file.added, removed: sum.removed + file.removed }),
    { added: 0, removed: 0 },
  )
