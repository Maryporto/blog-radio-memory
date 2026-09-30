import { InjectionToken } from '@angular/core';

/**
 * Fonte do "agora" usada pela regra de fixados.
 * Em produção é o relógio do navegador; em testes/demonstração dá para
 * trocar por uma data fixa: { provide: NOW, useValue: () => new Date('2025-01-01') }.
 */
export const NOW = new InjectionToken<() => Date>('NOW', {
  providedIn: 'root',
  factory: () => () => new Date(),
});
