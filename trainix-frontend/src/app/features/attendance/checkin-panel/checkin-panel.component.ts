import { Component, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, FormGroupDirective, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { DatePipe } from '@angular/common';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MembershipStatusPipe } from '../../../shared/pipes/membership-status.pipe';

interface CheckinResult {
  member: { memberCode: string; firstName: string; lastName: string; avatarUrl?: string };
  membership?: { status: string; endDate: string; plan: { name: string } };
  attendance: { type: string; recordedAt: string };
}

@Component({
  selector: 'app-checkin-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatCardModule, MatIconModule, MatDividerModule,
    StatusBadgeComponent, MembershipStatusPipe,
  ],
  template: `
    <div class="checkin-page">
      <div class="checkin-left">
        <mat-card class="checkin-card">
          <mat-card-header>
            <mat-card-title>
              <mat-icon>login</mat-icon> Registro de Asistencia
            </mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p class="hint">Ingresa el código TX, número de documento o ID del cliente.</p>
            <form [formGroup]="form" (ngSubmit)="checkin()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Código / Documento / ID</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="identifier" (keyup.enter)="checkin()"
                       autocomplete="off" autofocus />
              </mat-form-field>
              <div class="btn-row">
                <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
                  <mat-icon>login</mat-icon> Check-in
                </button>
                <button mat-stroked-button type="button" (click)="checkout()" [disabled]="loading()">
                  <mat-icon>logout</mat-icon> Check-out
                </button>
              </div>
            </form>

            @if (error()) {
              <div class="result-error">
                <mat-icon>error_outline</mat-icon> {{ error() }}
              </div>
            }

            @if (result()) {
              <div class="result-success">
                <mat-icon class="success-icon">check_circle</mat-icon>
                <div class="member-info">
                  <strong>{{ result()!.member.firstName }} {{ result()!.member.lastName }}</strong>
                  <span class="code">{{ result()!.member.memberCode }}</span>
                </div>
                @if (result()!.membership) {
                  <div class="membership-info">
                    <span>Plan: {{ result()!.membership!.plan.name }}</span>
                    <app-status-badge
                      [status]="result()!.membership!.status"
                      [label]="result()!.membership!.status | membershipStatus" />
                    <span>Vence: {{ result()!.membership!.endDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                }
                <p class="recorded-at">
                  {{ result()!.attendance.type === 'checkin' ? 'Entrada' : 'Salida' }}
                  registrada: {{ result()!.attendance.recordedAt | date:'HH:mm' }}
                </p>
              </div>
            }
          </mat-card-content>
        </mat-card>
      </div>

      <div class="checkin-right">
        <div class="time-display">
          <p class="current-time">{{ now | date:'HH:mm' }}</p>
          <p class="current-date">{{ now | date:'EEEE, dd MMMM yyyy':'':'es-CO' }}</p>
        </div>
        <a mat-stroked-button routerLink="/attendance/history">
          <mat-icon>history</mat-icon> Ver historial
        </a>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page { display: grid; grid-template-columns: 1fr 320px; gap: 20px; max-width: 1100px; }
    .checkin-card { padding: 8px; border-radius: 24px; }
    .checkin-card mat-card-title {
      display: flex; align-items: center; gap: 10px;
      font-family: var(--tx-display); font-size: 1.8rem; font-weight: 800; text-transform: uppercase;
    }
    .checkin-card mat-card-title mat-icon { color: var(--tx-yellow); }
    .hint { color: var(--tx-text-2); font-size: 0.9rem; margin: 8px 0 18px; }
    .full-width { width: 100%; }
    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn-row button { height: 48px; padding: 0 22px; }
    .result-error {
      display: flex; align-items: center; gap: 10px;
      margin-top: 18px; padding: 14px 16px; border-radius: 16px;
      background: rgba(255, 82, 82, 0.1); color: var(--tx-red);
      border: 1px solid rgba(255, 82, 82, 0.25); font-weight: 600;
    }
    .result-success {
      margin-top: 18px; padding: 20px; border-radius: 20px;
      background: linear-gradient(135deg, rgba(46, 229, 157, 0.14), rgba(46, 229, 157, 0.04));
      border: 1px solid rgba(46, 229, 157, 0.3);
      display: flex; flex-direction: column; gap: 10px;
      animation: pop .5s var(--dc-ease-out) both;
    }
    .success-icon { color: var(--tx-green); font-size: 36px; width: 36px; height: 36px; }
    .member-info { display: flex; flex-direction: column; }
    .member-info strong {
      font-family: var(--tx-display); font-size: 2.2rem; font-weight: 800; text-transform: uppercase; line-height: 1;
    }
    .code { color: var(--tx-text-2); font-size: 0.85rem; font-family: var(--dc-mono); margin-top: 4px; }
    .membership-info { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 0.9rem; color: var(--tx-text-2); }
    .recorded-at { color: var(--tx-green); font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.85rem; }
    .checkin-right {
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px;
      padding: 32px 20px; border-radius: 24px;
      background:
        radial-gradient(80% 60% at 50% 0%, rgba(255, 200, 0, 0.18), transparent 70%),
        var(--tx-surface);
      border: 1px solid var(--tx-line);
    }
    .time-display { text-align: center; }
    .current-time {
      margin: 0; font-family: var(--tx-display); font-size: 5.4rem; font-weight: 900; font-style: italic;
      line-height: 1; color: var(--tx-yellow);
    }
    .current-date { color: var(--tx-text-2); margin: 8px 0 0; text-transform: capitalize; }
    @keyframes pop { from { opacity: 0; transform: scale(.96); } to { opacity: 1; transform: none; } }
    @media (max-width: 800px) { .checkin-page { grid-template-columns: 1fr; } }
  `],
})
export class CheckinPanelComponent {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private fb     = inject(FormBuilder);

  loading = signal(false);
  result  = signal<CheckinResult | null>(null);
  error   = signal('');
  now     = new Date();

  form = this.fb.group({ identifier: ['', Validators.required] });
  private formDir = viewChild(FormGroupDirective);

  checkin():  void { this.send('checkin'); }
  checkout(): void { this.send('checkout'); }

  private send(type: 'checkin' | 'checkout'): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.result.set(null);
    this.error.set('');

    const { identifier } = this.form.value;
    this.api.post<CheckinResult>(`attendance/${type}`, { query: identifier }).subscribe({
      next: (res) => {
        this.result.set(res);
        // resetForm también limpia el estado "enviado" para que el campo vacío no se vea como error.
        this.formDir()?.resetForm();
        this.loading.set(false);
        this.now = new Date();
      },
      error: (err) => {
        this.error.set(err?.error?.error?.message ?? 'No se pudo registrar la asistencia');
        this.loading.set(false);
      },
    });
  }
}
