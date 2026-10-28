<script setup lang="ts">
// The two tensions of a dev who installs dependencies, as two scales between two poles,
// each pole with what it costs, and the balance between them:
// - click 1: the age of the installed versions, recent ↔ old;
// - click 2: its balance, a release-age cooldown of a few days;
// - click 3: its escape hatch, a fix for a vulnerability installed without waiting (a tick at the recent end);
// - click 4: the version constraints, ranges and latest (DX) ↔ pinned versions (security);
// - click 5: its balance, towards pinned versions: a lockfile and tooled updates.
// Steps count from `at` (0 by default); the slide declares the clicks (`clicks: 5`).
// <DevTradeoffs />
import { useSlideContext } from '@slidev/client'
import { computed } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const step = computed(() => $clicks.value - (props.at ?? 0))

const W = 1680
const ROW = 340
// the balance is a span of the axis, in fractions of its width
const rows: {
  title: string
  left: { name: string, note: string }
  right: { name: string, note: string }
  zone: [number, number]
  balance: string
  hatch?: string
}[] = [
  {
    title: 'Âge des versions installées',
    left: { name: 'Récentes', note: 'version piégée pas encore détectée' },
    right: { name: 'Anciennes', note: 'failles connues pas corrigées' },
    zone: [0.14, 0.34],
    balance: 'délai de publication · quelques jours',
    hatch: 'exception : un correctif de faille passe immédiatement',
  },
  {
    title: 'Contraintes de version',
    left: { name: 'latest, plages ^ ~', note: 'DX : tout nouveau code s’installe seul' },
    right: { name: 'Versions figées', note: 'sécurité : chaque mise à jour à la main' },
    zone: [0.75, 0.92],
    balance: 'mises à jour automatisées',
  },
]

// the clicks of each row: its scale, its balance, then its escape hatch if it has one
const clicks = (() => {
  let c = 1
  return rows.map((r) => {
    const scale = c++
    const balance = c++
    const hatch = r.hatch ? c++ : 0
    return { scale, balance, hatch }
  })
})()

const axisY = (i: number) => i * ROW + 150
const HATCH_X = 80
const arrow = (px: number, py: number, dir: 1 | -1) => `${px},${py} ${px - dir * 20},${py - 12} ${px - dir * 20},${py + 12}`

// hidden until its step; going back hides it at once
const off = (on: boolean) => on ? undefined : ''
</script>

<template>
  <svg :viewBox="`0 0 ${W} ${ROW * rows.length - 40}`" class="dev-tradeoffs" fill="none">
    <g v-for="(r, i) in rows" :key="r.title">
      <!-- the scale: its title, the axis between the two poles, what each pole costs -->
      <g class="pop" :data-off="off(step >= clicks[i].scale)">
        <text x="0" :y="i * ROW + 36" class="title">{{ r.title }}</text>
        <path :d="`M4 ${axisY(i)}H${W - 4}`" class="axis" />
        <polygon :points="arrow(0, axisY(i), -1)" class="tip" />
        <polygon :points="arrow(W, axisY(i), 1)" class="tip" />
        <text x="0" :y="axisY(i) + 60" class="pole">{{ r.left.name }}</text>
        <text x="0" :y="axisY(i) + 100" class="note">{{ r.left.note }}</text>
        <text :x="W" :y="axisY(i) + 60" class="pole" text-anchor="end">{{ r.right.name }}</text>
        <text :x="W" :y="axisY(i) + 100" class="note" text-anchor="end">{{ r.right.note }}</text>
      </g>

      <!-- the balance between the two -->
      <g class="pop" :data-off="off(step >= clicks[i].balance)">
        <rect :x="W * r.zone[0]" :y="axisY(i) - 12" :width="W * (r.zone[1] - r.zone[0])" height="24" class="zone" />
        <text :x="W * (r.zone[0] + r.zone[1]) / 2" :y="axisY(i) - 34" class="balance" text-anchor="middle">{{ r.balance }}</text>
      </g>

      <!-- the escape hatch: a tick at the recent end, past the cooldown, its label under the pole's -->
      <g v-if="r.hatch" class="pop" :data-off="off(step >= clicks[i].hatch)">
        <path :d="`M${HATCH_X} ${axisY(i) - 24}V${axisY(i) + 24}`" class="hatch-tick" />
        <text x="0" :y="axisY(i) + 140" class="hatch">{{ r.hatch }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.dev-tradeoffs {
  display: block;
  width: 1680px;
  overflow: visible;
}

.title {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 40px;
  fill: var(--hud-ink);
}

.axis {
  stroke: var(--hud-faint);
  stroke-width: 4;
}

.tip {
  fill: var(--hud-faint);
}

.pole {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 24px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-accent);
}

.note {
  font-family: var(--hud-font-body);
  font-size: 28px;
  fill: var(--hud-muted);
}

.zone {
  fill: var(--hud-ink);
}

.balance {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 24px;
  letter-spacing: 0.05em;
  fill: var(--hud-ink);
}

.hatch-tick {
  stroke: var(--hud-accent);
  stroke-width: 6;
}

.hatch {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 24px;
  letter-spacing: 0.05em;
  fill: var(--hud-accent);
}

.pop {
  transition: opacity 0.3s ease;
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
