import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-blank',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="pb-10">
      <h2 class="text-2xl font-bold mb-6">Blank Page</h2>
      <div class="card bg-base-100 shadow">
        <div class="card-body items-center text-center py-20">
          <div class="text-6xl mb-4">📄</div>
          <h3 class="text-xl font-semibold">Empty Canvas</h3>
          <p class="text-base-content/60 max-w-sm mt-2">
            This is a blank page template. Start building your feature here.
          </p>
          <a routerLink="/app/dashboard" class="btn btn-primary mt-4">Back to Dashboard</a>
        </div>
      </div>
    </div>
  `
})
export class BlankComponent {}
