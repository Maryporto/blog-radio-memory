import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';
import { toLoadState } from '../../../../shared/utils/load-state';
import { CardsService } from '../../data/cards.service';
import { Card } from '../../models/card.model';

/**
 * Detalhe do card (rota /post/:id).
 * Rota em vez de modal: o link é compartilhável e o botão "voltar" do navegador funciona.
 */
@Component({
  selector: 'app-post-detail-page',
  imports: [DatePipe, RouterLink],
  templateUrl: './post-detail.page.html',
  styleUrl: './post-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostDetailPage {
  private readonly cardsService = inject(CardsService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Parâmetro :id da rota (withComponentInputBinding). */
  readonly id = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.id).pipe(switchMap((id) => toLoadState(this.cardsService.getCardById(Number(id))))),
    { initialValue: { status: 'loading' } as const },
  );

  protected readonly card = computed<Card | undefined>(() => {
    const s = this.state();
    return s.status === 'success' ? s.data : undefined;
  });

  /**
   * SEGURANÇA: o Angular bloqueia URLs dinâmicas em <iframe src>.
   * Só liberamos (bypass) porque videoUrl já passou por safeYoutubeEmbedUrl
   * na normalização — apenas https://www.youtube.com/embed/<id> chega aqui.
   */
  protected readonly videoSrc = computed<SafeResourceUrl | null>(() => {
    const url = this.card()?.videoUrl;
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });
}
