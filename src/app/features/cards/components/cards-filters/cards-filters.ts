import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Barra de filtros. Não guarda estado próprio: recebe os valores atuais
 * (vindos da URL) e emite mudanças para a página decidir o que fazer.
 */
@Component({
  selector: 'app-cards-filters',
  template: `
    <div class="filters" role="search">
      <label class="field">
        <span class="field__label">Buscar</span>
        <input
          type="search"
          placeholder="Título ou subtítulo"
          [value]="busca()"
          [disabled]="disabled()"
          (input)="buscaChange.emit($any($event.target).value)"
        />
      </label>

      <label class="field">
        <span class="field__label">Categoria</span>
        <select [disabled]="disabled()" (change)="categoriaChange.emit($any($event.target).value || null)">
          <option value="" [selected]="!categoria()">Todas</option>
          @for (cat of categories(); track cat) {
            <option [value]="cat" [selected]="cat === categoria()">{{ cat }}</option>
          }
        </select>
      </label>
    </div>
  `,
  styles: `
    .filters { display: grid; grid-template-columns: 1fr minmax(160px, 220px); gap: 1rem; }
    @media (max-width: 560px) { .filters { grid-template-columns: 1fr; } }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field__label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); }
    input, select {
      font: inherit; padding: 0.6rem 0.75rem; border: 1px solid var(--border);
      border-radius: 8px; background: var(--surface); color: inherit; text-transform: none;
    }
    select { text-transform: capitalize; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsFilters {
  readonly categories = input<string[]>([]);
  readonly categoria = input<string | null>(null);
  readonly busca = input('');
  readonly disabled = input(false);

  readonly categoriaChange = output<string | null>();
  readonly buscaChange = output<string>();
}
