import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { compact } from '../../../shared/labels';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, CurrencyPipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCardModule, MatIconModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Registrar pago" />

    <mat-card style="max-width: 600px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Código o documento del cliente</mat-label>
            <input matInput formControlName="memberId" placeholder="TX-0001 o número de documento" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Concepto</mat-label>
            <mat-select formControlName="concept">
              <mat-option value="membership">Membresía</mat-option>
              <mat-option value="service">Servicio / clase</mat-option>
              <mat-option value="product">Producto</mat-option>
              <mat-option value="other">Otro</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Monto</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput type="number" formControlName="amount" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descuento</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput type="number" formControlName="discount" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Método de pago</mat-label>
            <mat-select formControlName="method">
              <mat-option value="cash">Efectivo</mat-option>
              <mat-option value="transfer">Transferencia</mat-option>
              <mat-option value="card">Tarjeta</mat-option>
              <mat-option value="other">Otro</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Referencia / observaciones</mat-label>
            <input matInput formControlName="notes" />
          </mat-form-field>

          <div class="total-row">
            <strong>Total:</strong>
            <span class="total-value">
              {{ total() | currency:'COP':'symbol-narrow':'1.0-0' }}
            </span>
          </div>

          <div class="actions">
            <button mat-button type="button" (click)="router.navigate(['/payments'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              Registrar pago
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; }
    .total-row { display: flex; justify-content: space-between; padding: 12px 0; font-size: 1.1rem; }
    .total-value { color: var(--brand); font-weight: 700; font-size: 1.3rem; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; }
  `],
})
export class PaymentFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  router         = inject(Router);
  private route  = inject(ActivatedRoute);

  loading = signal(false);
  total   = signal(0);

  form = this.fb.group({
    memberId: ['', Validators.required],
    concept:  ['membership', Validators.required],
    amount:   [0, [Validators.required, Validators.min(1)]],
    discount: [0],
    method:   ['cash', Validators.required],
    notes:    [''],
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe((v) => {
      this.total.set(Number(v.amount ?? 0) - Number(v.discount ?? 0));
    });

    // Viene desde "Asignar membresía" con el cliente y el valor precargados.
    const q = this.route.snapshot.queryParamMap;
    this.form.patchValue({
      memberId: q.get('memberId') ?? '',
      concept: q.get('concept') ?? 'membership',
      amount: Number(q.get('amount')) || 0,
    });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const v = this.form.getRawValue();
    const dto = compact({ ...v, amount: Number(v.amount), discount: Number(v.discount) || 0 });
    this.api.post('payments', dto).subscribe({
      next: () => {
        this.notify.success('Pago registrado exitosamente');
        this.router.navigate(['/payments']);
      },
      error: (err) => {
        this.notify.error(err?.error?.error?.message ?? 'Error al registrar pago');
        this.loading.set(false);
      },
    });
  }
}
