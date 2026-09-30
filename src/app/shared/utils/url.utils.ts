/**
 * Utilitários de URL focados em SEGURANÇA.
 * Tudo que vem da API é tratado como não confiável antes de virar link/iframe.
 */

/**
 * Devolve a URL só se for http/https válida; senão `null`.
 * - Bloqueia `javascript:` e outros esquemas perigosos em href/src.
 * - Remove espaços antes de validar: URL nunca contém espaço, e a API
 *   tem um caso real ("https: //site...") que quebraria o link.
 */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.replace(/\s+/g, ''));
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}

/** Formato aceito para o player: apenas embed oficial do YouTube. */
const YOUTUBE_EMBED = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[\w-]{6,20}$/;

/**
 * Devolve a URL do vídeo só se for um embed do YouTube; senão `null`.
 * Isso é o que torna seguro usar `bypassSecurityTrustResourceUrl` depois:
 * nenhum outro domínio chega ao <iframe>.
 */
export function safeYoutubeEmbedUrl(value: string | null | undefined): string | null {
  const url = value?.trim();
  return url && YOUTUBE_EMBED.test(url) ? url : null;
}

/** Miniatura oficial do YouTube a partir de um embed já validado; serve de capa quando falta imagem. */
export function youtubeThumbnailUrl(embedUrl: string | null): string | null {
  const id = embedUrl ? safeYoutubeEmbedUrl(embedUrl)?.split('/embed/')[1] : null;
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
