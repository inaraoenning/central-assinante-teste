import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Propaganda } from '../../../types/propaganda.types';
import { PropagandaAdminService } from '../propaganda-admin.service';

@Component({
  selector: 'app-propaganda-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './propaganda-form.component.html',
})
export class PropagandaFormComponent implements OnChanges {
  private svc = inject(PropagandaAdminService);

  //  Inputs recebidos do pai
  @Input() modoEdicao = false;
  @Input() propagandaParaEditar: Propaganda | null = null;
  @Input() empresasDisponiveis: string[] = [];
  @Input() proximaOrdem = 1;

  //  Outputs emitidos para o pai
  @Output() salvo = new EventEmitter<Omit<Propaganda, 'id'>>();
  @Output() cancelado = new EventEmitter<void>();

  //  Estado interno do formulário
  salvando = signal(false);
  uploadando = signal(false);
  erroSalvar = signal('');
  previewUrl = signal<string | null>(null);
  modoImagem = signal<'url' | 'arquivo'>('url');

  form_titulo = '';
  form_empresa = '';
  form_imagemUrl = '';
  form_link = '';
  form_dataInicio = new Date().toISOString().slice(0, 10);
  form_dataFim = '';

  arquivoSelecionado: File | null = null;

  // Quando pai passa uma propaganda para editar, preenche o form
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['propagandaParaEditar'] && this.propagandaParaEditar) {
      const p = this.propagandaParaEditar;
      this.form_titulo = p.titulo ?? '';
      this.form_empresa = p.empresa;
      this.form_imagemUrl = p.imagemUrl;
      this.form_link = p.link ?? '';
      this.form_dataInicio = p.dataInicio?.slice(0, 10) ?? '';
      this.form_dataFim = p.dataFim?.slice(0, 10) ?? '';
      this.previewUrl.set(p.imagemUrl);
      this.arquivoSelecionado = null;
      this.modoImagem.set('url');
    }

    if (changes['modoEdicao'] && !this.modoEdicao) {
      this.resetForm();
    }
  }

  //  Toggle modo imagem
  alternarModoImagem(modo: 'url' | 'arquivo'): void {
    this.modoImagem.set(modo);
    this.form_imagemUrl = '';
    this.arquivoSelecionado = null;
    this.previewUrl.set(null);
  }

  onUrlDigitada(): void {
    this.arquivoSelecionado = null;
    this.previewUrl.set(this.form_imagemUrl || null);
  }

  onArquivoSelecionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.arquivoSelecionado = file;
    this.form_imagemUrl = '';

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  //  Fechar: apenas emite para o pai
  fecharModal(): void {
    this.cancelado.emit();
  }

  //  Salvar
  async salvar(): Promise<void> {
    if (!this.form_empresa) {
      this.erroSalvar.set('Selecione a empresa.');
      return;
    }
    if (!this.form_imagemUrl && !this.arquivoSelecionado) {
      this.erroSalvar.set('Selecione uma imagem.');
      return;
    }

    this.salvando.set(true);
    this.erroSalvar.set('');

    try {
      const imagemUrl = await this.realizarUpload();

      const payload: Omit<Propaganda, 'titulo' | 'id'> = {
        empresa: this.form_empresa,
        imagemUrl,
        link: this.form_link || undefined,
        ativo: true,
        ordem: this.proximaOrdem,
        dataInicio: this.form_dataInicio || new Date().toISOString(),
        dataFim: this.form_dataFim || undefined,
      };

      // Emite o payload + titulo (admin-only) para o pai decidir criar ou atualizar
      this.salvo.emit({ ...payload, titulo: this.form_titulo });
      this.salvando.set(false);
    } catch (msg) {
      this.salvando.set(false);
      this.erroSalvar.set(msg as string);
    }
  }

  //  Upload interno
  private realizarUpload(): Promise<string> {
    if (!this.arquivoSelecionado) return Promise.resolve(this.form_imagemUrl);

    return new Promise((resolve, reject) => {
      this.uploadando.set(true);
      this.svc.uploadImagem(this.arquivoSelecionado!, this.form_empresa).subscribe({
        next: (url) => {
          this.uploadando.set(false);
          resolve(url);
        },
        error: () => {
          this.uploadando.set(false);
          reject('Falha no upload da imagem.');
        },
      });
    });
  }

  // Reset interno
  private resetForm(): void {
    this.form_titulo = '';
    this.form_empresa = '';
    this.form_imagemUrl = '';
    this.form_link = '';
    this.form_dataInicio = new Date().toISOString().slice(0, 10);
    this.form_dataFim = '';
    this.arquivoSelecionado = null;
    this.previewUrl.set(null);
    this.erroSalvar.set('');
    this.modoImagem.set('url');
  }
}
