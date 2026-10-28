<script setup lang="ts">
// How npm hardened its accounts, as a before / after table, one row per click:
// - at the opening: the three rows, with what was there before;
// - click 1: the second factor, TOTP codes (which a fake site can relay) replaced by WebAuthn passkeys (bound to the domain);
// - click 2: npm login, a token without expiry replaced by a 2-hour session;
// - click 3: the sensitive actions (tokens, maintainers, access), an interactive 2FA challenge even with a token.
// Steps count from the click that opened its window (`clicks` on the card in the cards layout), or from `at`.
// <AccountSecurity />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))

const rows = [
  { name: 'Second facteur', note: 'connexion, publication', before: ['Code TOTP', 'un faux site peut le relayer'], after: ['Passkey WebAuthn', 'liée au vrai domaine'] },
  { name: 'Connexion CLI', note: 'npm login', before: ['Token sans expiration', 'stocké dans ~/.npmrc'], after: ['Session de 2 h', 'puis on se reconnecte'] },
  { name: 'Actions sensibles', note: 'tokens, mainteneurs, accès', before: ['Un token suffit', 'pas de 2FA demandée'], after: ['2FA interactive', 'même avec un token'] },
]

// columns: the row names, before, then after; one row every RS
const BX = 460
const AX = 940
const R0 = 90
const RS = 140
const ry = (i: number) => R0 + i * RS
const done = (i: number) => step.value >= i + 1

const right = (px: number, py: number) => `${px},${py} ${px - 18},${py - 10} ${px - 18},${py + 10}`

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <svg viewBox="0 0 1400 480" class="account-security" fill="none">
    <text :x="BX" y="30" class="label">avant</text>
    <text :x="AX" y="30" class="label">après</text>
    <path d="M0 50H1400" class="rule" />

    <g v-for="(r, i) in rows" :key="r.name">
      <path v-if="i" :d="`M0 ${ry(i) - 30}H1400`" class="rule faint" />
      <text x="0" :y="ry(i) + 30" class="name">{{ r.name }}</text>
      <text x="0" :y="ry(i) + 66" class="label">{{ r.note }}</text>

      <!-- before: fades once replaced -->
      <g class="before" :data-done="done(i) ? '' : undefined">
        <text :x="BX" :y="ry(i) + 30" class="value">{{ r.before[0] }}</text>
        <text :x="BX" :y="ry(i) + 66" class="label">{{ r.before[1] }}</text>
      </g>

      <!-- click i + 1: replaced by -->
      <path :d="`M${AX - 90} ${ry(i) + 20}H${AX - 36}`" pathLength="1" class="line draw" :data-off="off(done(i))" />
      <polygon :points="right(AX - 20, ry(i) + 20)" class="accent pop" :data-off="off(done(i))" :style="d(0.3)" />
      <g class="pop" :data-off="off(done(i))" :style="d(0.35)">
        <text :x="AX" :y="ry(i) + 30" class="value hot">{{ r.after[0] }}</text>
        <text :x="AX" :y="ry(i) + 66" class="label">{{ r.after[1] }}</text>
      </g>
    </g>
  </svg>
</template>

<style scoped>
.account-security {
  display: block;
  width: 1400px;
  padding: 32px 40px 24px;
  overflow: visible;
}

.rule {
  stroke: var(--hud-muted);
  stroke-width: 2;
}

.rule.faint {
  stroke: var(--hud-faint);
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 34px;
  fill: var(--hud-ink);
}

.value {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 30px;
  fill: var(--hud-ink);
}

.value.hot {
  fill: var(--hud-accent);
}

.label {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  fill: var(--hud-muted);
}

.line {
  stroke: var(--hud-accent);
  stroke-width: 3;
}

.accent {
  fill: var(--hud-accent);
}

/* before, once replaced: fades */
.before {
  transition: opacity 0.3s ease;
}

.before[data-done] {
  opacity: 0.35;
}

/* steps: lines draw themselves, the rest fades in after them (--d); going back hides them at once */
.draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 0;
  transition: stroke-dashoffset 0.3s ease-in-out var(--d, 0s);
}

.draw[data-off] {
  stroke-dashoffset: 1;
  transition: none;
}

.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
