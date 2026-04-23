import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface RightDrawerConfig {
  header: string;
  bodyType: string;
  extraObject?: any;
}

@Injectable({ providedIn: 'root' })
export class RightDrawerService {
  private drawerSubject = new BehaviorSubject<{ isOpen: boolean; config: RightDrawerConfig | null }>({
    isOpen: false,
    config: null
  });
  drawer$ = this.drawerSubject.asObservable();

  open(config: RightDrawerConfig): void {
    this.drawerSubject.next({ isOpen: true, config });
  }

  close(): void {
    this.drawerSubject.next({ isOpen: false, config: null });
  }
}
