import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';
import { NotificationService } from '../services/notification.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authStore = inject(AuthStore);
  const router    = inject(Router);
  const notify    = inject(NotificationService);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  if (requiredRoles.length === 0) return true;

  if (!authStore.hasRole(...requiredRoles)) {
    notify.error('No tienes permisos para acceder a esta sección');
    router.navigate(['/dashboard']);
    return false;
  }
  return true;
};
