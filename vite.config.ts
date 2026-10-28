import { defineConfig } from 'vite'

export default defineConfig({
  slidev: {
    vue: {
      template: {
        // turns src="/photos/x.jpg" in templates into imports, so that public/ files get the deploy base
        transformAssetUrls: { includeAbsolute: true },
      },
    },
  },
})
