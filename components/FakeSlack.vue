<script setup lang="ts">
// The Slack workspace of the axios lure (maintainer's post-mortem, axios/axios#10636): a cloned company,
// branded like it, with channels sharing LinkedIn posts, the profiles of its team and of other open source
// maintainers. Channels, roles and messages are a reconstruction; the company is not named in the sources.
// - at the opening: the workspace, on the channel where the team shares its LinkedIn posts;
// - click 1: the members are all fake profiles, except you;
// - click 2: the founder invites you to a call.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <FakeSlack />
import type { Ref } from 'vue'
import { useSlideContext } from '@slidev/client'
import { computed, inject } from 'vue'
import Redact from '../theme/components/Redact.vue'

const props = defineProps<{
  at?: number
}>()

const { $clicks } = useSlideContext()
const opened = inject<Ref<number> | undefined>('case-window-at', undefined)
const step = computed(() => $clicks.value - (props.at ?? opened?.value ?? 0))
const exposed = computed(() => step.value >= 1)
const invited = computed(() => step.value >= 2)

const channels = ['général', 'annonces', 'linkedin', 'open-source']
const members = [
  { initials: 'FO', role: 'Fondateur' },
  { initials: 'CT', role: 'CTO' },
  { initials: 'DR', role: 'Head of DevRel' },
  { initials: 'MA', role: 'Mainteneur OSS' },
  { initials: 'MB', role: 'Mainteneur OSS' },
  { initials: 'MC', role: 'Mainteneur OSS' },
]
const messages = [
  { initials: 'FO', role: 'Fondateur', time: '10:02', text: 'Notre annonce de la semaine, un partage nous aiderait beaucoup !', post: true },
  { initials: 'DR', role: 'Head of DevRel', time: '10:15', text: 'Partagé ! Content de voir autant de mainteneurs ici.' },
  { initials: 'MA', role: 'Mainteneur OSS', time: '10:21', text: 'Pareil, belle initiative pour l’open source.' },
]

// hidden until its step; the delay orders what a step shows
const off = (on: boolean) => on ? undefined : ''
const d = (s: number) => ({ '--d': `${s}s` })
</script>

<template>
  <div class="fake-slack">
    <!-- the workspace, branded like the cloned company -->
    <aside class="sidebar">
      <div class="workspace">
        <i class="logo" />
        <div>
          <div class="name"><Redact>Entreprise</Redact></div>
          <div class="caption">workspace Slack</div>
        </div>
      </div>
      <div class="section">Canaux</div>
      <div v-for="c in channels" :key="c" class="channel" :data-active="c === 'linkedin' ? '' : undefined"># {{ c }}</div>
      <div class="section">Messages directs</div>
      <div class="channel">• Fondateur</div>
    </aside>

    <!-- the channel where the team shares its LinkedIn posts -->
    <main class="channel-pane">
      <div class="channel-head"># linkedin</div>
      <div v-for="m in messages" :key="m.time" class="message">
        <i class="avatar">{{ m.initials }}</i>
        <div class="body">
          <div class="meta"><b>{{ m.role }}</b><span>{{ m.time }}</span></div>
          <div class="text">{{ m.text }}</div>
          <div v-if="m.post" class="card">
            <div class="card-title">linkedin.com/posts/…</div>
            <i class="skeleton" />
            <i class="skeleton short" />
          </div>
        </div>
      </div>
      <!-- click 2: the founder invites you to a call -->
      <div class="message pop" :data-off="off(invited)" :style="d(0)">
        <i class="avatar">FO</i>
        <div class="body">
          <div class="meta"><b>Fondateur</b><span>10:34</span></div>
          <div class="text">On s’appelle demain avec l’équipe ? Je t’envoie l’invitation.</div>
          <div class="card hot">
            <div class="card-title">Réunion Microsoft Teams</div>
            <div class="card-text">demain, 16:00 · 4 participants</div>
          </div>
        </div>
      </div>
    </main>

    <!-- the members: click 1, all fake profiles, except you -->
    <aside class="members">
      <div class="section">Membres</div>
      <div v-for="(m, i) in members" :key="m.initials" class="member">
        <i class="avatar small">{{ m.initials }}</i>
        <span class="role">{{ m.role }}</span>
        <span class="fake pop" :data-off="off(exposed)" :style="d(i * 0.12)">faux</span>
      </div>
      <div class="member">
        <i class="avatar small you">VO</i>
        <span class="role">Vous</span>
      </div>
    </aside>
  </div>
</template>

<style scoped>
/* paddings include the 3px border of the window */
.fake-slack {
  display: grid;
  grid-template-columns: 300px 1fr 340px;
  height: 640px;
  margin: 0 3px 3px;
}

.sidebar,
.members {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px 24px 24px 28px;
  background: color-mix(in srgb, var(--hud-ink) 6%, var(--hud-surface));
}

.members {
  padding: 24px 28px 24px 24px;
}

.workspace {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.logo {
  flex: none;
  width: 48px;
  height: 48px;
  background: var(--hud-ink);
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 26px;
  line-height: 1.2;
}

.caption {
  font-family: var(--hud-font-mono);
  font-size: 16px;
  color: var(--hud-muted);
}

.section {
  margin: 14px 0 4px;
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-muted);
}

.channel {
  padding: 4px 12px;
  margin: 0 -12px;
  font-size: 22px;
  color: var(--hud-muted);
}

.channel[data-active] {
  background: var(--hud-ink);
  color: var(--hud-surface);
  font-weight: 600;
}

.channel-pane {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 0 32px 24px;
  overflow: hidden;
}

.channel-head {
  margin: 0 -32px;
  padding: 18px 32px 14px;
  border-bottom: 2px solid var(--hud-faint);
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 26px;
}

.message {
  display: flex;
  gap: 16px;
}

.avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  background: color-mix(in srgb, var(--hud-ink) 20%, var(--hud-surface));
  font-family: var(--hud-font-mono);
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
}

.avatar.small {
  width: 40px;
  height: 40px;
  font-size: 14px;
}

.avatar.you {
  background: var(--hud-ink);
  color: var(--hud-surface);
}

.meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 20px;
}

.meta span {
  font-family: var(--hud-font-mono);
  font-size: 16px;
  color: var(--hud-muted);
}

.text {
  font-size: 22px;
  line-height: 1.35;
}

/* shared link or invitation: a card with a rule on the left */
.card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 420px;
  margin-top: 10px;
  padding: 10px 16px 12px;
  border-left: 4px solid var(--hud-faint);
  background: color-mix(in srgb, var(--hud-ink) 4%, var(--hud-surface));
}

.card.hot {
  border-left-color: var(--hud-accent);
}

.card-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 18px;
}

.card.hot .card-title {
  color: var(--hud-accent);
}

.card-text {
  font-size: 20px;
  color: var(--hud-muted);
}

.skeleton {
  height: 12px;
  background: var(--hud-faint);
}

.skeleton.short {
  width: 60%;
}

.member {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 4px 0;
}

.role {
  flex: 1;
  font-size: 22px;
}

.fake {
  padding: 2px 8px;
  border: 2px solid var(--hud-accent);
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--hud-accent);
}

/* steps: fade in after their delay (--d); going back hides them at once */
.pop {
  transition: opacity 0.3s ease var(--d, 0s);
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
