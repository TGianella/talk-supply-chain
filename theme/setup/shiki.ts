import { defineShikiSetup } from '@slidev/types'

// Restrained syntax colors: ink for most tokens, so the accent stays
// available for annotations and highlights.
const dossier = {
  name: 'dossier-light',
  type: 'light' as const,
  colors: {
    'editor.background': '#f3f6f9', // --hud-code
    'editor.foreground': '#0b2545',
  },
  tokenColors: [
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: '#6b7c96', fontStyle: 'italic' } },
    { scope: ['string', 'string.template', 'punctuation.definition.string'], settings: { foreground: '#1d6fa3' } },
    { scope: ['constant.numeric', 'constant.language', 'support.constant'], settings: { foreground: '#7a4fb0' } },
    { scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'keyword.operator.new'], settings: { foreground: '#0b2545', fontStyle: 'bold' } },
    { scope: ['entity.name.function', 'support.function', 'meta.function-call'], settings: { foreground: '#0b2545' } },
    { scope: ['variable', 'variable.other', 'meta.object-literal.key', 'support.type.property-name'], settings: { foreground: '#0b2545' } },
    { scope: ['entity.name.tag', 'entity.name.type', 'support.class'], settings: { foreground: '#2a5c94' } },
    { scope: ['punctuation', 'meta.brace', 'keyword.operator'], settings: { foreground: '#4f6382' } },
  ],
}

export default defineShikiSetup(() => ({
  themes: {
    light: dossier,
    dark: dossier,
  },
}))
