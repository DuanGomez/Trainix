import { Component, inject, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { AuthService } from '../../core/auth/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    MatToolbarModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatBadgeModule, MatDividerModule, RouterLink, MatProgressBarModule,
  ],
  template: `
    <mat-toolbar class="topbar">
      <button mat-icon-button (click)="menuToggle.emit()">
        <mat-icon>menu</mat-icon>
      </button>

      <div class="today">
        <span class="today__dot"></span>
        <span>{{ today }}</span>
      </div>

      <span class="spacer"></span>

      <a mat-flat-button color="primary" class="quick" routerLink="/attendance">
        <mat-icon>bolt</mat-icon> Check-in
      </a>

      <button mat-icon-button aria-label="Notificaciones">
        <mat-icon>notifications_none</mat-icon>
      </button>

      <button class="user-btn" [matMenuTriggerFor]="userMenu" aria-label="Menú de usuario">
        <span class="user-avatar">{{ user()?.firstName?.[0] }}{{ user()?.lastName?.[0] }}</span>
        <mat-icon>expand_more</mat-icon>
      </button>

      <mat-menu #userMenu="matMenu">
        <button mat-menu-item routerLink="/settings">
          <mat-icon>settings</mat-icon> Configuración
        </button>
        <mat-divider />
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon> Cerrar sesión
        </button>
      </mat-menu>
    </mat-toolbar>

    @if (loading.isLoading()) {
      <mat-progress-bar mode="indeterminate" class="loading-bar" />
    }
  `,
  styles: [`
    .topbar {
      height: 68px;
      gap: 8px;
      padding: 0 clamp(8px, 2vw, 28px);
      background: rgba(10, 10, 10, 0.78);
      backdrop-filter: blur(16px) saturate(160%);
      -webkit-backdrop-filter: blur(16px) saturate(160%);
      border-bottom: 1px solid var(--tx-line);
      z-index: 10;
    }
    .spacer { flex: 1; }
    .today {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--tx-text-2);
    }
    .today__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--tx-green);
      box-shadow: 0 0 12px var(--tx-green);
    }
    .quick { height: 40px; margin-right: 6px; }
    .user-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px 4px 4px;
      border: 1px solid var(--tx-line);
      border-radius: 980px;
      background: var(--tx-surface);
      color: var(--tx-text-2);
      cursor: pointer;
    }
    .user-avatar {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--tx-yellow);
      color: #0a0a0a;
      font-family: var(--tx-display);
      font-weight: 800;
      font-size: 15px;
    }
    .loading-bar { position: absolute; left: 0; right: 0; bottom: -4px; }
    @media (max-width: 600px) { .today, .quick { display: none; } }
  `],
})
export class TopbarComponent {
  private authStore = inject(AuthStore);
  private authSvc   = inject(AuthService);
  loading           = inject(LoadingService);

  menuToggle = output<void>();

  user = this.authStore.currentUser;
  today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  logout(): void { this.authSvc.logout(); }
}
