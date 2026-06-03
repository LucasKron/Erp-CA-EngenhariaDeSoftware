import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
  show: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private seq = 0;

  show(message: string, type: ToastType = 'success'): void {
    const id = ++this.seq;
    this.toasts.update((list) => [...list, { id, message, type, show: false }]);

    // Próximo frame: ativa a animação de entrada.
    requestAnimationFrame(() =>
      this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, show: true } : t))),
    );

    // Sai depois de 3.2s e é removido após a transição.
    setTimeout(() => {
      this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, show: false } : t)));
      setTimeout(() => this.toasts.update((list) => list.filter((t) => t.id !== id)), 350);
    }, 3200);
  }
}
