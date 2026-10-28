<script setup lang="ts">
// The release-age cooldown in each package manager: a version is installed only once it has been published for
// some time. One row per package manager, in the order they shipped it, with the value for one day in its unit.
// - at the opening: pnpm 10.16;
// - clicks 1 to 3: Yarn 4.10, Bun 1.3, npm 11.10;
// - click 4: pnpm 11, the cooldown on by default.
// <ReleaseCooldown />
import PmTable from './PmTable.vue'

defineProps<{
  at?: number
}>()

const rows = [
  { name: 'pnpm', when: 'v10.16 · sept. 2025', key: 'minimumReleaseAge', file: 'pnpm-workspace.yaml', value: '1440', note: 'minutes' },
  { name: 'Yarn', when: 'v4.10 · sept. 2025', key: 'npmMinimalAgeGate', file: '.yarnrc.yml', value: '1440', note: 'minutes' },
  { name: 'Bun', when: 'v1.3 · oct. 2025', key: '[install] minimumReleaseAge', file: 'bunfig.toml', value: '86400', note: 'secondes' },
  { name: 'npm', when: 'v11.10 · févr. 2026', key: 'min-release-age', file: '.npmrc', value: '1', note: 'jour' },
  { name: 'pnpm 11', when: '2026', key: 'minimumReleaseAge', file: 'pnpm-workspace.yaml', value: '1440', note: 'par défaut', hot: true },
]
</script>

<template>
  <PmTable :heads="['réglage', 'pour un jour']" :rows="rows" :at="at" />
</template>
