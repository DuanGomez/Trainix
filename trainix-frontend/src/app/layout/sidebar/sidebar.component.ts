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
        <span class="logo__mark">T</span>TRAINIX
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
      padding: 22px 14px 18px;
      background: #000;
      border-right: 1px solid var(--tx-line);
      overflow-y: auto;
    }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 0 10px;
      font-family: var(--tx-display);
      font-weight: 900;
      font-style: italic;
      font-size: 26px;
      letter-spacing: 0.04em;
      color: #fff;
      text-decoration: none;
    }
    .logo__mark {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 9px;
      background: var(--tx-yellow);
      color: #0a0a0a;
      font-size: 22px;
      transform: skewX(-8deg);
    }
    .me {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 24px 4px 8px;
      padding: 12px;
      border-radius: 16px;
      background: var(--tx-surface);
      border: 1px solid var(--tx-line);
    }
    .me__avatar {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 12px;
      background: var(--tx-yellow);
      color: #0a0a0a;
      font-family: var(--tx-display);
      font-weight: 800;
      font-size: 18px;
    }
    .me__info { display: flex; flex-direction: column; min-width: 0; }
    .me__info strong { font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .me__info span { font-size: 0.75rem; color: var(--tx-yellow); font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; }
    .section {
      margin: 22px 14px 8px;
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      color: var(--tx-text-3);
    }
    .nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }
    .nav__item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 11px 14px;
      border-radius: 12px;
      color: var(--tx-text-2);
      font-size: 0.92rem;
      font-weight: 500;
      text-decoration: none;
      transition: color .2s ease, background-color .2s ease;
    }
    .nav__item mat-icon { font-size: 21px; width: 21px; height: 21px; }
    .nav__item:hover { color: #fff; background: rgba(255, 255, 255, 0.05); }
    .nav__item.is-active { color: #fff; background: var(--tx-yellow-soft); font-weight: 600; }
    .nav__item.is-active mat-icon { color: var(--tx-yellow); }
    .nav__item.is-active::before {
      content: '';
      position: absolute;
      left: -14px;
      top: 8px;
      bottom: 8px;
      width: 4px;
      border-radius: 0 4px 4px 0;
      background: var(--tx-yellow);
    }
    .signature { padding: 16px 4px 0; }
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
