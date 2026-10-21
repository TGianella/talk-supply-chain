<script setup lang="ts">
// Investigator ID badge, for the introduction slide.
// <InvestigatorBadge photo="/me.jpg" :fields="{ Nom: 'Gianella', Unité: 'Zenika' }" handle="@pseudo" />
withDefaults(defineProps<{
  title?: string
  number?: string
  photo?: string
  fields?: Record<string, string>
  handle?: string
  rotate?: number
}>(), {
  title: 'INVESTIGATOR',
  fields: () => ({}),
  rotate: -6,
})

const bars = [4, 2, 6, 2, 3, 5, 2, 4, 2, 6, 3, 2, 5, 2, 4, 3, 6, 2]
</script>

<template>
  <div class="scene-badge" :style="{ transform: `rotate(${rotate}deg)` }">
    <div class="slot"><i /></div>
    <div class="bar">
      <span class="title">{{ title }}</span>
      <span v-if="number" class="number">{{ number }}</span>
    </div>
    <div class="body">
      <div class="photo">
        <img v-if="photo" :src="photo" alt="">
        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path fill="currentColor" d="M9.877 10.508Q9 9.63 9 8.385t.877-2.123T12 5.385t2.123.877T15 8.385t-.877 2.123t-2.123.877t-2.123-.877M5 18.616v-1.647q0-.619.36-1.158q.361-.54.97-.838q1.416-.679 2.834-1.018q1.417-.34 2.836-.34t2.837.34t2.832 1.018q.61.298.97.838q.361.539.361 1.158v1.646z" />
        </svg>
      </div>
      <div class="fields">
        <div v-for="(v, k) in fields" :key="k" class="field">
          <span class="key">{{ k }}</span>
          <span class="value">{{ v }}</span>
        </div>
      </div>
    </div>
    <div class="foot">
      <div class="barcode">
        <i v-for="(w, i) in bars" :key="i" :style="{ width: `${w}px` }" />
      </div>
      <span v-if="handle" class="handle">{{ handle }}</span>
    </div>
  </div>
</template>

<style scoped>
.scene-badge {
  transform-origin: top left; /* as in design.pen */
  width: 560px;
  overflow: hidden;
  border-radius: 14px;
  background: #f4f3ee;
  color: #1b1c1e;
  box-shadow: 0 20px 44px #000000b3;
}

.slot {
  display: flex;
  justify-content: center;
  padding-top: 18px;
}

.slot i {
  width: 90px;
  height: 14px;
  border-radius: 7px;
  background: #c9cbc6;
}

.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 18px;
  padding: 12px 28px;
  background: var(--scene-tape);
  color: var(--scene-tape-ink);
}

.title {
  font-family: var(--hud-font-tape);
  font-size: 34px;
  line-height: 1.1;
  letter-spacing: 2px;
}

.number,
.handle {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.1em;
}

.body {
  display: flex;
  gap: 28px;
  padding: 28px;
}

.photo {
  flex: none;
  width: 190px;
  height: 240px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  background: #d5d7d2;
  color: #9ea29c;
}

.photo img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  filter: grayscale(1);
}

.photo svg {
  width: 190px;
  height: 210px;
}

.fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.key {
  font-family: var(--hud-font-mono);
  font-size: 15px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #7a7e78;
}

.value {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 24px;
  line-height: 1.2;
  text-transform: uppercase;
}

.foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 28px 24px;
}

.barcode {
  display: flex;
  gap: 3px;
  height: 40px;
}

.barcode i {
  background: #1b1c1e;
}
</style>
