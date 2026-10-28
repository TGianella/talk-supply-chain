<script setup lang="ts">
import HudCorners from '../components/HudCorners.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'

// Introduction of the speaker. Name (h1) in the default slot, `fields` (label → value) listed under it.
// The portrait on the right shows `photo` (path in public/), a silhouette without one.
defineProps<{
  status?: string
  kicker?: string
  fields?: Record<string, string>
  photo?: string
}>()
</script>

<template>
  <div class="slidev-layout hud investigator">
    <HudFrame :status="status ?? 'Enquêteur'" />
    <div class="intro">
      <Kicker>{{ kicker ?? 'Enquêteur assigné' }}</Kicker>
      <slot />
      <dl v-if="fields">
        <div v-for="(v, k) in fields" :key="k" class="field">
          <dt>{{ k }}</dt>
          <dd>{{ v }}</dd>
        </div>
      </dl>
    </div>
    <div class="portrait">
      <span class="coord">Sujet 01  //  X 1240  Y 0250</span>
      <HudCorners padding="24px">
        <div class="photo">
          <img v-if="photo" :src="photo" alt="">
          <svg v-else class="person" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M9.877 10.508Q9 9.63 9 8.385t.877-2.123T12 5.385t2.123.877T15 8.385t-.877 2.123t-2.123.877t-2.123-.877M5 18.616v-1.647q0-.619.36-1.158q.361-.54.97-.838q1.416-.679 2.834-1.018q1.417-.34 2.836-.34t2.837.34t2.832 1.018q.61.298.97.838q.361.539.361 1.158v1.646z" />
          </svg>
        </div>
      </HudCorners>
      <div class="caption">
        <span class="confirmed">■ Identité confirmée</span>
        <span>Match 99,8 %</span>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.investigator {
  .intro {
    position: absolute;
    left: 120px;
    top: 250px;
    width: 900px;
  }

  h1 {
    font-size: 120px;
    line-height: 1;
    margin: 0 0 48px;
  }

  dl {
    display: flex;
    flex-direction: column;
    gap: 40px;
    margin: 0;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  dt {
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-accent);
  }

  dd {
    margin: 0;
    font-size: 40px;
    color: var(--hud-ink);
  }

  /* the corners sit 24px around the 560×680 photo */
  .portrait {
    position: absolute;
    left: 1216px;
    top: 226px;
    width: 608px;
  }

  .coord,
  .caption {
    font-family: var(--hud-font-mono);
    font-size: 18px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
    white-space: pre;
  }

  .coord {
    position: absolute;
    top: -42px;
  }

  .photo {
    width: 560px;
    height: 680px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    background: #dce4ee;
    overflow: hidden;
  }

  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .photo .person {
    width: 480px;
    height: 480px;
    margin-bottom: -40px;
    color: #9aabc1;
  }

  .caption {
    display: flex;
    justify-content: space-between;
    margin-top: 22px;
  }

  .confirmed {
    font-weight: 600;
    color: var(--hud-accent);
  }
}
</style>
