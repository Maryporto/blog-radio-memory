import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'rm-theme';

/**
 * Tema claro/escuro.
 * - Sem escolha salva, segue o sistema operacional (prefers-color-scheme).
 * - A escolha fica no localStorage e é aplicada via atributo data-theme no <html>;
 *   o script inline do index.html reaplica antes do Angular subir (sem "piscar").
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly root = inject(DOCUMENT).documentElement;
  readonly theme = signal<Theme>(this.initial());

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.root.dataset['theme'] = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // modo privado/armazenamento bloqueado: o tema vale só para esta sessão
    }
  }

  private initial(): Theme {
    const saved = this.root.dataset['theme'];
    if (saved === 'light' || saved === 'dark') return saved;
    return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
