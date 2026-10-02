import { component } from 'imp'
import { useState } from 'imp/state'
import { button, icon } from 'imp/std'
import { tooltip } from 'imp/std/display'
import { luSearch } from 'imp/icons'

export const searchTrigger = component('rfm-search-trigger', {
  setup: (self) => {
    const open = useState(self, 'rfm.search-open')
    return tooltip(
      { text: 'Search files (Ctrl+P)' },
      button(
        {
          variant: 'ghost',
          size: 'sm',
          square: true,
          label: 'Search files',
          events: { click: () => open.set(true) },
        },
        icon(luSearch),
      ),
    )
  },
})
