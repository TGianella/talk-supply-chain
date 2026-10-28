<script setup lang="ts">
import { computed } from 'vue'

// Terminal of a maintainer account publishing packages one after another, for the `::screen::` slot of
// scene-shot. Once the slide is shown, the lines appear one by one and the oldest scroll up off the screen.
// `step`: seconds between two lines, `pause`: extra seconds between two packages.
// <PublishLog :packages="['chalk@5.6.1', 'debug@4.4.2']" />
const props = withDefaults(defineProps<{
  packages: string[]
  step?: number
  pause?: number
}>(), {
  step: 0.12,
  pause: 0.5,
})

const lines = computed(() => props.packages.flatMap((pkg, i) => {
  const name = pkg.slice(0, pkg.lastIndexOf('@'))
  return [
    { kind: 'cmd', text: `~/${name} $ npm publish` },
    { kind: 'notice', text: `npm notice 📦  ${pkg}` },
    { kind: 'notice', text: 'npm notice Publishing to https://registry.npmjs.org/ with tag latest and default access' },
    { kind: 'done', text: `+ ${pkg}` },
  ].map((line, j) => ({ ...line, delay: i * (4 * props.step + props.pause) + j * props.step }))
}))
</script>

<template>
  <div class="publish-log">
    <div
      v-for="(line, i) in lines" :key="i"
      class="line" :data-kind="line.kind" :style="{ '--line-delay': `${line.delay}s` }"
    >
      {{ line.text }}
    </div>
  </div>
</template>

<style>
.publish-log {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  padding: 0 120px 300px;
  background:
    repeating-linear-gradient(to bottom, #ffffff08 0 2px, #00000000 2px 5px),
    radial-gradient(ellipse 70% 70% at 45% 45%, #1c1d1f 0%, #070707 100%);
  font-family: var(--hud-font-mono);
  font-size: 34px;
  line-height: 1.5;
  color: #b9bcc0;
  text-shadow: 0 0 10px #ffffff40;
}

.publish-log .line {
  flex: none;
  max-height: 0;
  overflow: hidden;
  white-space: pre;
}

.publish-log .line[data-kind='cmd'] {
  color: var(--scene-chalk);
}

.publish-log .line[data-kind='notice'] {
  color: #7d8085;
}

.publish-log .line[data-kind='done'] {
  font-weight: 600;
  color: #ffffff;
}

.scene-shot[data-active] .publish-log .line {
  animation: publish-line 0.01s linear var(--line-delay) forwards;
}

@keyframes publish-line {
  to { max-height: 1.5em; }
}
</style>
