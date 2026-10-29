<script setup lang="ts">
import HudCorners from '../components/HudCorners.vue'
import Fingerprint from '../components/Fingerprint.vue'
import HudFrame from '../components/HudFrame.vue'
import Kicker from '../components/Kicker.vue'
import Stamp from '../components/Stamp.vue'
import { useSlideContext } from '@slidev/client'
import { withBase } from '../utils/base'

// Closing slide. Title (h1) and subtitle (p) in the default slot.
// `contacts` is a label → value map, e.g. { Slides: 'example.com', Contact: '@handle' }.
// `qrcodes` puts large QR codes at the center of the slide, in place of the fingerprint and the stamp, with the
// title shrunk and centered above them: { label, url, img }, the image of the code from public/ (without `img`,
// a placeholder square).
const props = withDefaults(defineProps<{
  status?: string
  kicker?: string
  stamp?: string
  contacts?: Record<string, string>
  qrcodes?: { label: string, url?: string, img?: string }[]
}>(), {
  status: 'Statut : ouvert',
  kicker: 'En attente de témoignages',
  stamp: 'Non résolu',
  contacts: () => ({}),
  qrcodes: () => [],
})

// the QR codes open like windows when the slide is entered, only in the slideshow and the presenter
const { $renderContext } = useSlideContext()
const live = $renderContext.value === 'slide' || $renderContext.value === 'presenter'
</script>

<template>
  <div class="slidev-layout hud end" :data-qr="props.qrcodes.length ? '' : undefined">
    <HudFrame :status="status" no-part />
    <div v-if="props.qrcodes.length" class="qrcodes" :data-live="live ? '' : undefined">
      <figure v-for="(q, i) in props.qrcodes" :key="q.label" class="qrcode" :style="{ '--i': i }">
        <div class="code">
          <img v-if="q.img" :src="withBase(q.img)" :alt="q.label">
          <span v-else class="placeholder">QR</span>
        </div>
        <figcaption>
          <span class="label">{{ q.label }}</span>
          <span v-if="q.url">{{ q.url }}</span>
        </figcaption>
      </figure>
    </div>
    <template v-else>
      <Fingerprint class="print" />
      <Stamp v-if="stamp" class="stamp">{{ stamp }}</Stamp>
    </template>
    <HudCorners class="title">
      <Kicker v-if="kicker">{{ kicker }}</Kicker>
      <slot />
    </HudCorners>
    <div class="contacts">
      <div v-for="(v, k) in contacts" :key="k" class="contact">
        <span class="label">{{ k }}</span>
        <span>{{ v }}</span>
      </div>
    </div>
  </div>
</template>

<style>
.slidev-layout.hud.end {
  .print {
    position: absolute;
    left: 1180px;
    top: 180px;
  }

  .stamp {
    position: absolute;
    left: 1360px;
    top: 470px;
  }

  /* with QR codes: the title, smaller, centered at the top, the codes centered under it */
  &[data-qr] .title {
    left: 50%;
    top: 130px;
    width: auto;
    padding: 28px 56px;
    transform: translateX(-50%);
    text-align: center;
    white-space: nowrap;
  }

  &[data-qr] h1 {
    font-size: 96px;
    margin-bottom: 16px;
  }

  &[data-qr] h1:last-child {
    margin-bottom: 0;
  }

  /* QR codes alone: no empty title box, the codes centered vertically in the space under the status bar */
  &[data-qr] .title:not(:has(h1, p, .hud-kicker)) {
    display: none;
  }

  &[data-qr]:not(:has(.title :is(h1, p, .hud-kicker))) .qrcodes {
    top: 50%;
    transform: translateY(calc(-50% + var(--hud-statusbar) / 2));
  }

  .qrcodes {
    position: absolute;
    left: 0;
    right: 0;
    top: 450px;
    display: flex;
    justify-content: center;
    gap: 240px;
  }

  .qrcode {
    width: 520px;
    margin: 0;
  }

  .qrcode .code {
    aspect-ratio: 1;
    padding: 24px;
    background: var(--hud-surface);
    box-shadow: inset 0 0 0 3px var(--hud-ink);
  }

  /* the window opening of open-center (base.css), as animations: a hidden slide is display: none,
     and an animation plays again each time it shows. Starts once the slide transition is over */
  .qrcodes[data-live] .code {
    clip-path: inset(var(--open-y) var(--open-x));
    animation:
      qr-open-x 0.22s ease-in calc(0.4s + var(--i) * 0.15s) both,
      qr-open-y 0.3s ease-out calc(0.6s + var(--i) * 0.15s) both;
  }

  /* the label once its code is open */
  .qrcodes[data-live] figcaption {
    animation: qr-label 0.3s ease-out calc(0.9s + var(--i) * 0.15s) both;
  }

  .qrcode img {
    display: block;
    width: 100%;
    height: 100%;
  }

  .qrcode .placeholder {
    display: grid;
    place-items: center;
    height: 100%;
    background: repeating-linear-gradient(45deg, var(--hud-grid) 0 2px, transparent 2px 14px);
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 56px;
    letter-spacing: 0.1em;
    color: var(--hud-muted);
  }

  .qrcode figcaption {
    margin-top: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 40px;
  }

  .qrcode figcaption .label {
    font-size: 30px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
  }

  .title {
    position: absolute;
    left: 120px;
    top: 260px;
    width: 1060px;
  }

  h1 {
    font-size: 140px;
    line-height: 1;
    margin: 0 0 28px;
  }

  .title p {
    font-size: 34px;
    color: var(--hud-muted);
    margin: 0;
  }

  .contacts {
    position: absolute;
    left: 168px;
    top: 820px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .contact {
    display: flex;
    gap: 24px;
    font-family: var(--hud-font-mono);
    font-weight: 600;
    font-size: 28px;
  }

  .contact .label {
    width: 140px;
    font-size: 22px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--hud-muted);
    align-self: center;
  }
}

@keyframes qr-open-x {
  from { --open-x: 50%; }
  to { --open-x: 0%; }
}

@keyframes qr-open-y {
  from { --open-y: 49%; }
  to { --open-y: 0%; }
}

@keyframes qr-label {
  from { opacity: 0; }
}
</style>
