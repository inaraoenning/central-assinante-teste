import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { EmpresaService } from '../../../core/auth/empresa.service';

@Component({
  selector: 'app-login-via-boleto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-via-boleto.component.html',
})
export class LoginViaBoletoComponent {
  cpfcnpj = '';
  loading = false;
  errorMessage = '';
  faturas: any[] | null = null;

  public empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  buscarFaturas(): void {
    if (!this.cpfcnpj) {
      this.errorMessage = 'Informe o CPF/CNPJ.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const limpo = this.cpfcnpj.replace(/\D/g, '');

    // Usando o endpoint de segunda via por empresa da nova WebAPI
    const empresaId = this.empresaService.empresaAtiva()?.idEmpresa || 'VIARAPIDA';

    this.http
      .get<any[]>(`${this.empresaService.apiUrl}central/segunda-viaemp/${limpo}/${empresaId}`)
      .subscribe({
        next: (data) => {
          this.faturas = data || [];
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Erro ao buscar dados. Verifique o documento digitado.';
          this.loading = false;
        },
      });
  }

  novaBusca(): void {
    this.faturas = null;
    this.cpfcnpj = '';
    this.errorMessage = '';
  }

  formatarData(dt: string): string {
    if (!dt) return '';
    try {
      const d = new Date(dt);
      return d.toLocaleDateString('pt-BR');
    } catch {
      return dt;
    }
  }

  isBoleto(f: any): boolean {
    return f.idpagamento == 23 || f.idpagamento == 24 || f.carne ? true : false;
  }

  isPix(f: any): boolean {
    return f.clientePix == true;
  }

  abrirPdf(f: any): void {
    if (f.usarTJ) {
      const url = `https://api.cpsadmin.com.br/print/boleto?id=${f.id}&k=${f.hashPixPrint}&local=1`;
      window.open(url, '_blank');
    } else {
      // Implementação secundária se necessário, baseada no legado (boletoWLN)
      alert('Acesso ao boleto no portal secundário.');
    }
  }

  copiarPix(f: any): void {
    if (f.textoImagemQRcodePix) {
      this.copiarParaAreaTransferencia(f.textoImagemQRcodePix);
      alert('Código PIX copiado para a área de transferência.');
    } else {
      const url = `https://api.cpsadmin.com.br/print/boleto/BoletoStringGlobal?id=${f.id}&db=${f.db || ''}&somenteCodigoPix=true&local=1`;
      this.http.get(url, { responseType: 'text' }).subscribe({
        next: (res) => {
          if (res === 'Chave não encontrada') {
            alert(res);
          } else {
            this.copiarParaAreaTransferencia(res);
            alert('Código PIX copiado!');
          }
        },
        error: () => alert('Falha ao buscar código Pix'),
      });
    }
  }

  private copiarParaAreaTransferencia(texto: string) {
    navigator.clipboard.writeText(texto).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = texto;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    });
  }
}
