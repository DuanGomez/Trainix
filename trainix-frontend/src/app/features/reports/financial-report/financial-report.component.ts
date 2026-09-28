import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PAYMENT_CONCEPT_LABELS, PAYMENT_METHOD_LABELS, label, toDateOnly } from '../../../shared/labels';
import { MetricCardComponent } from '../../../shared/components/metric-card/metric-card.component';
import { ApiService } from '../../../core/services/api.service';

interface FinancialReport {
  totalRevenue: number;
  totalPayments: number;
  byMethod: { method: string; total: number; count: number }[];
  byConcept: { concept: string; total: number; count: number }[];
  dailyTrend: { date: string; total: number }[];
}

@Component({
  selector: 'app-financial-report',
  standalone: true,
  imports: [
    CurrencyPipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTableModule,
    MatDatepickerModule, MatNativeDateModule,
    PageHeaderComponent, MetricCardComponent,
  ],
  template: `
    <app-page-header title="Reporte financiero" />

    <mat-card class="filter-card">
      <mat-card-content>
        <form [formGroup]="filterForm" (ngSubmit)="load()" class="filter-row">
          <mat-form-field appearance="outline">
            <mat-label>Desde</mat-label>
            <input matInput [matDatepicker]="dp1" formControlName="startDate" />
            <mat-datepicker-toggle matSuffix [for]="dp1" />
            <mat-datepicker #dp1 />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Hasta</mat-label>
            <input matInput [matDatepicker]="dp2" formControlName="endDate" />
            <mat-datepicker-toggle matSuffix [for]="dp2" />
            <mat-datepicker #dp2 />
          </mat-form-field>
          <button mat-flat-button color="primary" type="submit">
            <mat-icon>search</mat-icon> Consultar
          </button>
          <button mat-stroked-button type="button" (click)="exportExcel()">
            <mat-icon>download</mat-icon> Excel
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    @if (report()) {
      <div class="metrics-row">
        <app-metric-card
          label="Ingresos totales"
          [value]="(report()!.totalRevenue | currency:'COP':'symbol-narrow':'1.0-0') ?? ''"
          icon="payments"
          color="green" />
        <app-metric-card
          label="N° de pagos"
          [value]="report()!.totalPayments"
          icon="receipt_long"
          color="blue" />
      </div>

      <div class="tables-row">
        <mat-card>
          <mat-card-header><mat-card-title>Por método de pago</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report()!.byMethod" class="full-width">
              <ng-container matColumnDef="method">
                <th mat-header-cell *matHeaderCellDef>Método</th>
                <td mat-cell *matCellDef="let r">{{ methodLabel(r.method) }}</td>
              </ng-container>
              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                <td mat-cell *matCellDef="let r">{{ r.count }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let r">{{ r.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['method','count','total']"></tr>
              <tr mat-row *matRowDef="let r; columns: ['method','count','total'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Por concepto</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report()!.byConcept" class="full-width">
              <ng-container matColumnDef="concept">
                <th mat-header-cell *matHeaderCellDef>Concepto</th>
                <td mat-cell *matCellDef="let r">{{ conceptLabel(r.concept) }}</td>
              </ng-container>
              <ng-container matColumnDef="count">
                <th mat-header-cell *matHeaderCellDef>Cantidad</th>
                <td mat-cell *matCellDef="let r">{{ r.count }}</td>
              </ng-container>
              <ng-container matColumnDef="total">
                <th mat-header-cell *matHeaderCellDef>Total</th>
                <td mat-cell *matCellDef="let r">{{ r.total | currency:'COP':'symbol-narrow':'1.0-0' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="['concept','count','total']"></tr>
              <tr mat-row *matRowDef="let r; columns: ['concept','count','total'];"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .filter-card { margin-bottom: 16px; }
    .filter-row { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    .metrics-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
    .tables-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .full-width { width: 100%; }
    @media (max-width: 768px) { .tables-row, .metrics-row { grid-template-columns: 1fr; } }
  `],
})
export class FinancialReportComponent implements OnInit {
  private api = inject(ApiService);
  private fb  = inject(FormBuilder);

  report = signal<FinancialReport | null>(null);

  filterForm = this.fb.group({
    startDate: [this.firstDayOfMonth()],
    endDate:   [new Date()],
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.get<FinancialReport>(`reports/financial?${this.params()}`).subscribe((r) => this.report.set(r));
  }

  exportExcel(): void {
    this.api.download(`reports/financial/excel?${this.params()}`, `reporte-financiero-${toDateOnly(new Date())}.xlsx`);
  }

  methodLabel(m: string): string { return label(PAYMENT_METHOD_LABELS, m); }
  conceptLabel(c: string): string { return label(PAYMENT_CONCEPT_LABELS, c); }

  private params(): string {
    const { startDate, endDate } = this.filterForm.value;
    const params = new URLSearchParams();
    if (startDate) params.set('startDate', toDateOnly(startDate)!);
    if (endDate) params.set('endDate', toDateOnly(endDate)!);
    return params.toString();
  }

  private firstDayOfMonth(): Date {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }
}
