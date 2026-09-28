import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { StorageService } from '../services/storage.service';

export const noAuthGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const storage   = inject(StorageService);
  const router    = inject(Router);

  if (authStore.isAuthenticated() || storage.getAccessToken()) {
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
