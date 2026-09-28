import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { DIFFICULTY_LABELS, label } from '../../../shared/labels';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Routine {
  id: string;
  name: string;
  objective: string;
  difficulty: string;
  durationWeeks: number;
  isActive: boolean;
  member: { memberCode: string; firstName: string; lastName: string };
}

@Component({
  selector: 'app-routines-list',
  standalone: true,
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatMenuModule, MatTableModule, MatPaginatorModule, MatChipsModule,
    PageHeaderComponent, SearchBarComponent,
  ],
  template: `
    <app-page-header
      title="Rutinas"
      actionLabel="Nueva rutina"
      actionIcon="add"
      (actionClick)="router.navigate(['/routines/new'])" />

    <div class="toolbar">
      <app-search-bar placeholder="Buscar por nombre o cliente..." (searched)="onSearch($event)" />
    </div>

    <mat-card>
      <table mat-table [dataSource]="items()" class="full-width">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Rutina</th>
          <td mat-cell *matCellDef="let r"><strong>{{ r.name }}</strong></td>
        </ng-container>
        <ng-container matColumnDef="member">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let r">
            {{ r.member?.firstName }} {{ r.member?.lastName }}
            @if (r.member) { <small> ({{ r.member.memberCode }})</small> }
          </td>
        </ng-container>
        <ng-container matColumnDef="difficulty">
          <th mat-header-cell *matHeaderCellDef>Dificultad</th>
          <td mat-cell *matCellDef="let r">
            @if (r.difficulty) { <mat-chip>{{ difficultyLabel(r.difficulty) }}</mat-chip> }
          </td>
        </ng-container>
        <ng-container matColumnDef="duration">
          <th mat-header-cell *matHeaderCellDef>Duración</th>
          <td mat-cell *matCellDef="let r">{{ r.durationWeeks ? r.durationWeeks + ' semanas' : '—' }}</td>
        </ng-container>
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let r">
            <button mat-icon-button [matMenuTriggerFor]="menu">
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="router.navigate(['/routines', r.id, 'edit'])">
                <mat-icon>edit</mat-icon> Editar
              </button>
              <button mat-menu-item (click)="deactivate(r.id)">
                <mat-icon>delete</mat-icon> Eliminar
              </button>
            </mat-menu>
          </td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <mat-paginator [length]="total()" [pageSize]="25" (page)="onPage($event)" showFirstLastButtons />
    </mat-card>
  `,
  styles: [`.toolbar { margin-bottom: 16px; } .full-width { width: 100%; }`],
})
export class RoutinesListComponent implements OnInit {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  router         = inject(Router);

  items   = signal<Routine[]>([]);
  total   = signal(0);
  columns = ['name', 'member', 'difficulty', 'duration', 'actions'];
  private _page = 1;
  private _q   = '';

  ngOnInit(): void { this.load(); }
  onSearch(q: string): void { this._q = q; this._page = 1; this.load(); }
  onPage(e: PageEvent): void { this._page = e.pageIndex + 1; this.load(); }

  private load(): void {
    const p = new URLSearchParams({ page: String(this._page), limit: '25', search: this._q });
    this.api.get<any>(`routines?${p}`).subscribe((r) => {
      this.items.set(r.data ?? r); this.total.set(r.total ?? r.length);
    });
  }

  difficultyLabel(d: string): string { return label(DIFFICULTY_LABELS, d); }

  deactivate(id: string): void {
    this.api.delete(`routines/${id}`).subscribe({
      next: () => { this.notify.success('Rutina eliminada'); this.load(); },
      error: () => this.notify.error('Error al eliminar'),
    });
  }
}
