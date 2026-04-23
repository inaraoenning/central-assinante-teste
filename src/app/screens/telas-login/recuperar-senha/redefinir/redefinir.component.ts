import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

/**
 * Componente mantido apenas para compatibilidade de rota.
 * O novo fluxo da API não tem etapa 2 separada (o backend faz tudo em uma chamada).
 * Redireciona automaticamente para /forgot-password caso acesse diretamente.
 */
@Component({
  selector: 'app-redefinir',
  standalone: true,
  template: `<div class="min-h-screen bg-base-200 flex items-center justify-center">
    <span class="loading loading-spinner loading-lg text-primary"></span>
  </div>`,
})
export class RedefinirComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // Rota obsoleta com a nova API — redireciona de volta ao início
    this.router.navigate(['/forgot-password']);
  }
}
