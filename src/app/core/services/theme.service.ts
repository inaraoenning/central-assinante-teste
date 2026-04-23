import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private themeSubject = new BehaviorSubject<string>(this.getSavedTheme());
  theme$ = this.themeSubject.asObservable();

  // Guardar cor da API
  private corEmpresa: string | null = null;

  private getSavedTheme(): string {
    return localStorage.getItem(this.THEME_KEY) || 'light';
  }

  setTheme(theme: string): void {
    localStorage.setItem(this.THEME_KEY, theme);
    document.documentElement.setAttribute('data-theme', theme);
    this.themeSubject.next(theme);

    if (this.corEmpresa) {
      this.applyCorEmpresa(this.corEmpresa);
      console.log(this.corEmpresa);
    }
  }

  // Método para ser chamado quando API responder
  applyCorEmpresa(cor: string): void {
    if (!cor) return; // Evita quebrar se um provedor não tiver cor
    this.corEmpresa = cor; // Guarda a cor em caso de troca de tema pelo usuário

    const oklchSyntax = this.hexToOklchString(cor);
    const root = document.documentElement;

    // No DaisyUI v4+, a cor não pode ser HEX. Deve ser repassada como os três parâmetros espaçados do formato OKLCH

    // 1. Aplicando para as classes PRIMARY (bg-primary, text-primary, etc)
    root.style.setProperty('--p', oklchSyntax);
    root.style.setProperty('--pf', oklchSyntax);

    // 2. Aplicando para as classes SECONDARY (bg-secondary, text-secondary, etc)
    root.style.setProperty('--s', oklchSyntax);
    root.style.setProperty('--sf', oklchSyntax);

    // 3. Garantir que o texto sobre essas cores (primária/secundária) seja legível (branco ou preto)
    const contrastColor = this.corClara(cor) ? '0 0 0' : '1 0 0';
    root.style.setProperty('--pc', contrastColor); // Conteúdo sobre o Primary
    root.style.setProperty('--sc', contrastColor); // Conteúdo sobre o Secondary
  }

  // Método disparado ao sair de um provedor para limpar o CSS sujo e voltar às cores originais do Tailwind
  resetCorEmpresa(): void {
    this.corEmpresa = null;
    const root = document.documentElement;
    root.style.removeProperty('--p');
    root.style.removeProperty('--pf');
    root.style.removeProperty('--pc');
    root.style.removeProperty('--s');
    root.style.removeProperty('--sf');
    root.style.removeProperty('--sc');
  }

  private corClara(cor: string): boolean {
    const r = parseInt(cor.substring(1, 3), 16);
    const g = parseInt(cor.substring(3, 5), 16);
    const b = parseInt(cor.substring(5, 7), 16);
    const brilho = (r * 299 + g * 587 + b * 114) / 1000;
    return brilho > 155;
  }

  // Motor conversor Hex -> RGB -> OKLab -> OKLCH
  // Permite personalizar os temas dinamicamente no DaisyUI v4 sem dependências externas
  private hexToOklchString(hex: string): string {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3)
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');

    let r = parseInt(hex.substring(0, 2), 16) / 255;
    let g = parseInt(hex.substring(2, 4), 16) / 255;
    let b = parseInt(hex.substring(4, 6), 16) / 255;

    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    const C = Math.sqrt(a * a + b_ * b_);
    let h = Math.atan2(b_, a) * (180 / Math.PI);
    if (h < 0) h += 360;

    return `${L.toFixed(4)} ${C.toFixed(4)} ${h.toFixed(2)}`;
  }

  initTheme(): void {
    const theme = this.getSavedTheme();
    document.documentElement.setAttribute('data-theme', theme);
  }

  get currentTheme(): string {
    return this.themeSubject.value;
  }

  readonly themes = ['light', 'dark'];
}
