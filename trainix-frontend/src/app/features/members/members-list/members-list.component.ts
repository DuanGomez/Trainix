import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { DataTableComponent } from '../../../shared/components/data-table/data-table.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { AvatarComponent } from '../../../shared/components/avatar/avatar.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { MembersStore } from '../store/members.store';
import { MatTableModule } from '@angular/material/table';
import { Member } from '../services/members.service';

@Component({
  selector: 'app-members-list',
  standalone: true,
  imports: [
    PageHeaderComponent, SearchBarComponent, DataTableComponent,
    StatusBadgeComponent, AvatarComponent, MatChipsModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatTableModule,
  ],
  template: `
    <app-page-header
      title="Clientes"
      subtitle="Gestión de miembros del gimnasio"
      actionLabel="Nuevo cliente"
      actionIcon="person_add"
      (actionClick)="router.navigate(['/members/new'])" />

    <div class="toolbar">
      <app-search-bar placeholder="Buscar por nombre, código o documento..." (searched)="store.setSearch($event)" />
    </div>

    <app-data-table
      [data]="store.items()"
      [displayedColumns]="columns"
      [total]="store.total()"
      [loading]="store.loading()"
      [rowClickable]="true"
      (rowClick)="goToDetail($event)"
      (pageChange)="store.setPage($event.pageIndex + 1)">

      <ng-container matColumnDef="avatar">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let m">
          <app-avatar [initials]="initials(m)" [src]="m.avatarUrl" [size]="36" />
        </td>
      </ng-container>

      <ng-container matColumnDef="memberCode">
        <th mat-header-cell *matHeaderCellDef>Código</th>
        <td mat-cell *matCellDef="let m"><strong>{{ m.memberCode }}</strong></td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Nombre</th>
        <td mat-cell *matCellDef="let m">{{ m.firstName }} {{ m.lastName }}</td>
      </ng-container>

      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Correo</th>
        <td mat-cell *matCellDef="let m">{{ m.email }}</td>
      </ng-container>

      <ng-container matColumnDef="phone">
        <th mat-header-cell *matHeaderCellDef>Teléfono</th>
        <td mat-cell *matCellDef="let m">{{ m.phone }}</td>
      </ng-container>

      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Estado</th>
        <td mat-cell *matCellDef="let m">
          <app-status-badge
            [status]="m.isActive ? 'active' : 'cancelled'"
            [label]="m.isActive ? 'Activo' : 'Inactivo'" />
        </td>
      </ng-container>

      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let m" (click)="$event.stopPropagation()">
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="router.navigate(['/members', m.id])">
              <mat-icon>visibility</mat-icon> Ver detalle
            </button>
            <button mat-menu-item (click)="router.navigate(['/members', m.id, 'edit'])">
              <mat-icon>edit</mat-icon> Editar
            </button>
            <button mat-menu-item (click)="deactivate(m)">
              <mat-icon>block</mat-icon> Desactivar
            </button>
          </mat-menu>
        </td>
      </ng-container>

    </app-data-table>
  `,
  styles: [`.toolbar { margin-bottom: 16px; }`],
})
export class MembersListComponent implements OnInit {
  store  = inject(MembersStore);
  router = inject(Router);
  dialog = inject(MatDialog);

  columns = ['avatar', 'memberCode', 'name', 'email', 'phone', 'status', 'actions'];

  ngOnInit(): void { this.store.load(); }

  initials(m: Member): string {
    return `${m.firstName[0]}${m.lastName[0]}`.toUpperCase();
  }

  goToDetail(m: Member): void { this.router.navigate(['/members', m.id]); }

  deactivate(m: Member): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Desactivar cliente',
        message: `¿Deseas desactivar a ${m.firstName} ${m.lastName}?`,
        confirmLabel: 'Desactivar',
        danger: true,
      },
    }).afterClosed().subscribe((ok) => { if (ok) this.store.remove(m.id); });
  }
}
