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

      <span class="spacer"></span>

      <button mat-icon-button>
        <mat-icon>notifications_none</mat-icon>
      </button>

      <button mat-button [matMenuTriggerFor]="userMenu" class="user-btn">
        <mat-icon>account_circle</mat-icon>
        <span class="user-name">{{ user()?.firstName }}</span>
        <mat-icon>arrow_drop_down</mat-icon>
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
    .topbar { background: white; box-shadow: 0 1px 4px rgba(0,0,0,0.1); z-index: 10; }
    .spacer { flex: 1; }
    .user-btn { display: flex; align-items: center; gap: 4px; }
    .user-name { font-weight: 500; }
    .loading-bar { position: absolute; left: 0; right: 0; }
  `],
})
export class TopbarComponent {
  private authStore = inject(AuthStore);
  private authSvc   = inject(AuthService);
  loading           = inject(LoadingService);

  menuToggle = output<void>();

  user = this.authStore.currentUser;

  logout(): void { this.authSvc.logout(); }
}
