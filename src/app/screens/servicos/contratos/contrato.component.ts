import { Component, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContratoService } from '../contrato.service';

@Component({
  selector: 'app-contrato',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contrato.component.html',
})
@Injectable({ providedIn: 'root' })
export class ContratoComponent {
  // Apenas consume o signal — o ServicosComponent já chamou buscarContratos()
  public contratoService = inject(ContratoService);
}
