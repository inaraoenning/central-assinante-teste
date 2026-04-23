// Guard - função que o Angular executa automaticamente toda vez que alguém tenta entrar em uma rota protegida.
// usado no arquivo de rotas
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.estaLogado()) return true;
  return router.createUrlTree(['/login']);
};

// CanActivateFn - transforma o Guard em uma simples variável que guarda uma função
// deixa o bundle (o tamanho final do aplicativo) menor e a execução muito mais rápida.

// inject() - "puxa" o serviço de autenticação e o roteador do Angular para dentro do Guard.

// createUrlTree - ordem síncrona e absoluta para o motor do Angular:
// "Cancelar imediatamente a navegação atual e trocar o destino final para /login".
//  mais seguro, limpo, evita bugs visuais.
