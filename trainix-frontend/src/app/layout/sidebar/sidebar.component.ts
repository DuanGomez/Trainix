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
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule, MatDividerModule],
  template: `
    <div class="sidebar">
      <div class="sidebar-header">
        <img src="favicon.svg" alt="Trainix" class="logo" />
        <span class="brand">Trainix</span>
      </div>

      <mat-divider />

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
    </div>
  `,
  styles: [`
    .sidebar { display: flex; flex-direction: column; height: 100%; background: #1a237e; color: white; }
    .sidebar-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px; }
    .brand { font-size: 1.4rem; font-weight: 700; color: white; letter-spacing: 1px; }
    .logo { width: 36px; height: 36px; }
    mat-nav-list { flex: 1; padding-top: 8px; }
    a.active-link { background: rgba(255,255,255,0.15) !important; border-radius: 8px; }
    a.mat-mdc-list-item {
      border-radius: 8px; margin: 2px 8px;
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
