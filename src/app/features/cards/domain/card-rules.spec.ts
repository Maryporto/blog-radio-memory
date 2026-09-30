import { ApiCard, Card } from '../models/card.model';
import { filterCards, getCategories, isPinned, isPublished, normalizeCard, parseDate, sortCards } from './card-rules';

/** Cria um card cru com valores padrão; cada teste muda só o que importa. */
function apiCard(overrides: Partial<ApiCard> = {}): ApiCard {
  return {
    id: 1,
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    corpo: '<p>corpo</p>',
    urlPost: 'https://site.radiomemory.com.br/post',
    imgUrl: '',
    autor: 'autor@radiomemory.com.br',
    status: 1,
    data: '2025-01-01T12:00:00.000Z',
    categoria: 'blog',
    videoUrl: '',
    data_fixo: null,
    ...overrides,
  };
}
const card = (o: Partial<ApiCard> = {}): Card => normalizeCard(apiCard(o));

describe('Regras de negócio dos cards', () => {
  // Caso de teste 1 — Fixados
  describe('fixados', () => {
    const pinned = card({ data_fixo: '2026-01-07T00:00:00.000Z' });

    it('data_fixo no futuro → é fixado', () => {
      expect(isPinned(pinned, new Date('2026-01-06T12:00:00.000Z'))).toBe(true);
    });

    it('data_fixo igual a agora → ainda é fixado (>=)', () => {
      expect(isPinned(pinned, new Date('2026-01-07T00:00:00.000Z'))).toBe(true);
    });

    it('depois que "agora" ultrapassa data_fixo → deixa de ser fixado', () => {
      expect(isPinned(pinned, new Date('2026-01-07T00:00:00.001Z'))).toBe(false);
    });

    it('sem data_fixo ou data inválida ("0000-00-00") → nunca é fixado', () => {
      expect(isPinned(card({ data_fixo: null }), new Date())).toBe(false);
      expect(isPinned(card({ data_fixo: '0000-00-00' }), new Date())).toBe(false);
    });
  });

  // Caso de teste 2 — Ordenação
  describe('ordenação', () => {
    const now = new Date('2025-06-01T00:00:00.000Z');
    const antigo = card({ id: 1, data: '2024-01-01T00:00:00.000Z' });
    const recente = card({ id: 2, data: '2025-05-01T00:00:00.000Z' });
    const medio = card({ id: 3, data: '2024-12-01T00:00:00.000Z' });
    const fixoLongo = card({ id: 4, data: '2020-01-01T00:00:00.000Z', data_fixo: '2025-12-31T00:00:00.000Z' });
    const fixoCurto = card({ id: 5, data: '2020-01-01T00:00:00.000Z', data_fixo: '2025-07-01T00:00:00.000Z' });
    const fixoVencido = card({ id: 6, data: '2025-04-01T00:00:00.000Z', data_fixo: '2025-01-01T00:00:00.000Z' });

    it('não fixados saem por data desc', () => {
      expect(sortCards([antigo, recente, medio], now).map((c) => c.id)).toEqual([2, 3, 1]);
    });

    it('fixados primeiro (data_fixo desc), depois não fixados (data desc)', () => {
      const ids = sortCards([antigo, fixoCurto, recente, fixoVencido, fixoLongo, medio], now).map((c) => c.id);
      expect(ids).toEqual([4, 5, 2, 6, 3, 1]);
    });

    it('não altera o array original', () => {
      const lista = [antigo, recente];
      sortCards(lista, now);
      expect(lista.map((c) => c.id)).toEqual([1, 2]);
    });
  });

  // Caso de teste 3 — Filtro por categoria
  it('filtro "blog" → retorna apenas categoria = "blog"', () => {
    const lista = [card({ id: 1, categoria: 'blog' }), card({ id: 2, categoria: 'treinamento' }), card({ id: 3, categoria: 'blog' })];
    const result = filterCards(lista, { categoria: 'blog', busca: '' });
    expect(result.map((c) => c.id)).toEqual([1, 3]);
    expect(result.every((c) => c.categoria === 'blog')).toBe(true);
  });

  // Caso de teste 4 — Busca
  describe('busca', () => {
    const lista = [
      card({ id: 63, titulo: '24ª Jornada da JABRO', subtitulo: 'Evento' }),
      card({ id: 68, titulo: 'Conheça as soluções', subtitulo: 'Treinamento completo' }),
    ];

    it('"JABRO" → retorna o card cujo título contém JABRO', () => {
      expect(filterCards(lista, { categoria: null, busca: 'JABRO' }).map((c) => c.id)).toEqual([63]);
    });

    it('é case-insensitive e ignora acentos', () => {
      expect(filterCards(lista, { categoria: null, busca: 'jabro' }).map((c) => c.id)).toEqual([63]);
      expect(filterCards(lista, { categoria: null, busca: 'CONHECA' }).map((c) => c.id)).toEqual([68]);
    });

    it('também busca no subtítulo', () => {
      expect(filterCards(lista, { categoria: null, busca: 'treinamento' }).map((c) => c.id)).toEqual([68]);
    });
  });

  // Caso de teste 5 — Vídeo (a parte de regra: só embed do YouTube chega ao player)
  describe('vídeo', () => {
    it('videoUrl do YouTube embed é mantida', () => {
      expect(card({ videoUrl: 'https://www.youtube.com/embed/czSQFP1SJIQ' }).videoUrl).toBe(
        'https://www.youtube.com/embed/czSQFP1SJIQ',
      );
    });

    it('videoUrl vazia ou de outro domínio vira null (sem player)', () => {
      expect(card({ videoUrl: '' }).videoUrl).toBeNull();
      expect(card({ videoUrl: 'https://evil.example.com/embed/abc123' }).videoUrl).toBeNull();
    });
  });

  describe('normalização dos dados reais da API', () => {
    it('status 0 não é publicado', () => {
      expect(isPublished(card({ status: 0 }))).toBe(false);
      expect(isPublished(card({ status: 1 }))).toBe(true);
    });

    it('parseDate trata vazio e "0000-00-00" como null', () => {
      expect(parseDate('')).toBeNull();
      expect(parseDate('0000-00-00')).toBeNull();
      expect(parseDate('2025-02-03T16:56:40.000Z')?.toISOString()).toBe('2025-02-03T16:56:40.000Z');
    });

    it('imgUrl vazia vira null e título é aparado', () => {
      const c = card({ imgUrl: '', titulo: 'Visualizador com IA ' });
      expect(c.imgUrl).toBeNull();
      expect(c.titulo).toBe('Visualizador com IA');
    });

    it('categorias vêm dos dados, sem repetição e ordenadas', () => {
      const lista = [card({ categoria: 'treinamento' }), card({ categoria: 'blog' }), card({ categoria: 'blog' })];
      expect(getCategories(lista)).toEqual(['blog', 'treinamento']);
    });
  });
});
