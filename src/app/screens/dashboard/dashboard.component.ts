import { signal, Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { RouterLink } from '@angular/router';
import { ClienteService } from '../meus-dados/cliente.service';
import { Cliente } from '../../models/cliente.model';
import { ModalDesbloqueioComponent } from '../components/modal-desbloqueio/modal-desbloqueio.component';
import { AuthService } from '../../core/auth/auth.service';
import { PropagandaComponent } from '../propaganda/propaganda.component';
import { ContratoService } from '../servicos/contrato.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    //  BaseChartDirective,
    RouterLink,
    PropagandaComponent,
    ModalDesbloqueioComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);
  public contratoService = inject(ContratoService);

  cliente = signal<Cliente | undefined>(undefined);
  isLoading = computed(() => this.contratoService.isLoading());

  constructor(
    //Aciona a busca na API quando o componente é criado
    //private notificacaoService: NotificacaoService,
    private clientService: ClienteService,
  ) {}

  async ngOnInit() {
    // Buscar os dados assim que abrir a tela
    this.clientService.buscarDadosCliente().subscribe((dados) => {
      this.cliente.set(dados);
    });

    this.contratoService.buscarContratos().subscribe();
  }

  colors = ['primary', 'secondary', 'accent', 'warning'];

  sections = [
    {
      value: 'Meus Dados',
      description: 'Minhas informações',
      path: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
      link: '/app/meus-dados',
    },
    {
      value: 'Financeiro',
      description: 'Faturas, pagamentos',
      path: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
      link: '/app/financeiro',
    },
    {
      value: 'Meus Serviços',
      description: 'Serviços contratados',
      path: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      link: '/app/app-servicos',
    },
    {
      value: 'Meus Protocolos',
      description: 'Serviços contratados',
      path: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
      link: '/app/protocolos',
    },
    {
      value: 'Baixar Aplicativo',
      description: 'Acompanhe suas faturas',
      path: 'M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
      link: '/app/aplicativo',
    },
    {
      value: 'Testar Conexão',
      description: '',
      path: 'M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z',
      link: '/app/suporte',
    },

    {
      value: 'Suporte',
      description: '',
      path: 'M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z',
      link: '/app/suporte',
    },
  ];

  // Bar Chart
  barChartData: ChartData<'bar'> = {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Maio', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Consumo',
        data: [18000, 22000, 19000, 25000, 27000, 32000, 30000, 35000, 33000, 38000, 36000, 42000],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderRadius: 6,
      },
    ],
  };
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
  };
}
