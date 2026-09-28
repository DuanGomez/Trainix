import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../auth/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const storage   = inject(StorageService);
  const authSvc   = inject(AuthService);
  const router    = inject(Router);

  if (authStore.isAuthenticated()) return true;

  const token = storage.getAccessToken();
  if (!token) {
    router.navigate(['/auth/login']);
    return false;
  }

  return authSvc.loadProfile().pipe(
    map(() => true),
    catchError(() => {
      router.navigate(['/auth/login']);
      return of(false);
    }),
  );
};
