import { component } from 'imp'
import { initState } from 'imp/state'
import { text } from 'imp/std'
import { emptyState, tag } from 'imp/std/display'
import { flex, stack } from 'imp/std/layout'
import { segmented } from 'imp/std/inputs'
import { luColumns2, luFileCheck, luList } from 'imp/icons'
import { diffFile } from './diff-file.js'
import { diffTotals } from '../lib/diff.js'
import { pluralize } from '../lib/format.js'
import { readSetting, writeSetting } from '../lib/settings.js'

const MODE_SETTING = 'rfm-diff-mode'

const MODES = [
  { value: 'unified', label: 'Unified view', icon: luList },
  { value: 'split', label: 'Side by side view', icon: luColumns2 },
]

export const diffView = component('rfm-diff-view', {
  setup: (self, { files, focus }) => {
    if (files.length === 0) return emptyState({ icon: luFileCheck, title: 'No changes to show' })

    const storedMode = readSetting(MODE_SETTING, 'unified')
    const mode = initState(self, 'rfm.diff-mode', storedMode === 'split' ? 'split' : 'unified')
    mode.watch(self, (value) => writeSetting(MODE_SETTING, value))
    const totals = diffTotals(files)

    return stack(
      { gap: 3 },
      flex(
        { horizontalAlign: 'justify', verticalAlign: 'center', wrap: true },
        flex(
          { gap: 2, verticalAlign: 'center' },
          text({ inline: true, weight: 'bold' }, `${pluralize(files.length, 'file')} changed`),
          tag({ size: 'sm', color: 'green' }, `+${totals.added}`),
          tag({ size: 'sm', color: 'red' }, `-${totals.removed}`),
        ),
        segmented({ value: mode, ariaLabel: 'Diff layout', size: 'sm', options: MODES }),
      ),
      ...files.map((file) => diffFile({ file, mode, focus })),
    )
  },
})
