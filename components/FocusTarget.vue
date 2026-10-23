<script setup lang="ts">
// Target of the highlight morph of a ZoomTimeline (same `morph`), on the slide that details the
// highlighted event: an invisible box over the slide under the status bar.
// Arriving on this slide, the highlight frame grows to it and this slide shows within the frame, over
// the timeline that stays still; leaving, the content of this slide fades out quickly while the frame
// shrinks back onto the label and uncovers the timeline.
// Both slides around need `transition: view-transition`.
// <FocusTarget morph="event-stream" />
// The transition clips the snapshot of the slide on top to the frame: the frame of the label and the
// box of this slide are measured, in screen pixels, when the slide changes, while each one is shown
// (before the slides switch for the one leaving, after for the one coming).
import { useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{
  morph: string
}>()

const { $page, $nav, $renderContext } = useSlideContext()
const live = $renderContext.value === 'slide' || $renderContext.value === 'presenter'
const current = computed(() => live && $nav.value.currentSlideNo === $page.value)
const box = ref<HTMLElement>()

const html = document.documentElement
const inset = (r: DOMRect) => `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px)`

// the highlight frame of the timeline that is shown (the other slides are display: none)
function label() {
  const frame = [...document.querySelectorAll<HTMLElement>('.zoom-timeline[data-focus] .focus .frame')]
    .find(el => el.getClientRects().length)
  if (frame)
    html.style.setProperty('--focus-from', inset(frame.getBoundingClientRect()))
}
function slide() {
  if (box.value?.getClientRects().length)
    html.style.setProperty('--focus-to', inset(box.value.getBoundingClientRect()))
}

let done: ReturnType<typeof setTimeout> | undefined
// before the slides switch: measure the one leaving, and set the direction
watch(current, (on) => {
  clearTimeout(done)
  html.classList.toggle('focus-expand', on)
  html.classList.toggle('focus-collapse', !on)
  done = setTimeout(() => html.classList.remove('focus-expand', 'focus-collapse'), 1500)
  if (on)
    label()
  else
    slide()
})
// after: measure the one coming
watch(current, on => on ? slide() : label(), { flush: 'post' })

// Leaving: html.focus-leaving gives each block of content around the title its own view-transition
// name (styles below), so that it fades out on its own, quickly, out of the snapshot of the slide
// (which keeps the background and the grid within the shrinking frame). Set in a router guard, which
// runs before the old state is captured: a class on html, because Slidev may remount the slides between
// the guard and the capture (when the slideshow container switches to a plain div for the view
// transition). Removed once the slides switch, after the capture.
onUnmounted($nav.value.router.beforeEach((to, from) => {
  if (current.value && to.params.no !== from.params.no)
    html.classList.add('focus-leaving')
}))
watch(current, on => !on && html.classList.remove('focus-leaving'))
</script>

<template>
  <div
    ref="box"
    class="focus-target"
    :style="{ viewTransitionName: `${props.morph}-frame`, viewTransitionClass: 'focus-frame' }"
  />
</template>

<style scoped>
/* the slide under the status bar, positioned from the slide body */
.focus-target {
  position: absolute;
  top: calc(var(--hud-statusbar) - var(--hud-top));
  left: calc(-1 * var(--hud-gutter));
  right: calc(-1 * var(--hud-gutter));
  bottom: calc(-1 * var(--hud-bottom));
  pointer-events: none;
}
</style>

<style>
/* no crossfade between the two slides: the one on top covers the other */
html:is(.focus-expand, .focus-collapse)::view-transition-old(root),
html:is(.focus-expand, .focus-collapse)::view-transition-new(root) {
  mix-blend-mode: normal;
}

/* growing: the timeline stays, the detail slide shows within the frame */
html.focus-expand::view-transition-old(root) {
  animation: none;
}

html.focus-expand::view-transition-new(root) {
  animation: focus-reveal 0.8s ease both;
}

/* shrinking: the detail slide, on top, shrinks within the frame and uncovers the timeline */
html.focus-collapse::view-transition-new(root) {
  animation: none;
}

html.focus-collapse::view-transition-old(root) {
  z-index: 1;
  animation: focus-hide 0.8s ease both;
}

/* leaving: the blocks of the slide body that hold neither this target nor the morphing title, and,
   inside the one that holds them, its other children */
html.focus-leaving .hud-body:has(.focus-target) {
  > :not(.focus-target, :has(.focus-target, [style*='view-transition-name'])),
  > :has(.focus-target) > :not([style*='view-transition-name'], :has([style*='view-transition-name'])) {
    view-transition-name: match-element;
    view-transition-class: focus-content;
  }
}

/* shrinking: the content of the slide fades out quickly, where it is */
::view-transition-old(*.focus-content) {
  animation-duration: 0.25s;
}

/* two animations rather than one in reverse, which would reverse the easing too and lag behind the frame */
@keyframes focus-reveal {
  from { clip-path: var(--focus-from); }
  to { clip-path: var(--focus-to); }
}

@keyframes focus-hide {
  from { clip-path: var(--focus-to); }
  to { clip-path: var(--focus-from); }
}
</style>
