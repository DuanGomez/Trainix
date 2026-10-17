import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NAV_ITEMS } from './nav-items.config';
import { AuthStore } from '../../core/auth/auth.store';
import { DcodeaBadgeComponent } from '../../shared/components/dcodea-badge.component';
import { ROLE_LABELS, label } from '../../shared/labels';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, DcodeaBadgeComponent],
  template: `
    <div class="sidebar">
      <a class="logo" routerLink="/dashboard" (click)="itemClicked.emit()">
        <span class="logo__mark">T</span>Trainix
      </a>

      @if (user(); as u) {
        <div class="me">
          <span class="me__avatar">{{ u.firstName[0] }}{{ u.lastName[0] }}</span>
          <div class="me__info">
            <strong>{{ u.firstName }} {{ u.lastName }}</strong>
            <span>{{ roleLabel() }}</span>
          </div>
        </div>
      }

      <p class="section">Menú</p>
      <nav class="nav">
        @for (item of visibleItems(); track item.route) {
          <a class="nav__item" [routerLink]="item.route" routerLinkActive="is-active" (click)="itemClicked.emit()">
            <mat-icon>{{ item.icon }}</mat-icon>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="signature"><app-dcodea-badge /></div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 26px 16px 18px;
      background: var(--tx-ink);
      overflow-y: auto;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 8px;
      font-family: var(--tx-display);
      font-weight: 700;
      font-size: 20px;
      letter-spacing: -0.03em;
      color: #fff;
      text-decoration: none;
    }
    .logo__mark {
      display: grid;
      place-items: center;
      width: 32px;
      height: 32px;
      border-radius: 9px;
      background: var(--tx-yellow);
      color: var(--tx-ink);
      font-size: 16px;
      font-weight: 800;
    }
    .me {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 26px 0 6px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.06);
    }
    .me__avatar {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      flex-shrink: 0;
      border-radius: 50%;
      background: #2a2a2f;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
    }
    .me__info { display: flex; flex-direction: column; min-width: 0; }
    .me__info strong { font-size: 0.9rem; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .me__info span { font-size: 0.78rem; color: #8b8b91; }
    .section {
      margin: 22px 10px 8px;
      font-size: 0.72rem;
      font-weight: 600;
      color: #6f6f76;
    }
    .nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .nav__item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 12px;
      color: #a2a2a8;
      font-size: 0.9rem;
      font-weight: 500;
      text-decoration: none;
      transition: color .2s ease, background-color .2s ease;
    }
    .nav__item mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .nav__item:hover { color: #fff; background: #222226; }
    .nav__item.is-active { color: var(--tx-ink); background: var(--tx-yellow); font-weight: 600; }
    .signature { padding: 16px 0 0; }
  `],
})
export class SidebarComponent {
  private authStore = inject(AuthStore);

  itemClicked = output<void>();

  user = this.authStore.currentUser;
  roleLabel = computed(() => label(ROLE_LABELS, this.authStore.role()));

  visibleItems() {
    const role = this.authStore.role();
    return NAV_ITEMS.filter((item) => !item.roles || !role || item.roles.includes(role));
  }
}
