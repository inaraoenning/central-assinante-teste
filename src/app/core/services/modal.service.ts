import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalConfig {
  title: string;
  bodyType: string;
  extraObject?: any;
  size?: string;
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalConfig | null>(null);
  modal$ = this.modalSubject.asObservable();

  open(config: ModalConfig): void {
    this.modalSubject.next(config);
  }

  close(): void {
    this.modalSubject.next(null);
  }
}
