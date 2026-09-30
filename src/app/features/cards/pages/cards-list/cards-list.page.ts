import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { BehaviorSubject, interval, map, switchMap } from 'rxjs';
import { NOW } from '../../../../core/time/now.token';
import { toLoadState } from '../../../../shared/utils/load-state';
import { CardItem } from '../../components/card-item/card-item';
import { CardSkeleton } from '../../components/card-skeleton/card-skeleton';
import { CardsFilters } from '../../components/cards-filters/cards-filters';
import { CardsService } from '../../data/cards.service';
import { filterCards, getCategories, isPinned, sortCards } from '../../domain/card-rules';
import { Card, CardFilters } from '../../models/card.model';

/** Quantos cards não fixados aparecem por vez ("carregar mais"). */
const PAGE_SIZE = 6;

/**
 * Página de listagem. Orquestra dados + filtros; as regras ficam em card-rules.ts.
 * Estado derivado com computed(): nada é recalculado à mão.
 */
@Component({
  selector: 'app-cards-list-page',
  imports: [CardItem, CardSkeleton, CardsFilters],
  templateUrl: './cards-list.page.html',
  styleUrl: './cards-list.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsListPage {
  private readonly cardsService = inject(CardsService);
  private readonly router = inject(Router);
  private readonly clock = inject(NOW);

  /** Bônus: filtros vêm da querystring (?categoria=blog&busca=jabro) via withComponentInputBinding. */
  readonly categoria = input<string>();
  readonly busca = input<string>();

  protected readonly skeletons = PAGE_SIZE;

  /** Emitir aqui dispara uma nova carga (botão "Tentar novamente"). */
  private readonly reload$ = new BehaviorSubject<void>(undefined);

  protected readonly state = toSignal(
    this.reload$.pipe(switchMap(() => toLoadState(this.cardsService.getCards()))),
    { initialValue: { status: 'loading' } as const },
  );

  /** "Agora" reavaliado a cada minuto: um card deixa de ser fixado sem precisar recarregar. */
  private readonly now = toSignal(interval(60_000).pipe(map(() => this.clock())), {
    initialValue: this.clock(),
  });

  protected readonly filters = computed<CardFilters>(() => ({
    categoria: this.categoria() || null,
    busca: this.busca() ?? '',
  }));

  private readonly allCards = computed<Card[]>(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : [];
  });

  protected readonly categories = computed(() => getCategories(this.allCards()));

  /** Filtra e ordena (a ordenação é definida uma única vez em sortCards). */
  private readonly visible = computed(() =>
    sortCards(filterCards(this.allCards(), this.filters()), this.now()),
  );

  protected readonly pinned = computed(() => this.visible().filter((c) => isPinned(c, this.now())));
  private readonly others = computed(() => this.visible().filter((c) => !isPinned(c, this.now())));

  /** Volta a PAGE_SIZE sempre que os filtros mudam. */
  private readonly limit = linkedSignal({ source: this.filters, computation: () => PAGE_SIZE });

  protected readonly shownOthers = computed(() => this.others().slice(0, this.limit()));
  protected readonly hasMore = computed(() => this.others().length > this.limit());
  protected readonly isEmpty = computed(() => this.visible().length === 0);

  protected loadMore(): void {
    this.limit.update((n) => n + PAGE_SIZE);
  }

  protected retry(): void {
    this.reload$.next();
  }

  /** Grava o filtro na URL; o input acima recebe o novo valor e tudo recalcula. */
  protected updateFilter(change: Partial<CardFilters>): void {
    const queryParams: Record<string, string | null> = {};
    if ('categoria' in change) queryParams['categoria'] = change.categoria || null;
    if ('busca' in change) queryParams['busca'] = change.busca?.trim() ? change.busca : null;
    void this.router.navigate([], { queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected clearFilters(): void {
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
