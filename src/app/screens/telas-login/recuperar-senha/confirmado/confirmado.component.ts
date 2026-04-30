import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecuperarService } from '../recuperar/recuperar.service';
import { EmpresaService } from '../../../../core/services/empresa.service';

@Component({
  selector: 'app-confirmado',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmado.component.html',
})
export class ConfirmadoComponent {
  private recuperarService = inject(RecuperarService);
  /**
   * O novo endpoint não retorna o email — o backend busca e envia sozinho.
   * Mostramos o CPF mascarado como confirmação de qual cadastro foi usado.
   */
  get cpfMascarado(): string {
    const cpf = this.recuperarService.clienteState()?.cpfCnpj || '';
    if (!cpf) return '';
    // 11 dígitos = CPF: 111.***.***-99
    if (cpf.length === 11) {
      return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    }
    // 14 dígitos = CNPJ: 11.***.***/0001-99
    return cpf.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.***.***/****-$5');
  }

  get emailMascarado(): string {
    // Pega o email repassado no state pelo recuperar.component
    const email = (this.recuperarService.clienteState() as any).emailCliente || '';
    if (!email) return '';

    const partes = email.split('@');
    // Para endereços inválidos sem @
    if (partes.length < 2) return email;

    const nome = partes[0];
    const dominio = partes[1];

    if (nome.length <= 2) {
      return `${nome.charAt(0)}*@${dominio}`;
    }

    const nomeMascarado = nome.charAt(0) + '*'.repeat(nome.length - 2) + nome.slice(-1);
    return `${nomeMascarado}@${dominio}`;
  }
}
