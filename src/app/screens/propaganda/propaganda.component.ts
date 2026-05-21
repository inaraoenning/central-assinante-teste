import { Component, effect, viewChild, inject, signal, AfterViewInit } from '@angular/core';
import { PropagandaService } from './propaganda.service';
import { Propaganda } from '../../models/propaganda.model';
import { EmblaCarouselDirective } from 'embla-carousel-angular';
import type { EmblaCarouselType } from 'embla-carousel';

@Component({
  selector: 'app-propaganda',
  standalone: true,
  imports: [EmblaCarouselDirective],
  templateUrl: './propaganda.component.html',
  styleUrl: './propaganda.component.scss',
})
export class PropagandaComponent implements AfterViewInit {
  private propagandaService = inject(PropagandaService);
  private emblaRef = viewChild<EmblaCarouselDirective>(EmblaCarouselDirective);

  private emblaApi?: EmblaCarouselType;
  readonly options = { loop: true };

  ads = signal<Propaganda[]>([]);

  constructor() {
    effect(() => {
      this.emblaApi = this.emblaRef()?.emblaApi;
    });
  }

  ngAfterViewInit(): void {
    this.propagandaService.getAds().subscribe((dados) => {
      this.ads.set(dados);
    });
  }
}
