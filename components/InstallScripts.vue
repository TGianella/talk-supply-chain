<script setup lang="ts">
// Install scripts (preinstall, install, postinstall) of the dependencies, blocked by default in each package
// manager: one row per package manager, in the order they did it, with how to allow a package.
// - at the opening: Bun, from its first versions (with a built-in list of popular packages since 1.0.16);
// - click 1: pnpm 10;
// - click 2: npm 12, the default client;
// - click 3: Yarn, which still runs them unless enableScripts is turned off.
// <InstallScripts />
import PmTable from './PmTable.vue'

defineProps<{
  at?: number
}>()

const rows = [
  { name: 'Bun', when: 'v0.1.7 · août 2022', key: 'trustedDependencies', file: 'package.json', value: 'Bloqués', note: 'sauf 500 paquets connus' },
  { name: 'pnpm', when: 'v10 · janv. 2025', key: 'onlyBuiltDependencies', file: 'pnpm approve-builds', value: 'Bloqués', note: 'liste à approuver' },
  { name: 'npm', when: 'v12 · juil. 2026', key: 'allowScripts', file: 'npm approve-scripts', value: 'Bloqués', note: 'liste à approuver', hot: true },
  { name: 'Yarn', when: 'v4', key: 'enableScripts: false', file: '.yarnrc.yml', value: 'Exécutés', note: 'à désactiver soi-même' },
]
</script>

<template>
  <PmTable :heads="['réglage', 'par défaut']" :rows="rows" :at="at" />
</template>
