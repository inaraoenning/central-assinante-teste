// Guard - função que o Angular executa automaticamente toda vez que alguém tenta entrar em uma rota protegida.
// usado no arquivo de rotas
import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authPropagandaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);

  const idCliente = auth.usuarioAtual()?.idCliente;
  if (idCliente == 104745) {
    return true;
  }
  return false;
};

// CanActivateFn - transforma o Guard em uma simples variável que guarda uma função
// deixa o bundle (o tamanho final do aplicativo) menor e a execução muito mais rápida.

// inject() - "puxa" o serviço de autenticação e o roteador do Angular para dentro do Guard.

// createUrlTree - ordem síncrona e absoluta para o motor do Angular:
// "Cancelar imediatamente a navegação atual e trocar o destino final para /login".
//  mais seguro, limpo, evita bugs visuais.
