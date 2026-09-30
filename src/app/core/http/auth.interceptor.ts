import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Anexa o token SÓ nas requisições para a API de cards.
 * Por quê: se o interceptor colocasse o header em toda requisição,
 * qualquer chamada a outro domínio receberia o nosso token.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiUrl)) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${environment.apiToken}` } }));
};
