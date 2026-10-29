import type { NavOperations, ShortcutOptions } from '@slidev/types'
import { defineShortcutsSetup } from '@slidev/types'

// The remote controller sends up/down: step through clicks like left/right
// instead of jumping to the previous/next slide.
export default defineShortcutsSetup((nav: NavOperations, base: ShortcutOptions[]) => {
  return base.map((shortcut) => {
    if (shortcut.name === 'next_down')
      return { ...shortcut, fn: nav.next }
    if (shortcut.name === 'prev_up')
      return { ...shortcut, fn: nav.prev }
    return shortcut
  })
})
