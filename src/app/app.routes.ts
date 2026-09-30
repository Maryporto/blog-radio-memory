import { Routes } from '@angular/router';

/**
 * Rotas com lazy loading (loadComponent): cada página vira um arquivo JS
 * separado e só é baixada quando o usuário navega até ela.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Notícias | Radio Memory',
    loadComponent: () =>
      import('./features/cards/pages/cards-list/cards-list.page').then((m) => m.CardsListPage),
  },
  {
    path: 'post/:id',
    title: 'Publicação | Radio Memory',
    loadComponent: () =>
      import('./features/cards/pages/post-detail/post-detail.page').then((m) => m.PostDetailPage),
  },
  { path: '**', redirectTo: '' },
];
