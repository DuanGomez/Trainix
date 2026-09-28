import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AuthStore } from '../auth/auth.store';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authSvc = inject(AuthService);
  const store   = inject(AuthStore);
  const router  = inject(Router);
  const notify  = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('auth/')) {
        return authSvc.refreshToken().pipe(
          switchMap((tokens) => {
            return next(req.clone({
              setHeaders: { Authorization: `Bearer ${tokens.accessToken}` },
            }));
          }),
          catchError(() => {
            store.clearUser();
            router.navigate(['/auth/login']);
            return throwError(() => error);
          }),
        );
      }

      if (error.status === 403) {
        notify.error('No tienes permisos para realizar esta acción');
      } else if (error.status === 0) {
        notify.error('Sin conexión al servidor');
      } else if (error.status >= 500) {
        notify.error('Error interno del servidor. Por favor intenta de nuevo');
      }

      return throwError(() => error);
    }),
  );
};
