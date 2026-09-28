import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MembershipStatusPipe } from '../../../shared/pipes/membership-status.pipe';
import { ApiService } from '../../../core/services/api.service';

interface Membership {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  pricePaid: number;
  plan: { name: string; duration: string };
  member: { memberCode: string; firstName: string; lastName: string };
}

@Component({
  selector: 'app-memberships-list',
  standalone: true,
  imports: [
    DatePipe, CurrencyPipe, MatCardModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatMenuModule,
    PageHeaderComponent, SearchBarComponent, StatusBadgeComponent, MembershipStatusPipe,
  ],
  template: `
    <app-page-header
      title="Membresías"
      actionLabel="Asignar membresía"
      actionIcon="add"
      (actionClick)="router.navigate(['/memberships/new'])" />

    <div class="toolbar">
      <app-search-bar (searched)="onSearch($event)" />
    </div>

    <mat-card>
      <table mat-table [dataSource]="items()" class="full-width">
        <ng-container matColumnDef="member">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let m">
            <strong>{{ m.member.memberCode }}</strong> — {{ m.member.firstName }} {{ m.member.lastName }}
          </td>
        </ng-container>
        <ng-container matColumnDef="plan">
          <th mat-header-cell *matHeaderCellDef>Plan</th>
          <td mat-cell *matCellDef="let m">{{ m.plan.name }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let m">
            <app-status-badge [status]="m.status" [label]="m.status | membershipStatus" />
          </td>
        </ng-container>
        <ng-container matColumnDef="startDate">
          <th mat-header-cell *matHeaderCellDef>Inicio</th>
          <td mat-cell *matCellDef="let m">{{ m.startDate | date:'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="endDate">
          <th mat-header-cell *matHeaderCellDef>Vencimiento</th>
          <td mat-cell *matCellDef="let m">{{ m.endDate | date:'dd/MM/yyyy' }}</td>
        </ng-container>
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef>Valor</th>
          <td mat-cell *matCellDef="let m">{{ m.pricePaid | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let r; columns: columns;"></tr>
      </table>
      <mat-paginator [length]="total()" [pageSize]="25" (page)="onPage($event)" showFirstLastButtons />
    </mat-card>
  `,
  styles: [`.toolbar { margin-bottom: 16px; } .full-width { width: 100%; }`],
})
export class MembershipsListComponent implements OnInit {
  private api = inject(ApiService);
  router      = inject(Router);

  items   = signal<Membership[]>([]);
  total   = signal(0);
  columns = ['member', 'plan', 'status', 'startDate', 'endDate', 'price'];
  private _page = 1;
  private _q   = '';

  ngOnInit(): void { this.load(); }
  onSearch(q: string): void { this._q = q; this._page = 1; this.load(); }
  onPage(e: PageEvent): void { this._page = e.pageIndex + 1; this.load(); }

  private load(): void {
    const p = new URLSearchParams({ page: String(this._page), limit: '25', search: this._q });
    this.api.get<any>(`memberships?${p}`).subscribe((r) => {
      this.items.set(r.data); this.total.set(r.total);
    });
  }
}
