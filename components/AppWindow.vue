<script setup lang="ts">
// Bordered window with a title bar, like a window on a desktop; the content goes in the slot.
// Works with the `open-center` class for the opening transition.
// <AppWindow v-click class="open-center" title="…">…</AppWindow>
defineProps<{ title: string }>()
</script>

<template>
  <div class="app-window">
    <div class="frame">
      <div class="bar">
        <span class="title">{{ title }}</span>
        <span class="buttons"><i /><i /><i /></span>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.app-window {
  display: flex;
  flex-direction: column;
}

/* the root stays unpositioned so the slide can place it (absolute, …); the frame holds the border */
.frame {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--hud-surface);
}

/* border drawn on top of the content, so subpixel seams at the edges (the slide is scaled)
   don't show as light lines or make the border look thicker in places;
   paddings inside the window should include its 3px */
.frame::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 3px solid var(--hud-ink);
  pointer-events: none;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 15px 23px 12px;
  background: var(--hud-ink);
  color: var(--hud-surface);
}

.title {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 30px;
  line-height: 1.1;
}

.buttons {
  display: flex;
  gap: 8px;
}

.buttons i {
  width: 16px;
  height: 16px;
  border: 2px solid var(--hud-surface);
}
</style>

<style>
/* a code block fills the window: no border of its own (the window's covers its edges) and no margin */
.slidev-layout .app-window .frame .slidev-code-wrapper {
  margin: 0 !important;
}

.app-window .frame .slidev-code-wrapper .slidev-code {
  border: none;
}
</style>
