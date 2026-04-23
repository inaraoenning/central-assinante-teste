import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceiroService } from './financeiro.service';
import { EmpresaService } from '../../core/auth/empresa.service';
import { HttpClient } from '@angular/common/http';
import { Fatura } from '../../models/fatura.model';
import { Injectable } from '@angular/core';
import { Md5 } from 'ts-md5';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financeiro.component.html',
})
@Injectable({ providedIn: 'root' })
export class FinanceiroComponent implements OnInit {
  public financeiroService = inject(FinanceiroService);
  private empresaService = inject(EmpresaService);
  private http = inject(HttpClient);

  // Read-only access to signals for the template
  contratos = this.financeiroService.contratos;
  contratosComFatura = this.financeiroService.contratosComFatura;
  contratoSelecionado = this.financeiroService.contratoSelecionado;
  faturaAtual = this.financeiroService.faturaAtual;
  listaFaturas = this.financeiroService.listaFaturas;
  isLoading = this.financeiroService.isLoading;
  empresaAtiva = this.empresaService.empresaAtiva;

  // Controle de visibilidade da NFCom verificado via API
  mostrarNfMap = signal<Map<number, boolean>>(new Map());

  ngOnInit(): void {
    this.financeiroService.loadContratos().subscribe(() => {
      this.verificarTodasAsNotas();
    });
  }

  // Ações
  selecionarContrato(id: number) {
    this.financeiroService.setContratoSelecionado(id);
    // Pequeno delay para garantir que o signal listaFaturas() já atualizou
    setTimeout(() => this.verificarTodasAsNotas(), 50);
  }

  private verificarTodasAsNotas() {
    const faturas = this.listaFaturas();
    faturas.forEach((f) => {
      // Regra: Deve estar paga, permitir visualização de boleto (regra de negócio) e possuir os dados mínimos da NFCom
      if (f.pago && f.visualizarBoleto && f.hashNfcom && f.idEmpresaTj) {
        // Se já verificamos, não repete
        if (this.mostrarNfMap().has(f.idTitulo)) return;
        this.verificarNfCom(f);
      }
    });
  }

  private async verificarNfCom(f: Fatura) {
    const url = `${environment.apiUrl}print/nfcom?e=${f.idEmpresaTj}&id=${f.idTitulo}&k=${f.hashNfcom}`;
    try {
      // HEAD request para validar existência do documento (status 200)
      await this.http.head(url).toPromise();
      const novoMapa = new Map(this.mostrarNfMap());
      novoMapa.set(f.idTitulo, true);
      this.mostrarNfMap.set(novoMapa);
    } catch (e) {
      const novoMapa = new Map(this.mostrarNfMap());
      novoMapa.set(f.idTitulo, false);
      this.mostrarNfMap.set(novoMapa);
    }
  }

  isBoleto(f: Fatura): boolean {
    return (
      f.idPagamento == 21 ||
      f.idPagamento == 23 ||
      f.idPagamento == 24 ||
      f.idPagamento == 26 ||
      f.pagamento?.toLowerCase().includes('boleto')
    );
  }

  // Ações de Links
  openBoleto(f: Fatura) {
    const url = `${environment.apiUrl}print/boleto?id=${f.idTitulo}&k=${this.gerarMd5(f.idTitulo, this.empresaService.empresaAtiva()?.db ?? '')}&local=5`;
    window.open(url, '_blank');
  }

  gerarMd5(idTitulo: number, empresaDb: string | null): string {
    const hashInput = `hash do print: ${idTitulo}${empresaDb}`;
    const k = Md5.hashStr(hashInput).toLocaleUpperCase();

    return k;
  }

  async copiarCodigoBarras(f: Fatura) {
    const empresa = this.empresaService.empresaAtiva();
    const url = `${environment.apiUrl}print/boleto/BoletoStringGlobal?id=${f.idTitulo}&db=${empresa?.db}&somenteLinha=true&local=1`;

    try {
      const res = await this.http.get(url, { responseType: 'text' }).toPromise();
      if (res) {
        navigator.clipboard.writeText(res.trim());
        alert('Código de barras copiado!');
      }
    } catch (e) {
      alert('Erro ao copiar código de barras.');
    }
  }

  copiarCodigoPix(f: Fatura) {
    if (f.textoImagemQRcodePix) {
      navigator.clipboard.writeText(f.textoImagemQRcodePix);
      alert('Código PIX copiado!');
    }
  }

  openNFcom(f: Fatura) {
    const url = `${environment.apiUrl}print/nfcom?e=${f.idEmpresaTj}&id=${f.idTitulo}&k=${f.hashNfcom}`;
    window.open(url, '_blank');
  }

  openNF(f: Fatura) {
    const prefix = environment.apiUrl;
    const url = `/boleto/nf.aspx?id=${f.idTitulo}&k=${f.hashNF}`;
    window.open(prefix + url, '_blank');
  }

  openNFS(f: Fatura) {
    const prefix = environment.apiUrl;
    const url = `/boleto/nfs.aspx?id=${f.idTitulo}&k=${f.hashNFS}`;
    window.open(prefix + url, '_blank');
  }
}
