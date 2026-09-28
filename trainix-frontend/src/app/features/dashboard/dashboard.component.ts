import { Component, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { DashboardStore } from './dashboard.store';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe, MetricCardComponent, PageHeaderComponent,
    MatCardModule, MatProgressSpinnerModule, RouterLink, MatButtonModule,
  ],
  template: `
    <app-page-header title="Dashboard" subtitle="Resumen general del gimnasio" />

    @if (store.loading()) {
      <div class="center-spin"><mat-spinner diameter="48" /></div>
    } @else if (store.summary(); as s) {
      <div class="metrics-grid">
        <app-metric-card
          label="Clientes activos"
          [value]="s.activeMembers"
          icon="people"
          [subtitle]="s.totalMembers + ' total'"
          color="blue" />
        <app-metric-card
          label="Asistencia hoy"
          [value]="s.todayAttendance"
          icon="login"
          color="green" />
        <app-metric-card
          label="Ingresos hoy"
          [value]="(s.todayRevenue | currency:'COP':'symbol-narrow':'1.0-0') ?? ''"
          icon="payments"
          color="green" />
        <app-metric-card
          label="Membresías por vencer"
          [value]="s.expiringMemberships"
          icon="warning"
          subtitle="Próximos 7 días"
          color="orange" />
        <app-metric-card
          label="Ingresos del mes"
          [value]="(s.monthRevenue | currency:'COP':'symbol-narrow':'1.0-0') ?? ''"
          icon="trending_up"
          color="blue" />
        <app-metric-card
          label="Nuevos clientes"
          [value]="s.newMembersMonth"
          icon="person_add"
          subtitle="Este mes"
          color="green" />
      </div>

      <div class="charts-row">
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Ingresos últimos 6 meses</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bar-chart">
              @for (point of store.revenue(); track point.label) {
                <div class="bar-col">
                  <div class="bar-track">
                    <div class="bar"
                       [style.height.%]="barHeight(point.value, store.revenue())"
                       title="{{ point.value | currency:'COP':'symbol-narrow':'1.0-0' }}">
                  </div>
                  </div>
                  <span class="bar-label">{{ point.label }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Asistencia últimos 7 días</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="bar-chart attendance">
              @for (point of store.attendance(); track point.label) {
                <div class="bar-col">
                  <div class="bar-track">
                    <div class="bar attend-bar"
                       [style.height.%]="barHeight(point.value, store.attendance())"
                       title="{{ point.value }} visitas">
                  </div>
                  </div>
                  <span class="bar-label">{{ point.label }}</span>
                </div>
              }
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="quick-actions">
        <h3>Acciones rápidas</h3>
        <div class="actions-row">
          <a mat-flat-button color="primary" routerLink="/attendance">Check-in rápido</a>
          <a mat-stroked-button routerLink="/members/new">Nuevo cliente</a>
          <a mat-stroked-button routerLink="/memberships/new">Nueva membresía</a>
          <a mat-stroked-button routerLink="/payments/new">Registrar pago</a>
        </div>
      </div>
    }
  `,
  styles: [`
    .center-spin { display: flex; justify-content: center; padding: 80px; }
    .metrics-grid {
      display: grid; gap: 16px;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      margin-bottom: 24px;
    }
    .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .chart-card { flex: 1; }
    .bar-chart { display: flex; align-items: flex-end; gap: 8px; height: 160px; padding: 16px 0 0; }
    .bar-col { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; flex: 1; height: 100%; min-width: 0; }
    .bar-track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar { width: 100%; min-height: 4px; background: #1976d2; border-radius: 4px 4px 0 0; transition: height .3s; }
    .attend-bar { background: #2e7d32; }
    .bar-label { font-size: 0.7rem; color: #666; margin-top: 4px; white-space: nowrap; }
    .quick-actions h3 { margin: 0 0 12px; }
    .actions-row { display: flex; gap: 12px; flex-wrap: wrap; }
    @media (max-width: 768px) { .charts-row { grid-template-columns: 1fr; } }
  `],
})
export class DashboardComponent implements OnInit {
  store = inject(DashboardStore);

  ngOnInit(): void { this.store.load(); }

  barHeight(value: number, points: { value: number }[]): number {
    const max = Math.max(...points.map((p) => p.value), 1);
    return Math.max((value / max) * 100, 2);
  }
}
