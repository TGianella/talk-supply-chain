<script setup lang="ts">
// First contact of the axios lure: a message from the "founder" of the cloned company. The post-mortem
// (axios/axios#10636) doesn't say on which channel; Socket reports outreach starting on LinkedIn or Slack.
// The channel and the messages are a reconstruction.
// - at the opening: the founder's message, flattering, with a reason to talk;
// - click 1: the invitation to the company's Slack, where other maintainers already are.
// Steps count from the click that opened its window in the case layout (`clicks` on that modus row), or from `at`.
// <FirstContact />
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
const invited = computed(() => step.value >= 1)

const off = (on: boolean) => on ? undefined : ''
</script>

<template>
  <div class="first-contact">
    <!-- the sender: the founder, with the cloned company's branding -->
    <div class="sender">
      <i class="avatar">FO</i>
      <div>
        <div class="name">Fondateur & CEO</div>
        <div class="headline">Fondateur chez <Redact>Entreprise</Redact> · 3e relation</div>
      </div>
    </div>

    <div class="thread">
      <div class="message">
        <div class="meta"><b>Fondateur</b><span>lun. 09:41</span></div>
        <p>Bonjour Jason, axios est partout dans notre produit : merci pour tout ce travail.</p>
        <p>Nous lançons un programme pour soutenir les mainteneurs dont nous dépendons, et j’aimerais beaucoup en discuter avec toi.</p>
      </div>
      <div class="message pop" :data-off="off(invited)">
        <div class="meta"><b>Fondateur</b><span>lun. 09:44</span></div>
        <p>Quelques mainteneurs nous ont déjà rejoints sur notre Slack, je t’y invite ?</p>
        <div class="card">
          <div class="card-title">Invitation à rejoindre <Redact>Entreprise</Redact> sur Slack</div>
          <div class="card-text">l’équipe et des mainteneurs open source</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* paddings include the 3px border of the window */
.first-contact {
  display: flex;
  flex-direction: column;
  width: 1100px;
  padding: 0 3px 3px;
}

.sender {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 32px 18px;
  border-bottom: 2px solid var(--hud-faint);
}

.avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  background: color-mix(in srgb, var(--hud-ink) 20%, var(--hud-surface));
  font-family: var(--hud-font-mono);
  font-style: normal;
  font-weight: 600;
  font-size: 20px;
}

.name {
  font-family: var(--hud-font-head);
  font-weight: 700;
  font-size: 28px;
}

.headline {
  font-size: 20px;
  color: var(--hud-muted);
}

.thread {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 26px 32px 32px;
}

.meta {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 20px;
}

.meta span {
  font-family: var(--hud-font-mono);
  font-size: 16px;
  color: var(--hud-muted);
}

p {
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.4;
}

/* the invitation: a card with a rule on the left */
.card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 640px;
  margin-top: 8px;
  padding: 12px 18px 14px;
  border-left: 4px solid var(--hud-accent);
  background: color-mix(in srgb, var(--hud-ink) 4%, var(--hud-surface));
}

.card-title {
  font-family: var(--hud-font-mono);
  font-weight: 600;
  font-size: 19px;
  color: var(--hud-accent);
}

.card-text {
  font-size: 20px;
  color: var(--hud-muted);
}

/* steps: fade in; going back hides them at once */
.pop {
  transition: opacity 0.3s ease;
}

.pop[data-off] {
  opacity: 0;
  transition: none;
}
</style>
