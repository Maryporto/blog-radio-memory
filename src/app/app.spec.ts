import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('cria o app com o cabeçalho', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.brand img')?.getAttribute('alt')).toBe('Radio Memory');
  });

  it('alterna entre modo claro e noturno', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = document.documentElement;
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.theme-toggle')!;

    button.click();
    const first = root.dataset['theme'];
    button.click();

    expect(['light', 'dark']).toContain(first);
    expect(root.dataset['theme']).not.toBe(first);
  });
});
