import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Plan { id: string; name: string; price: number; durationDays: number; duration: string; }

@Component({
  selector: 'app-membership-assign',
  standalone: true,
  imports: [
    ReactiveFormsModule, CurrencyPipe, DatePipe,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatCardModule, MatDatepickerModule, MatNativeDateModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header title="Asignar membresía" />

    <mat-card style="max-width: 600px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Código o documento del cliente</mat-label>
            <input matInput formControlName="memberId" placeholder="TX-0001 o número de documento" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Plan</mat-label>
            <mat-select formControlName="planId" (selectionChange)="onPlanChange($event.value)">
              @for (plan of plans(); track plan.id) {
                <mat-option [value]="plan.id">
                  {{ plan.name }} — {{ plan.price | currency:'COP':'symbol-narrow':'1.0-0' }}
                </mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de inicio</mat-label>
            <input matInput [matDatepicker]="dp" formControlName="startDate" />
            <mat-datepicker-toggle matSuffix [for]="dp" />
            <mat-datepicker #dp />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Valor pagado</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput type="number" formControlName="pricePaid" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Descuento</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput type="number" formControlName="discountAmount" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Notas</mat-label>
            <textarea matInput formControlName="notes" rows="2"></textarea>
          </mat-form-field>

          @if (selectedPlan()) {
            <div class="plan-info">
              Duración: <strong>{{ selectedPlan()!.durationDays }} días</strong>
              — Fecha fin estimada: <strong>{{ endDate() | date:'dd/MM/yyyy' }}</strong>
            </div>
          }

          <div class="actions">
            <button mat-button type="button" (click)="router.navigate(['/memberships'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              Asignar membresía
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; }
    .plan-info { background: #e8f5e9; padding: 12px; border-radius: 8px; font-size: 0.9rem; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; }
  `],
})
export class MembershipAssignComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private route  = inject(ActivatedRoute);
  router         = inject(Router);

  plans        = signal<Plan[]>([]);
  selectedPlan = signal<Plan | null>(null);
  loading      = signal(false);

  form = this.fb.group({
    memberId:       ['', Validators.required],
    planId:         ['', Validators.required],
    startDate:      [new Date(), Validators.required],
    pricePaid:      [0, [Validators.required, Validators.min(0)]],
    discountAmount: [0],
    notes:          [''],
  });

  endDate = signal<Date | null>(null);

  ngOnInit(): void {
    const memberId = this.route.snapshot.queryParamMap.get('memberId');
    if (memberId) this.form.patchValue({ memberId });
    this.api.get<Plan[]>('plans').subscribe((p) => this.plans.set(p));
    this.form.controls.startDate.valueChanges.subscribe(() => this.updateEndDate());
  }

  onPlanChange(planId: string): void {
    const plan = this.plans().find((p) => p.id === planId) ?? null;
    this.selectedPlan.set(plan);
    if (plan) this.form.patchValue({ pricePaid: plan.price });
    this.updateEndDate();
  }

  private updateEndDate(): void {
    const plan = this.selectedPlan();
    if (!plan) { this.endDate.set(null); return; }
    const end = new Date(this.form.value.startDate ?? new Date());
    end.setDate(end.getDate() + plan.durationDays);
    this.endDate.set(end);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const raw = this.form.getRawValue();
    const dto = { ...raw, startDate: new Date(raw.startDate ?? new Date()).toISOString() };
    this.api.post('memberships', dto).subscribe({
      next: () => {
        // La membresía queda pendiente hasta registrar su pago.
        this.notify.success('Membresía asignada. Registra el pago para activarla.');
        this.router.navigate(['/payments/new'], {
          queryParams: {
            memberId: raw.memberId,
            amount: Number(raw.pricePaid) - Number(raw.discountAmount || 0),
            concept: 'membership',
          },
        });
      },
      error: (err) => {
        this.notify.error(err?.error?.error?.message ?? 'Error al asignar');
        this.loading.set(false);
      },
    });
  }
}
