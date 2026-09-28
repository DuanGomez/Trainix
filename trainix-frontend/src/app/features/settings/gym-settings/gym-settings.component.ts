import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  selector: 'app-gym-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule,
    MatSlideToggleModule, MatDividerModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Configuración del gimnasio" />

    <mat-card style="max-width: 700px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <h3 class="section span-full">General</h3>

          <mat-form-field appearance="outline">
            <mat-label>Moneda</mat-label>
            <mat-select formControlName="currency">
              <mat-option value="COP">COP — Peso colombiano</mat-option>
              <mat-option value="USD">USD — Dólar</mat-option>
              <mat-option value="EUR">EUR — Euro</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Zona horaria</mat-label>
            <mat-select formControlName="timezone">
              <mat-option value="America/Bogota">Bogotá (UTC-5)</mat-option>
              <mat-option value="America/Mexico_City">Ciudad de México (UTC-6)</mat-option>
              <mat-option value="America/Lima">Lima (UTC-5)</mat-option>
              <mat-option value="America/Santiago">Santiago (UTC-4)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de apertura</mat-label>
            <input matInput type="time" formControlName="openingTime" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Hora de cierre</mat-label>
            <input matInput type="time" formControlName="closingTime" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Capacidad máxima</mat-label>
            <input matInput type="number" formControlName="maxCapacity" min="1" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Días antes de alerta de vencimiento</mat-label>
            <input matInput type="number" formControlName="daysBeforeExpiryAlert" min="1" />
          </mat-form-field>

          <h3 class="section span-full">Check-in</h3>

          <div class="toggle-row span-full">
            <mat-slide-toggle formControlName="allowCheckinWithoutMembership">
              Permitir check-in sin membresía activa
            </mat-slide-toggle>
          </div>

          <mat-form-field appearance="outline">
            <mat-label>Minutos de gracia</mat-label>
            <input matInput type="number" formControlName="checkinGraceMinutes" min="0" />
            <mat-hint>Minutos de tolerancia en check-in</mat-hint>
          </mat-form-field>

          <h3 class="section span-full">Recibos</h3>
          <mat-form-field appearance="outline" class="span-full">
            <mat-label>Pie de página del recibo</mat-label>
            <textarea matInput formControlName="receiptFooterText" rows="2"></textarea>
          </mat-form-field>

          <div class="actions span-full">
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              Guardar configuración
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .section { grid-column: 1/-1; color: var(--brand); margin: 12px 0 4px; font-size: 1rem; }
    .span-full { grid-column: 1/-1; }
    .toggle-row { padding: 8px 0; }
    .actions { display: flex; justify-content: flex-end; padding-top: 8px; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class GymSettingsComponent implements OnInit {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private store  = inject(AuthStore);
  private fb     = inject(FormBuilder);

  loading = signal(false);

  form = this.fb.group({
    currency:                    ['COP'],
    timezone:                    ['America/Bogota'],
    openingTime:                 ['06:00'],
    closingTime:                 ['22:00'],
    maxCapacity:                 [100],
    allowCheckinWithoutMembership: [false],
    checkinGraceMinutes:         [15],
    daysBeforeExpiryAlert:       [7],
    receiptFooterText:           ['Gracias por usar Trainix'],
  });

  ngOnInit(): void {
    this.api.get<any>('settings').subscribe((s) => this.form.patchValue(s));
  }

  submit(): void {
    this.loading.set(true);
    this.api.put('settings', this.form.value).subscribe({
      next: () => { this.notify.success('Configuración guardada'); this.loading.set(false); },
      error: () => { this.notify.error('Error al guardar'); this.loading.set(false); },
    });
  }
}
