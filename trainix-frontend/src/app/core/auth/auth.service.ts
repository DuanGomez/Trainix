import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { StorageService } from '../services/storage.service';
import { AuthStore } from './auth.store';
import { LoginResponse, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api     = inject(ApiService);
  private storage = inject(StorageService);
  private store   = inject(AuthStore);
  private router  = inject(Router);

  login(email: string, password: string): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('auth/login', { email, password }).pipe(
      tap((response) => {
        this.storage.setTokens(response.accessToken, response.refreshToken);
        this.store.setUser(response.user);
      }),
    );
  }

  logout(): void {
    this.api.post<void>('auth/logout', {}).subscribe();
    this.store.clearUser();
    this.router.navigate(['/auth/login']);
  }

  loadProfile(): Observable<User> {
    return this.api.get<User>('auth/me').pipe(
      tap((user) => this.store.setUser(user)),
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.api.post('auth/change-password', { currentPassword, newPassword });
  }

  refreshToken(): Observable<{ accessToken: string; refreshToken: string }> {
    const refreshToken = this.storage.getRefreshToken();
    return this.api.post<{ accessToken: string; refreshToken: string }>(
      'auth/refresh', { refreshToken }
    ).pipe(
      tap((tokens) => this.storage.setTokens(tokens.accessToken, tokens.refreshToken)),
    );
  }
}
