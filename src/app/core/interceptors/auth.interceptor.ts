import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { from, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const kc = inject(KeycloakService);
  if (!req.url.startsWith('/api')) return next(req);
  return from(kc.getToken()).pipe(
    switchMap(token => next(token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req
    ))
  );
};
