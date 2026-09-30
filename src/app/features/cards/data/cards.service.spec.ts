import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CardsLoadError, CardsService } from './cards.service';

describe('CardsService', () => {
  let service: CardsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(CardsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('faz POST com a ação correta e filtra status = 1', () => {
    let ids: number[] = [];
    service.getCards().subscribe((cards) => (ids = cards.map((c) => c.id)));

    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ acao: 'getTodosCards' });
    req.flush([
      { id: 1, status: 1, titulo: 'a', subtitulo: '', corpo: '', urlPost: '', imgUrl: '', autor: '', data: '2025-01-01T00:00:00Z', categoria: 'blog', videoUrl: '', data_fixo: null },
      { id: 2, status: 0, titulo: 'b', subtitulo: '', corpo: '', urlPost: '', imgUrl: '', autor: '', data: '2025-01-01T00:00:00Z', categoria: 'blog', videoUrl: '', data_fixo: '0000-00-00' },
    ]);

    expect(ids).toEqual([1]);
  });

  it('trata erro com HTTP 200 (resposta que não é array) como falha, sem vazar detalhes', () => {
    let error: unknown;
    service.getCards().subscribe({ error: (e) => (error = e) });

    httpMock.expectOne(environment.apiUrl).flush({ errorType: 'TypeError', trace: ['stack interno'] });

    expect(error).toBeInstanceOf(CardsLoadError);
    expect((error as Error).message).not.toContain('stack');
  });

  it('reaproveita a mesma chamada (cache) entre lista e detalhe', () => {
    service.getCards().subscribe();
    service.getCardById(1).subscribe();
    httpMock.expectOne(environment.apiUrl).flush([]);
  });
});
