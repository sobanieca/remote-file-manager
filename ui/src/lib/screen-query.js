import { useRoute } from 'imp/router'
import { computed } from 'imp/state'

export const screenQuery = (handle) =>
  computed([useRoute()], (route) => (route.path === String(handle) ? route.query : null))
