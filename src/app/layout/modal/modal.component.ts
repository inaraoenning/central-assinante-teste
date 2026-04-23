import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalConfig } from '../../core/services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnInit, OnDestroy {
  isOpen = false;
  config: ModalConfig | null = null;
  private sub!: Subscription;

  get sizeClass(): string {
    if (this.config?.size === 'lg') return 'max-w-2xl';
    if (this.config?.size === 'sm') return 'max-w-sm';
    return 'max-w-lg';
  }

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.sub = this.modalService.modal$.subscribe((config) => {
      this.isOpen = config !== null;
      this.config = config;
    });
  }

  close(): void {
    this.modalService.close();
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).tagName === 'DIALOG') {
      this.close();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
