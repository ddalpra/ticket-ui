import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const msg = inject(MessageService);
  return next(req).pipe(
    catchError(err => {
      const detail = err.error?.error ?? err.message ?? 'Errore sconosciuto';
      if (err.status !== 401)
        msg.add({ severity: 'error', summary: `Errore ${err.status}`, detail, life: 5000 });
      return throwError(() => err);
    })
  );
};
