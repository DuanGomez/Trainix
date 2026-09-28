import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ROLE_LABELS, label } from '../../../shared/labels';

interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  role: { name: string };
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTableModule, MatPaginatorModule,
    PageHeaderComponent, SearchBarComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header
      title="Usuarios / Staff"
      actionLabel="Nuevo usuario"
      actionIcon="person_add"
      (actionClick)="router.navigate(['/users/new'])" />

    <div class="toolbar">
      <app-search-bar (searched)="onSearch($event)" />
    </div>

    <mat-card>
      <table mat-table [dataSource]="items()" class="full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Nombre</th>
          <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
        </ng-container>
        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Correo</th>
          <td mat-cell *matCellDef="let u">{{ u.email }}</td>
        </ng-container>
        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Rol</th>
          <td mat-cell *matCellDef="let u">{{ roleLabel(u.role?.name) }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let u">
            <app-status-badge
              [status]="u.isActive ? 'active' : 'cancelled'"
              [label]="u.isActive ? 'Activo' : 'Inactivo'" />
          </td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let u">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="router.navigate(['/users', u.id, 'edit'])">
                <mat-icon>edit</mat-icon> Editar
              </button>
              <button mat-menu-item (click)="deactivate(u)">
                <mat-icon>block</mat-icon> Desactivar
              </button>
            </mat-menu>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let r; columns: columns;"></tr>
      </table>
      <mat-paginator [length]="total()" [pageSize]="25" (page)="onPage($event)" showFirstLastButtons />
    </mat-card>
  `,
  styles: [`.toolbar { margin-bottom: 16px; } .full-width { width: 100%; }`],
})
export class UsersListComponent implements OnInit {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  router         = inject(Router);

  items   = signal<StaffUser[]>([]);
  total   = signal(0);
  columns = ['name', 'email', 'role', 'status', 'actions'];
  private _page = 1;
  private _q   = '';

  ngOnInit(): void { this.load(); }
  onSearch(q: string): void { this._q = q; this._page = 1; this.load(); }
  onPage(e: PageEvent): void { this._page = e.pageIndex + 1; this.load(); }

  private load(): void {
    const p = new URLSearchParams({ page: String(this._page), limit: '25', search: this._q });
    this.api.get<any>(`users?${p}`).subscribe((r) => {
      this.items.set(r.data ?? r); this.total.set(r.total ?? r.length);
    });
  }

  roleLabel(name?: string): string { return label(ROLE_LABELS, name); }

  deactivate(u: StaffUser): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Desactivar usuario', message: `¿Desactivar a ${u.firstName} ${u.lastName}?`, danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.delete(`users/${u.id}`).subscribe({
        next: () => { this.notify.success('Usuario desactivado'); this.load(); },
        error: () => this.notify.error('Error al desactivar'),
      });
    });
  }
}
