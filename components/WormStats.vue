<script setup lang="ts">
// What followed the publication of Shai-Hulud's source (12.05.2026): npm packages hit by the waves that reused it,
// with the TanStack wave before it for comparison. Counts from the reports, which differ between sources: @antv 323
// (Socket), Miasma 32 (Socket), keyv ≈ 440 (Cloudsmith, ArmorCode).
// <WormStats />
const before = [{ date: '11.05', name: 'TanStack', count: 42, label: '42' }]
const after = [
  { date: '19.05', name: '@antv', count: 323, label: '323' },
  { date: '01.06', name: 'Miasma (Red Hat)', count: 32, label: '32' },
  { date: '04.08', name: 'keyv, cacheable', count: 440, label: '≈ 440' },
]
const max = 440
const width = (n: number) => `${(n / max) * 100}%`
</script>

<template>
  <div class="worm-stats">
    <div class="caption">Paquets npm touchés par vague</div>
    <div v-for="w in before" :key="w.name" class="row">
      <span class="date">{{ w.date }}</span>
      <span class="name">{{ w.name }}</span>
      <span class="track"><i class="bar" :style="{ width: width(w.count) }" /></span>
      <span class="count">{{ w.label }}</span>
    </div>
    <div class="divider"><span>12.05 · le code est publié</span></div>
    <div v-for="w in after" :key="w.name" class="row">
      <span class="date">{{ w.date }}</span>
      <span class="name">{{ w.name }}</span>
      <span class="track"><i class="bar" :style="{ width: width(w.count) }" /></span>
      <span class="count">{{ w.label }}</span>
    </div>
  </div>
</template>

<style scoped>
/* paddings include the 3px border of the window */
.worm-stats {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 30px 43px 43px;
}

.caption {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.row {
  display: grid;
  grid-template-columns: 100px 280px 1fr 110px;
  align-items: center;
  gap: 24px;
}

.date {
  font-family: var(--hud-font-mono);
  font-size: 20px;
  color: var(--hud-muted);
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 28px;
}

.track {
  display: block;
  height: 28px;
}

.bar {
  display: block;
  height: 100%;
  background: var(--hud-ink);
}

.count {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 26px;
  text-align: right;
}

/* the publication of the code, between the waves before and after */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 6px 0;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--hud-accent);
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-top: 3px dashed var(--hud-accent);
}

.divider::before {
  flex: none;
  width: 100px;
}
</style>
