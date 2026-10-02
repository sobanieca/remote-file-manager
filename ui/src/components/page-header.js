import { heading, icon, link, text } from 'imp/std'
import { flex, stack } from 'imp/std/layout'

const subtitleOf = (subtitle) => {
  if (!subtitle) return null
  if (typeof subtitle === 'string') return text({ size: 'sm', tone: 'secondary' }, subtitle)
  return link({ href: subtitle.href, tone: 'secondary', size: 'sm' }, subtitle.label)
}

export const pageHeader = ({ glyph, title, subtitle, badges = [], actions = [] }) =>
  flex(
    { horizontalAlign: 'justify', verticalAlign: 'center', wrap: true, gap: 3 },
    flex(
      { gap: 3, verticalAlign: 'center' },
      icon(glyph, { size: 'lg', color: 'primary' }),
      stack(
        { gap: 1 },
        flex(
          { gap: 2, verticalAlign: 'center', wrap: true },
          heading({ level: 1 }, title),
          ...badges,
        ),
        subtitleOf(subtitle),
      ),
    ),
    actions.length > 0 ? flex({ gap: 2, wrap: true }, ...actions) : null,
  )
