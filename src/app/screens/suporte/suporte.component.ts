import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpresaService } from '../../core/auth/empresa.service';

@Component({
  selector: 'app-suporte',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suporte.component.html',
})
export class SuporteComponent {
  private empresaService = inject(EmpresaService);
  empresa = this.empresaService.empresaAtiva;

  // Estado para o teste de conexão
  testandoConexao = signal(false);
  resultadoConexao = signal<string | null>(null);

  get suporte() {
    const e = this.empresa();
    if (!e) return [];

    const items = [
      {
        id: 'whatsapp',
        titulo: 'Empresa',
        valor: e.telefoneEmpresa || 'Aguarde...',
        emoji:
          'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
        color: '#25D366',
        link: true,
        href: `https://wa.me/55${e.telefoneEmpresa?.replace(/\D/g, '')}`,
        descricao: 'Canal via WhatsApp',
      },
      {
        id: 'Suporte WhatsApp (Geral)',
        titulo: 'WhatsApp Suporte',
        valor: '46 99916 0043',
        emoji:
          'M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3',
        color: '#25D366',
        link: true,
        href: `https://wa.me/46999160043`,
        descricao: 'Canal via WhatsApp',
      },
      {
        id: 'fixo',
        titulo: 'Telefone 0800',
        valor: e.suporteEmpresa || 'Não disponível',
        emoji:
          'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z',
        color: '#635BFF',
        link: !!e.suporteEmpresa,
        href: `tel:${e.suporteEmpresa}`,
        descricao: 'Atendimento de Seg a Sex das 8h as 20h',
      },
      {
        id: 'email',
        titulo: 'E-mail',
        valor: e.emailEmpresa || 'Aguarde...',
        emoji:
          'M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75',
        color: '#635BFF',
        link: true,
        href: `mailto:${e.emailEmpresa}`,
        descricao: 'Envie sua solicitação',
      },
      //{
      //   id: 'teste',
      //   titulo: 'Teste de Latência',
      //   valor: this.resultadoConexao() || 'Verificar agora',
      //   emoji:
      //     'M16.247 7.761a6 6 0 0 1 0 8.478"/><path d="M19.075 4.933a10 10 0 0 1 0 14.134"/><path d="M4.925 19.067a10 10 0 0 1 0-14.134',
      //   color: '#005f1dff',
      //   link: false,
      //   href: '',
      //   descricao: 'Estabilidade da rede',
      //   isAction: true,
      // },
      // {
      //   id: 'speedTest',
      //   titulo: 'Teste de Conexão',
      //   valor: 'SpeedTest',
      //   emoji:
      //     'M15.59 14.37a6 6 0 0 1-3.18 3.18m2.12-6.36a3 3 0 0 0-1.06 1.06m7.42-7.42a10 10 0 1 1-14.14 0 10 10 0 0 1 14.14 0Zm-1.41 1.41a8 8 0 1 0-11.32 0 8 8 0 0 0 11.32 0Z',
      //   color: '#005f1dff',
      //   link: true,
      //   href: '',
      //   descricao: 'Latência e Velocidade',
      //   isAction: true,
      // },
    ];

    return items;
  }

  testarConexao() {
    this.testandoConexao.set(true);
    this.resultadoConexao.set('Medindo latência...');

    const startTime = Date.now();

    // Chamamos o endpoint Index da CentralController que retorna estatísticas básicas do servidor
    this.empresaService['http']
      .get(`${this.empresaService.apiUrl}central`, { observe: 'response' })
      .subscribe({
        next: () => {
          const latency = Date.now() - startTime;
          this.testandoConexao.set(false);
          this.resultadoConexao.set(`Conexão Estável (${latency}ms)`);
        },
        error: (err: any) => {
          console.error('Erro no teste de conexão:', err);
          this.testandoConexao.set(false);
          this.resultadoConexao.set('Erro de conexão com o servidor');
        },
      });
  }
}
