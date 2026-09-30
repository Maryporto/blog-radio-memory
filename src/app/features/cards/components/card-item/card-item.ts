import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { youtubeThumbnailUrl } from '../../../../shared/utils/url.utils';
import { Card } from '../../models/card.model';

/**
 * Card da listagem — componente "burro": só recebe dados e exibe.
 * Sem chamadas à API nem regra de negócio aqui.
 */
@Component({
  selector: 'app-card-item',
  imports: [DatePipe, RouterLink],
  templateUrl: './card-item.html',
  styleUrl: './card-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardItem {
  readonly card = input.required<Card>();
  readonly pinned = input(false);

  /** Capa: imagem do card; sem ela, a miniatura do vídeo (se houver). */
  protected readonly cover = computed(() => this.card().imgUrl ?? youtubeThumbnailUrl(this.card().videoUrl));
}
