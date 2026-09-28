import { Injectable, signal, computed, inject } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from '../services/storage.service';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private storage = inject(StorageService);

  private _user = signal<User | null>(null);

  readonly currentUser = this._user.asReadonly();

  readonly isAuthenticated = computed(() => !!this._user());

  readonly gymId = computed(() => this._user()?.gymId ?? null);

  readonly role = computed(() => this._user()?.role?.name ?? null);

  readonly permissions = computed(() =>
    this._user()?.role?.permissions?.map((p) => `${p.module}:${p.action}`) ?? [],
  );

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }

  hasRole(...roles: string[]): boolean {
    const role = this.role();
    return role ? roles.includes(role) : false;
  }

  setUser(user: User): void {
    this._user.set(user);
  }

  clearUser(): void {
    this._user.set(null);
    this.storage.clearTokens();
  }
}
