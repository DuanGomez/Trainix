import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PAYMENT_CONCEPT_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, label } from '../../../shared/labels';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ApiService } from '../../../core/services/api.service';

interface Payment {
  id: string;
  paymentNumber: string;
  concept: string;
  total: number;
  method: string;
  status: string;
  paidAt: string;
  member: { memberCode: string; firstName: string; lastName: string };
}

@Component({
  selector: 'app-payments-list',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe,
    MatCardModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatTableModule, MatPaginatorModule,
    PageHeaderComponent, SearchBarComponent, StatusBadgeComponent,
  ],
  template: `
    <app-page-header
      title="Pagos"
      actionLabel="Registrar pago"
      actionIcon="add"
      (actionClick)="router.navigate(['/payments/new'])" />

    <div class="toolbar">
      <app-search-bar placeholder="Buscar por número, cliente..." (searched)="onSearch($event)" />
    </div>

    <mat-card>
      <table mat-table [dataSource]="items()" class="full-width">
        <ng-container matColumnDef="paymentNumber">
          <th mat-header-cell *matHeaderCellDef>N° Pago</th>
          <td mat-cell *matCellDef="let p"><strong>{{ p.paymentNumber }}</strong></td>
        </ng-container>
        <ng-container matColumnDef="member">
          <th mat-header-cell *matHeaderCellDef>Cliente</th>
          <td mat-cell *matCellDef="let p">
            <span>{{ p.member.firstName }} {{ p.member.lastName }}</span>
            <small class="code"> ({{ p.member.memberCode }})</small>
          </td>
        </ng-container>
        <ng-container matColumnDef="concept">
          <th mat-header-cell *matHeaderCellDef>Concepto</th>
          <td mat-cell *matCellDef="let p">{{ conceptLabel(p.concept) }}</td>
        </ng-container>
        <ng-container matColumnDef="total">
          <th mat-header-cell *matHeaderCellDef>Total</th>
          <td mat-cell *matCellDef="let p">{{ p.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
        </ng-container>
        <ng-container matColumnDef="method">
          <th mat-header-cell *matHeaderCellDef>Método</th>
          <td mat-cell *matCellDef="let p">{{ methodLabel(p.method) }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let p">
            <app-status-badge [status]="p.status" [label]="statusLabel(p.status)" />
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let p">{{ p.paidAt | date:'dd/MM/yyyy HH:mm' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let r; columns: columns;"></tr>
      </table>
      <mat-paginator [length]="total()" [pageSize]="25" (page)="onPage($event)" showFirstLastButtons />
    </mat-card>
  `,
  styles: [`.toolbar { margin-bottom: 16px; } .full-width { width: 100%; } .code { color: #999; }`],
})
export class PaymentsListComponent implements OnInit {
  private api = inject(ApiService);
  router      = inject(Router);

  items   = signal<Payment[]>([]);
  total   = signal(0);
  columns = ['paymentNumber', 'member', 'concept', 'total', 'method', 'status', 'date'];
  private _page = 1;
  private _q   = '';

  ngOnInit(): void { this.load(); }
  onSearch(q: string): void { this._q = q; this._page = 1; this.load(); }
  onPage(e: PageEvent): void { this._page = e.pageIndex + 1; this.load(); }

  private load(): void {
    const p = new URLSearchParams({ page: String(this._page), limit: '25', search: this._q });
    this.api.get<any>(`payments?${p}`).subscribe((r) => {
      this.items.set(r.data); this.total.set(r.total);
    });
  }

  methodLabel(m: string): string { return label(PAYMENT_METHOD_LABELS, m); }
  conceptLabel(c: string): string { return label(PAYMENT_CONCEPT_LABELS, c); }
  statusLabel(s: string): string { return label(PAYMENT_STATUS_LABELS, s); }
}
