import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-base-200">
      <div class="text-center">
        <div class="text-9xl font-black text-primary opacity-20">404</div>
        <h1 class="text-4xl font-bold mt-4">Página não encontrada</h1>
        <p class="text-base-content/60 mt-3 max-w-sm mx-auto">
          Oops! A página que você está procurando não existe ou foi movida.
        </p>
        <a routerLink="/app/dashboard" class="btn btn-primary mt-6">Voltar ao Dashboard</a>
      </div>
    </div>
  `,
})
export class NotFoundComponent {}
