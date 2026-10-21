<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref } from 'vue'

// Code block with lettered callouts next to the annotated lines.
// Keys of `notes` are line numbers (1-based); annotated lines get a tinted background.
//
// <CodeEvidence :notes="{ 2: 'Exécuté à chaque installation', 6: 'Récolte les secrets' }">
//
// ```js [bundle.js]
// ...
// ```
//
// </CodeEvidence>
const props = withDefaults(defineProps<{
  notes?: Record<string | number, string>
  codeWidth?: number
  lineHeight?: number
  lineNumbers?: boolean
}>(), {
  notes: () => ({}),
  codeWidth: 1080,
  lineHeight: 54,
  lineNumbers: true,
})

const root = ref<HTMLElement>()
const tops = ref<Record<string, number>>({})

const entries = computed(() => Object.entries(props.notes)
  .map(([line, text]) => ({ line: Number(line), text }))
  .sort((a, b) => a.line - b.line)
  .map((n, i) => ({ ...n, letter: String.fromCharCode(65 + i) })))

// Callouts are aligned on the rendered lines, measured in canvas pixels.
function measure() {
  const el = root.value
  if (!el || !el.offsetHeight)
    return
  const rootRect = el.getBoundingClientRect()
  const scale = rootRect.height / el.offsetHeight || 1
  const lines = el.querySelectorAll<HTMLElement>('.slidev-code .line')
  const next: Record<string, number> = {}
  lines.forEach((line, i) => {
    const annotated = (i + 1) in props.notes
    line.classList.toggle('hud-annotated', annotated)
    if (annotated) {
      const r = line.getBoundingClientRect()
      next[i + 1] = (r.top - rootRect.top + r.height / 2) / scale
    }
  })
  tops.value = next
}

let observer: ResizeObserver | undefined
onMounted(() => {
  nextTick(measure)
  document.fonts?.ready.then(measure)
  observer = new ResizeObserver(measure)
  observer.observe(root.value!)
})
onUpdated(() => nextTick(measure))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="hud-evidence"
    :class="{ numbered: lineNumbers }"
    :style="{ '--code-width': `${codeWidth}px`, '--slidev-code-line-height': `${lineHeight}px` }"
  >
    <div class="code">
      <slot />
    </div>
    <div
      v-for="n in entries"
      v-show="tops[n.line] !== undefined"
      :key="n.line"
      class="note"
      :style="{ top: `${tops[n.line] ?? 0}px` }"
    >
      <i class="leader" /><b class="letter">{{ n.letter }}</b><span class="text">{{ n.text }}</span>
    </div>
  </div>
</template>

<style scoped>
.hud-evidence {
  position: relative;
  width: 100%;
}

.code {
  width: var(--code-width);
}

.code :deep(.slidev-code-wrapper) {
  margin: 0 !important;
}

.code :deep(.slidev-code) {
  padding: 28px 0 !important;
}

.code :deep(.line) {
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  padding: 0 32px 0 28px;
  border-left: 4px solid transparent;
}

.code :deep(.line.hud-annotated) {
  background: var(--hud-accent-tint);
  border-left-color: var(--hud-accent);
  font-weight: 600;
}

.numbered .code :deep(code) {
  counter-reset: hud-line;
}

.numbered .code :deep(.line)::before {
  counter-increment: hud-line;
  content: counter(hud-line, decimal-leading-zero);
  display: inline-block;
  width: 2ch;
  margin-right: 28px;
  text-align: right;
  font-weight: 400;
  color: var(--hud-faint);
}

.note {
  position: absolute;
  left: var(--code-width);
  right: 0;
  display: flex;
  align-items: center;
  gap: 20px;
  transform: translateY(-50%);
}

.leader {
  flex: none;
  width: 52px;
  height: 2px;
  margin-right: -20px;
  background: var(--hud-accent);
}

.letter {
  flex: none;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hud-accent);
  color: var(--hud-surface);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 24px;
}

.text {
  font-size: 30px;
  font-weight: 500;
  line-height: 1.2;
}
</style>
