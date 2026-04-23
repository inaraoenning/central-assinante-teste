import { Injectable, signal } from '@angular/core';

export interface ToastNotification {
  message: string;
  status: 0 | 1; // 0 = error, 1 = success
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Sugiro renomear de NotificationService para ToastService

  // Criamos o Signal que guarda o estado do Toast atual
  // Usamos um Signal público diretamente, pois é um estado simples e efêmero
  toast = signal<ToastNotification | null>(null);

  showSuccess(message: string): void {
    this.toast.set({ message, status: 1 });
    this.clearAfterDelay();
  }

  showError(message: string): void {
    this.toast.set({ message, status: 0 });
    this.clearAfterDelay();
  }

  clear(): void {
    this.toast.set(null);
  }

  private clearAfterDelay(): void {
    setTimeout(() => this.clear(), 3000);
  }
}
