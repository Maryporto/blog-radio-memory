import { Observable, catchError, map, of, startWith } from 'rxjs';

/** Estado de carregamento explícito: a tela sempre sabe o que mostrar. */
export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: T };

/** Converte um Observable de dados em um fluxo de LoadState (loading → success | error). */
export function toLoadState<T>(source$: Observable<T>): Observable<LoadState<T>> {
  return source$.pipe(
    map((data): LoadState<T> => ({ status: 'success', data })),
    startWith<LoadState<T>>({ status: 'loading' }),
    catchError((err: unknown) =>
      of<LoadState<T>>({
        status: 'error',
        message: err instanceof Error ? err.message : 'Erro inesperado.',
      }),
    ),
  );
}
