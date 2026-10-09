import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PAYMENT_METHOD_LABELS, label } from '../../../shared/labels';

interface CashSession {
  id: string;
  status: 'open' | 'closed';
  openingAmount: number;
  closingAmount?: number;
  expectedAmount?: number;
  difference?: number;
  openedAt: string;
  closedAt?: string;
  openedByUser?: { firstName: string; lastName: string };
}

@Component({
  selector: 'app-cash-dashboard',
  standalone: true,
  imports: [
    CurrencyPipe, DatePipe, ReactiveFormsModule,
    MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Caja" subtitle="Control de sesiones de caja" />

    @if (session(); as s) {
      <div class="session-grid">
        <mat-card class="session-card open">
          <mat-card-header>
            <mat-card-title>Caja abierta</mat-card-title>
            <mat-card-subtitle>
              Desde {{ s.openedAt | date:'dd/MM/yyyy HH:mm' }}
              @if (s.openedByUser) { · {{ s.openedByUser.firstName }} {{ s.openedByUser.lastName }} }
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="amounts">
              <div class="amount-item">
                <span class="label">Apertura</span>
                <span class="value">{{ s.openingAmount | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="amount-item">
                <span class="label">Ingresos hoy</span>
                <span class="value green">{{ todayTotal() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
            </div>

            <form [formGroup]="closeForm" (ngSubmit)="closeSession()" class="close-form">
              <mat-form-field appearance="outline">
                <mat-label>Efectivo contado al cierre</mat-label>
                <span matTextPrefix>$&nbsp;</span>
                <input matInput type="number" formControlName="closingAmount" min="0" />
              </mat-form-field>
              <button mat-flat-button color="warn" type="submit" [disabled]="closeForm.invalid">
                <mat-icon>lock</mat-icon> Cerrar caja
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Resumen del día</mat-card-title></mat-card-header>
          <mat-card-content>
            @for (item of breakdown(); track item.method) {
              <div class="breakdown-row">
                <span>{{ methodLabel(item.method) }}</span>
                <strong>{{ item.total | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
              </div>
            } @empty {
              <p class="muted">Aún no hay pagos registrados hoy.</p>
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      @if (lastClosed(); as c) {
        <mat-card class="closed-card">
          <mat-card-content>
            <strong>Último cierre:</strong> {{ c.closedAt | date:'dd/MM/yyyy HH:mm' }} —
            esperado {{ c.expectedAmount | currency:'COP':'symbol-narrow':'1.0-0' }},
            contado {{ c.closingAmount | currency:'COP':'symbol-narrow':'1.0-0' }}
            <span [class.green]="(c.difference ?? 0) >= 0" [class.red]="(c.difference ?? 0) < 0">
              (diferencia {{ c.difference | currency:'COP':'symbol-narrow':'1.0-0' }})
            </span>
          </mat-card-content>
        </mat-card>
      }
      <mat-card class="open-card">
        <mat-card-content>
          <div class="no-session">
            <mat-icon class="big-icon">point_of_sale</mat-icon>
            <h3>No hay caja abierta</h3>
            <p>Abre una sesión de caja para comenzar a registrar pagos en efectivo.</p>
            <form [formGroup]="openForm" (ngSubmit)="openSession()" class="open-form">
              <mat-form-field appearance="outline">
                <mat-label>Monto de apertura</mat-label>
                <span matTextPrefix>$&nbsp;</span>
                <input matInput type="number" formControlName="openingAmount" min="0" />
              </mat-form-field>
              <button mat-flat-button color="primary" type="submit">
                <mat-icon>lock_open</mat-icon> Abrir caja
              </button>
            </form>
          </div>
        </mat-card-content>
      </mat-card>
    }
  `,
  styles: [`
    .session-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .amounts { display: flex; gap: 24px; margin-bottom: 16px; }
    .amount-item { display: flex; flex-direction: column; }
    .label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tx-text-3); }
    .value { font-family: var(--tx-display); font-size: 2.4rem; font-weight: 800; line-height: 1.1; }
    .green { color: var(--tx-green); }
    .red { color: var(--tx-red); }
    .muted { color: var(--tx-text-3); }
    .close-form { display: flex; gap: 12px; align-items: baseline; flex-wrap: wrap; }
    .closed-card { margin-bottom: 16px; }
    .breakdown-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--tx-line); }
    .no-session { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px; text-align: center; }
    .big-icon { font-size: 64px; width: 64px; height: 64px; color: var(--tx-yellow); }
    .open-form { display: flex; gap: 16px; align-items: baseline; flex-wrap: wrap; justify-content: center; }
    @media (max-width: 700px) { .session-grid { grid-template-columns: 1fr; } }
  `],
})
export class CashDashboardComponent implements OnInit {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);

  session    = signal<CashSession | null>(null);
  lastClosed = signal<CashSession | null>(null);
  todayTotal = signal(0);
  breakdown  = signal<{ method: string; total: number }[]>([]);

  openForm  = this.fb.group({ openingAmount: [0, [Validators.required, Validators.min(0)]] });
  closeForm = this.fb.group({ closingAmount: [null as number | null, [Validators.required, Validators.min(0)]] });

  ngOnInit(): void { this.loadSession(); }

  methodLabel(m: string): string { return label(PAYMENT_METHOD_LABELS, m); }

  private loadSession(): void {
    this.api.get<CashSession | null>('cash-sessions/current').subscribe({
      next: (s) => {
        this.session.set(s);
        if (s) this.loadTotals();
      },
      error: () => this.session.set(null),
    });
  }

  private loadTotals(): void {
    this.api.get<{ total: number; breakdown: { method: string; total: number }[] }>('payments/today-total')
      .subscribe((data) => {
        this.todayTotal.set(data.total ?? 0);
        this.breakdown.set(data.breakdown ?? []);
      });
  }

  openSession(): void {
    if (this.openForm.invalid) return;
    this.api.post('cash-sessions/open', { openingAmount: Number(this.openForm.value.openingAmount) || 0 }).subscribe({
      next: () => { this.notify.success('Caja abierta'); this.loadSession(); },
      error: (err) => this.notify.error(err?.error?.error?.message ?? 'Error al abrir caja'),
    });
  }

  closeSession(): void {
    const current = this.session();
    if (!current || this.closeForm.invalid) return;
    const closingAmount = Number(this.closeForm.value.closingAmount);
    this.api.post<CashSession>(`cash-sessions/${current.id}/close`, { closingAmount }).subscribe({
      next: (closed) => {
        this.notify.success('Caja cerrada');
        this.lastClosed.set(closed);
        this.session.set(null);
        this.closeForm.reset();
      },
      error: (err) => this.notify.error(err?.error?.error?.message ?? 'Error al cerrar caja'),
    });
  }
}
