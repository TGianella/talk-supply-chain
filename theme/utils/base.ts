// Paths to public/ (/photos/x.jpg) prefixed with the base the deck is served under
// (/talk-supply-chain/ on GitHub Pages, / in dev). Other URLs are returned as is.
export function withBase(url?: string) {
  if (!url || !url.startsWith('/') || url.startsWith('//'))
    return url
  return import.meta.env.BASE_URL + url.slice(1)
}
