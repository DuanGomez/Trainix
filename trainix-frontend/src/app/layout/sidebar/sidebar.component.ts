import { DcodeaBadgeComponent } from '../../shared/components/dcodea-badge.component';
import { Component, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NAV_ITEMS, NavItem } from './nav-items.config';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule, DcodeaBadgeComponent],
  template: `
    <div class="sidebar dc-dark">
      <div class="sidebar-header">
        <img src="favicon.svg" alt="Trainix" class="logo" />
        <span class="brand">Trainix</span>
      </div>

      <mat-divider class="divider" />

      <mat-nav-list>
        @for (item of visibleItems(); track item.route) {
          <a mat-list-item
             [routerLink]="item.route"
             routerLinkActive="active-link"
             (click)="itemClicked.emit()">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
          </a>
        }
      </mat-nav-list>
      <div class="signature"><app-dcodea-badge /></div>
    </div>
  `,
  styles: [`
    .sidebar { display: flex; flex-direction: column; height: 100%; color: white; }
    .signature { padding: 16px; }
    .sidebar-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px; }
    .brand { font-size: 1.35rem; font-weight: 800; color: white; letter-spacing: -0.03em; }
    .logo { border-radius: 10px; box-shadow: 0 8px 24px -6px rgba(61, 90, 254, 0.7); }
    .logo { width: 36px; height: 36px; }
    mat-nav-list { flex: 1; padding-top: 8px; }
    a.active-link { background: linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 55%, var(--brand-2))) !important; box-shadow: 0 10px 30px -12px var(--brand); }
    a.mat-mdc-list-item {
      border-radius: 12px; margin: 2px 10px;
      --mat-list-list-item-label-text-color: rgba(255,255,255,0.85);
      --mat-list-list-item-hover-label-text-color: #fff;
      --mat-list-list-item-focus-label-text-color: #fff;
      --mat-list-list-item-leading-icon-color: rgba(255,255,255,0.85);
      --mat-list-list-item-hover-leading-icon-color: #fff;
    }
    a.active-link { --mat-list-list-item-label-text-color: #fff; font-weight: 600; }
    a.mat-mdc-list-item:hover { background: rgba(255,255,255,0.1); }
    mat-icon { color: rgba(255,255,255,0.85) !important; }
  `],
})
export class SidebarComponent {
  private authStore = inject(AuthStore);

  itemClicked = output<void>();

  visibleItems() {
    const role = this.authStore.role();
    return NAV_ITEMS.filter(
      (item) => !item.roles || !role || item.roles.includes(role),
    );
  }
}
