import { safeHttpUrl, safeYoutubeEmbedUrl, youtubeThumbnailUrl } from './url.utils';

describe('Segurança de URLs', () => {
  describe('safeHttpUrl', () => {
    it('aceita http/https válidas', () => {
      expect(safeHttpUrl('https://site.radiomemory.com.br/post/')).toBe('https://site.radiomemory.com.br/post/');
    });

    it('corrige o caso real da API com espaço ("https: //site...")', () => {
      expect(safeHttpUrl('https: //site.radiomemory.com.br/case/')).toBe('https://site.radiomemory.com.br/case/');
    });

    it('bloqueia javascript:, data: e valores vazios', () => {
      expect(safeHttpUrl('javascript:alert(1)')).toBeNull();
      expect(safeHttpUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
      expect(safeHttpUrl('')).toBeNull();
      expect(safeHttpUrl(null)).toBeNull();
    });
  });

  describe('safeYoutubeEmbedUrl', () => {
    it('aceita apenas embed do YouTube', () => {
      expect(safeYoutubeEmbedUrl('https://www.youtube.com/embed/F5OBbMKQ5-g')).not.toBeNull();
      expect(safeYoutubeEmbedUrl('https://www.youtube-nocookie.com/embed/F5OBbMKQ5-g')).not.toBeNull();
    });

    it('rejeita outros domínios, http e truques de URL', () => {
      expect(safeYoutubeEmbedUrl('http://www.youtube.com/embed/F5OBbMKQ5-g')).toBeNull();
      expect(safeYoutubeEmbedUrl('https://www.youtube.com.evil.com/embed/F5OBbMKQ5-g')).toBeNull();
      expect(safeYoutubeEmbedUrl('https://www.youtube.com/watch?v=F5OBbMKQ5-g')).toBeNull();
      expect(safeYoutubeEmbedUrl('javascript:alert(1)')).toBeNull();
    });
  });

  describe('youtubeThumbnailUrl', () => {
    it('monta a miniatura a partir do embed', () => {
      expect(youtubeThumbnailUrl('https://www.youtube.com/embed/F5OBbMKQ5-g')).toBe(
        'https://i.ytimg.com/vi/F5OBbMKQ5-g/hqdefault.jpg',
      );
    });

    it('devolve null sem vídeo ou com URL inválida', () => {
      expect(youtubeThumbnailUrl(null)).toBeNull();
      expect(youtubeThumbnailUrl('https://evil.com/embed/F5OBbMKQ5-g')).toBeNull();
    });
  });
});
