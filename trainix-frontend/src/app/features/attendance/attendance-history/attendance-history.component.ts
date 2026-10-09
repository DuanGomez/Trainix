import { Component, inject, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ApiService } from '../../../core/services/api.service';
import { signal } from '@angular/core';

interface AttendanceRecord {
  id: string;
  type: string;
  recordedAt: string;
  member: { memberCode: string; firstName: string; lastName: string };
}

@Component({
  selector: 'app-attendance-history',
  standalone: true,
  imports: [
    DatePipe, RouterLink, MatCardModule, MatTableModule,
    MatPaginatorModule, MatIconModule, MatButtonModule,
    PageHeaderComponent, SearchBarComponent,
  ],
  template: `
    <app-page-header title="Historial de asistencia">
      <a mat-button routerLink="/attendance">
        <mat-icon>arrow_back</mat-icon> Volver al check-in
      </a>
    </app-page-header>

    <div class="toolbar">
      <app-search-bar placeholder="Buscar por nombre o código..." (searched)="search($event)" />
    </div>

    <mat-card>
      <table mat-table [dataSource]="records()" class="full-width">
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Tipo</th>
          <td mat-cell *matCellDef="let r">
            <mat-icon [style.color]="r.type === 'checkin' ? 'var(--tx-green)' : 'var(--tx-blue)'">
              {{ r.type === 'checkin' ? 'login' : 'logout' }}
            </mat-icon>
            {{ r.type === 'checkin' ? 'Entrada' : 'Salida' }}
          </td>
        </ng-container>
        <ng-container matColumnDef="code">
          <th mat-header-cell *matHeaderCellDef>Código</th>
          <td mat-cell *matCellDef="let r"><strong>{{ r.member.memberCode }}</strong></td>
        </ng-container>
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let r">{{ r.member.firstName }} {{ r.member.lastName }}</td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let r">{{ r.recordedAt | date:'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="time">
          <th mat-header-cell *matHeaderCellDef>Hora</th>
          <td mat-cell *matCellDef="let r">{{ r.recordedAt | date:'HH:mm' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns;"></tr>
      </table>
      <mat-paginator
        [length]="total()"
        [pageSize]="25"
        [pageSizeOptions]="[25, 50, 100]"
        (page)="onPage($event)"
        showFirstLastButtons />
    </mat-card>
  `,
  styles: [`.toolbar { margin-bottom: 16px; } .full-width { width: 100%; }`],
})
export class AttendanceHistoryComponent implements OnInit {
  private api = inject(ApiService);

  records  = signal<AttendanceRecord[]>([]);
  total    = signal(0);
  columns  = ['type', 'code', 'name', 'date', 'time'];
  private _page = 1;
  private _q   = '';

  ngOnInit(): void { this.load(); }

  search(q: string): void { this._q = q; this._page = 1; this.load(); }
  onPage(e: PageEvent): void { this._page = e.pageIndex + 1; this.load(); }

  private load(): void {
    const params = new URLSearchParams({ page: String(this._page), limit: '25', search: this._q });
    this.api.get<any>(`attendance?${params}`).subscribe((r) => {
      this.records.set(r.data);
      this.total.set(r.total);
    });
  }
}
