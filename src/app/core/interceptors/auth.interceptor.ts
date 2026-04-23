import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // traz Router para dentro da função
  const token = sessionStorage.getItem('TOKEN'); // pega a "chave de acesso" que o AuthService guardou no login

  // "Carimba" requisições com o token
  // Toda requisição passa por aqui antes de ir para a internet
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  // next(authReq) manda a requisição carimbada para a API
  // .pipe(catchError(...)) fica esperando a resposta.
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Redireciona para o login caso receba 401 (não autorizado)
        // Similar à lógica do RestService legado
        const returnUrl = window.location.pathname;
        router.navigate(['/login'], { queryParams: { returnUrl } });
      }
      return throwError(() => error);
    }),
  );
};

/* No Angular, as requisições HTTP são imutáveis 
- não podem ser alteradas depois de criadas por segurança e previsibilidade). 
- Clonamos a original, adicionamos o token no clone, 
- mandamos o clone seguir */
