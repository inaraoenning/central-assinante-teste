import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-aplicativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aplicativo.component.html',
})
export class AplicativoComponent {
  aplicativo = [
    {
      emoji:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      title: 'Visualizar e pagar faturas',
    },
    {
      emoji:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      title: 'Imprimir recibo e nota fiscal',
    },
    {
      emoji:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      title: 'Visualizar contratos',
    },
    {
      emoji:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      title: 'Desbloqueio temporário',
    },
    {
      emoji:
        'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
      title: ' Alterar senha',
    },
  ];
}
