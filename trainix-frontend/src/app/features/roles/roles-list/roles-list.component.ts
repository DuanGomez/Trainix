import { Component, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { ROLE_LABELS, label } from '../../../shared/labels';

interface Permission { id: string; module: string; action: string; }
interface Role { id: string; name: string; description: string; isSystem: boolean; permissions: Permission[]; }

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, PageHeaderComponent],
  template: `
    <app-page-header title="Roles y permisos" subtitle="Gestión de roles del sistema" />

    <div class="roles-grid">
      @for (role of roles(); track role.id) {
        <mat-card class="role-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>security</mat-icon> {{ roleLabel(role.name) }}
            </mat-card-title>
            <mat-card-subtitle>{{ role.description }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            @if (role.isSystem) {
              <mat-chip-set><mat-chip color="primary" highlighted>Rol del sistema</mat-chip></mat-chip-set>
            }
            <div class="permissions">
              @for (perm of role.permissions; track perm.id) {
                <mat-chip>{{ perm.module }}: {{ perm.action }}</mat-chip>
              }
              @if (role.permissions.length === 0) {
                <p class="no-perms">Sin permisos configurados</p>
              }
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .roles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .role-card mat-card-title { display: flex; align-items: center; gap: 8px; font-size: 1rem; }
    .permissions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .no-perms { color: #999; font-size: 0.85rem; }
  `],
})
export class RolesListComponent implements OnInit {
  private api = inject(ApiService);
  roles       = signal<Role[]>([]);

  roleLabel(name: string): string { return label(ROLE_LABELS, name); }

  ngOnInit(): void {
    this.api.get<Role[]>('roles').subscribe((r) => this.roles.set(r));
  }
}
