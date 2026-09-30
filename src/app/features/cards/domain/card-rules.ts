/**
 * REGRAS DE NEGÓCIO dos cards — funções puras, sem Angular.
 * "Pura" = mesma entrada, mesma saída. O "agora" entra como parâmetro,
 * o que permite testar fixado/desfixado sem depender do relógio real.
 */
import { safeHttpUrl, safeYoutubeEmbedUrl } from '../../../shared/utils/url.utils';
import { ApiCard, Card, CardFilters } from '../models/card.model';

/** Converte string ISO em Date; datas vazias/inválidas ("0000-00-00") viram null. */
export function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) || date.getFullYear() < 1900 ? null : date;
}

/** Transforma o card cru da API no modelo do app (fronteira de confiança). */
export function normalizeCard(raw: ApiCard): Card {
  return {
    id: raw.id,
    titulo: (raw.titulo ?? '').trim(),
    subtitulo: (raw.subtitulo ?? '').trim(),
    corpo: raw.corpo ?? '',
    urlPost: safeHttpUrl(raw.urlPost),
    imgUrl: safeHttpUrl(raw.imgUrl),
    autor: (raw.autor ?? '').trim(),
    status: raw.status,
    data: parseDate(raw.data),
    categoria: (raw.categoria ?? '').trim().toLowerCase(),
    videoUrl: safeYoutubeEmbedUrl(raw.videoUrl),
    dataFixo: parseDate(raw.data_fixo),
  };
}

/** Requisito: renderizar apenas status = 1. */
export function isPublished(card: Card): boolean {
  return card.status === 1;
}

/**
 * Fixado = data_fixo existe e é >= agora.
 * A comparação é por instante (getTime), então o fuso do navegador é
 * respeitado automaticamente: o `now` é o relógio local do usuário.
 */
export function isPinned(card: Card, now: Date): boolean {
  return card.dataFixo !== null && card.dataFixo.getTime() >= now.getTime();
}

const time = (d: Date | null) => d?.getTime() ?? 0;

/**
 * ORDENAÇÃO — definida uma única vez, como pede o teste:
 * 1) fixados por data_fixo desc; 2) não fixados por data desc.
 * Não altera o array original (retorna um novo).
 */
export function sortCards(cards: readonly Card[], now: Date): Card[] {
  return [...cards].sort((a, b) => {
    const pa = isPinned(a, now);
    const pb = isPinned(b, now);
    if (pa !== pb) return pa ? -1 : 1;
    return pa ? time(b.dataFixo) - time(a.dataFixo) : time(b.data) - time(a.data);
  });
}

/** Minúsculas + sem acento: "Conheça" casa com "conheca" e "CONHEÇA". */
function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Busca case-insensitive em título e subtítulo. */
export function matchesSearch(card: Card, term: string): boolean {
  const q = normalizeText(term.trim());
  if (!q) return true;
  return normalizeText(card.titulo).includes(q) || normalizeText(card.subtitulo).includes(q);
}

/** Aplica categoria + busca. */
export function filterCards(cards: readonly Card[], filters: CardFilters): Card[] {
  return cards.filter(
    (c) => (!filters.categoria || c.categoria === filters.categoria) && matchesSearch(c, filters.busca),
  );
}

/** Bônus: categorias montadas a partir dos dados (sem lista fixa no código). */
export function getCategories(cards: readonly Card[]): string[] {
  return [...new Set(cards.map((c) => c.categoria).filter(Boolean))].sort();
}
