import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Propaganda } from '../../types/propaganda.types';
import { PropagandaAdminService } from './propaganda-admin.service';
import { PropagandaMockService } from './propaganda-mock.service';
import { PropagandaFormComponent } from './propaganda-form/propaganda-form.component';

@Component({
  selector: 'app-propaganda-admin',
  standalone: true,
  imports: [CommonModule, PropagandaFormComponent],
  templateUrl: './propaganda-admin.component.html',
})
export class PropagandaAdminComponent implements OnInit {
  readonly svc = inject(PropagandaAdminService);
  readonly mockPropaganda = inject(PropagandaMockService);

  empresasDisponiveis = computed(() => this.svc.empresas().map((e) => e.nomeAmigavelEmpresa));

  //  Estado da lista
  propagandas = signal<Propaganda[]>([]);
  loading = signal(true);

  //  Estado do modal
  modalAberto = signal(false);
  modoEdicao = signal(false);
  propagandaEmEdicao = signal<Propaganda | null>(null);

  // ── Lifecycle
  ngOnInit(): void {
    this.carregar();
    this.svc.carregarEmpresas();
  }

  //  Busca dados
  carregar(): void {
    this.loading.set(true);
    this.mockPropaganda.listar().subscribe({
      next: (lista) => {
        this.propagandas.set(lista ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.propagandas.set([]);
        this.loading.set(false);
      },
    });
  }

  //  Controle do modal
  abrirModal(): void {
    this.modoEdicao.set(false);
    this.propagandaEmEdicao.set(null);
    this.modalAberto.set(true);
  }

  editar(p: Propaganda): void {
    this.modoEdicao.set(true);
    this.propagandaEmEdicao.set(p);
    this.modalAberto.set(true);
  }

  fecharModal(): void {
    this.modalAberto.set(false);
    this.propagandaEmEdicao.set(null);
  }

  //  Recebe o payload emitido pelo filho e decide criar ou atualizar
  onSalvo(payload: Omit<Propaganda, 'id'>): void {
    const emEdicao = this.propagandaEmEdicao();

    if (this.modoEdicao() && emEdicao?.id) {
      // Atualiza ordem original ao editar
      const payloadComOrdem = { ...payload, ordem: emEdicao.ordem };
      this.svc.atualizar(emEdicao.id, payloadComOrdem).subscribe({
        next: () => {
          this.fecharModal();
          this.carregar();
        },
        error: () => console.error('Erro ao atualizar'),
      });
    } else {
      const payloadComOrdem = { ...payload, ordem: this.svc.proximaOrdem(this.propagandas()) };
      this.svc.criar(payloadComOrdem).subscribe({
        next: () => {
          this.fecharModal();
          this.carregar();
        },
        error: () => console.error('Erro ao criar'),
      });
    }
  }

  //  CRUD da lista
  confirmarExclusao(p: Propaganda): void {
    if (!confirm(`Excluir "${p.titulo || p.empresa}"? Esta ação não pode ser desfeita.`)) return;
    this.svc.excluir(p.id!).subscribe({ next: () => this.carregar() });
  }

  alternarAtivo(p: Propaganda): void {
    this.svc.alterarAtivo(p.id!, !p.ativo).subscribe({ next: () => this.carregar() });
  }
}
