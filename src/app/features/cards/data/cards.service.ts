import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, shareReplay, throwError, timeout } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { isPublished, normalizeCard } from '../domain/card-rules';
import { ApiCard, Card } from '../models/card.model';

/** Tempo máximo de espera. Sem isso, uma chamada errada fica ~29s pendurada (504). */
const REQUEST_TIMEOUT_MS = 10_000;

/** Erro "limpo" exibido na tela — nunca expõe o corpo/stack da API. */
export class CardsLoadError extends Error {
  constructor() {
    super('Não foi possível carregar as publicações.');
  }
}

/**
 * Único ponto de acesso à API de cards.
 * - Faz UMA chamada e guarda em cache (shareReplay): lista e detalhe reaproveitam.
 * - Valida o contrato: a API devolve erro com HTTP 200, então conferimos se é array.
 * - Normaliza e filtra status = 1 logo na entrada.
 */
@Injectable({ providedIn: 'root' })
export class CardsService {
  private readonly http = inject(HttpClient);
  private cache$?: Observable<Card[]>;

  getCards(): Observable<Card[]> {
    this.cache$ ??= this.http
      .post<unknown>(
        environment.apiUrl,
        { acao: 'getTodosCards' },
        { headers: new HttpHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }) },
      )
      .pipe(
        timeout(REQUEST_TIMEOUT_MS),
        map((resp) => {
          if (!Array.isArray(resp)) throw new CardsLoadError();
          return (resp as ApiCard[]).map(normalizeCard).filter(isPublished);
        }),
        catchError(() => {
          this.cache$ = undefined; // permite "tentar novamente" sem ficar preso no erro
          return throwError(() => new CardsLoadError());
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    return this.cache$;
  }

  /** Detalhe: reaproveita o cache da listagem (a API não tem endpoint por id). */
  getCardById(id: number): Observable<Card | undefined> {
    return this.getCards().pipe(map((cards) => cards.find((c) => c.id === id)));
  }
}
