import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { PropagandaService } from './propaganda.service';
import { Propaganda } from '../../models/propaganda.model';

@Component({
  selector: 'app-propaganda',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './propaganda.component.html',
})
export class PropagandaComponent implements AfterViewInit {
  private propagandaService = inject(PropagandaService);
  ads = signal<Propaganda[]>([]);

  @ViewChild('swiperEl', { static: false }) swiperEl!: ElementRef;
  @ViewChild('prevBtn', { static: false }) prevBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('nextBtn', { static: false }) nextBtn!: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    this.propagandaService.getAds().subscribe((dados) => {
      this.ads.set(dados);

      queueMicrotask(() => {
        const swiper = this.swiperEl?.nativeElement;

        if (!swiper) return;

        Object.assign(swiper, {
          loop: true,
          autoplay: {
            delay: 6000,
            disableOnInteraction: true,
          },
          navigation: {
            prevEl: this.prevBtn.nativeElement,
            nextEl: this.nextBtn.nativeElement,
          },
        });

        swiper.initialize();
      });
    });
  }
}
