import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('anexa o Bearer nas chamadas para a API', () => {
    http.post(environment.apiUrl, {}).subscribe();
    const req = httpMock.expectOne(environment.apiUrl);
    expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.apiToken}`);
    req.flush([]);
  });

  it('NÃO envia o token para outros domínios', () => {
    http.get('https://s3-cards.s3.amazonaws.com/imagem.png').subscribe();
    const req = httpMock.expectOne('https://s3-cards.s3.amazonaws.com/imagem.png');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush('');
  });
});
