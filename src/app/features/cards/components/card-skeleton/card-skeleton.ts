import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Placeholder animado (shimmer) no formato do card.
 * Requisito de UX: o usuário vê a "forma" da página enquanto a API responde.
 */
@Component({
  selector: 'app-card-skeleton',
  template: `
    @for (i of items(); track i) {
      <div class="skeleton" aria-hidden="true">
        <div class="shimmer skeleton__media"></div>
        <div class="skeleton__body">
          <div class="shimmer skeleton__line skeleton__line--short"></div>
          <div class="shimmer skeleton__line"></div>
          <div class="shimmer skeleton__line"></div>
          <div class="shimmer skeleton__line skeleton__line--mid"></div>
        </div>
      </div>
    }
  `,
  styles: `
    :host { display: contents; }
    .skeleton { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--surface); }
    .skeleton__media { aspect-ratio: 16 / 9; }
    .skeleton__body { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; }
    .skeleton__line { height: 0.8rem; border-radius: 4px; }
    .skeleton__line--short { width: 30%; }
    .skeleton__line--mid { width: 60%; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardSkeleton {
  readonly count = input(6);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
