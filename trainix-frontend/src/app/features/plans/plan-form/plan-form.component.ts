import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PLAN_DURATIONS } from '../../../shared/labels';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-plan-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatCardModule,
    MatCheckboxModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Editar plan' : 'Nuevo plan'" />

    <mat-card style="max-width: 640px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <mat-form-field appearance="outline" class="span-full">
            <mat-label>Nombre del plan</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-full">
            <mat-label>Descripción</mat-label>
            <textarea matInput formControlName="description" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Duración</mat-label>
            <mat-select formControlName="duration" (selectionChange)="onDurationChange($event.value)">
              @for (d of durations; track d.value) {
                <mat-option [value]="d.value">{{ d.label }}</mat-option>
              }
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Días de duración</mat-label>
            <input matInput type="number" formControlName="durationDays" min="1" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Precio</mat-label>
            <span matPrefix>$&nbsp;</span>
            <input matInput type="number" formControlName="price" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Congelamientos permitidos</mat-label>
            <input matInput type="number" formControlName="maxFreezes" min="0" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Color (hex)</mat-label>
            <input matInput formControlName="color" placeholder="#FFC800" />
          </mat-form-field>

          <div class="checks span-full">
            <mat-checkbox formControlName="allowsGuest">Permite acompañante</mat-checkbox>
            <mat-checkbox formControlName="includesClasses">Incluye clases</mat-checkbox>
          </div>

          <div class="actions span-full">
            <button mat-button type="button" (click)="router.navigate(['/plans'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              {{ isEdit() ? 'Guardar cambios' : 'Crear plan' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .span-full { grid-column: 1/-1; }
    .checks { display: flex; gap: 24px; align-items: center; }
    .actions { display: flex; justify-content: flex-end; gap: 12px; }
  `],
})
export class PlanFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private route  = inject(ActivatedRoute);
  router         = inject(Router);

  isEdit  = signal(false);
  loading = signal(false);
  private planId = '';
  durations = PLAN_DURATIONS;

  form = this.fb.group({
    name:           ['', Validators.required],
    description:    [''],
    duration:       ['monthly', Validators.required],
    durationDays:   [30, [Validators.required, Validators.min(1)]],
    price:          [0, [Validators.required, Validators.min(0)]],
    maxFreezes:     [0],
    allowsGuest:    [false],
    includesClasses:[false],
    color:          ['#FFC800'],
  });

  ngOnInit(): void {
    this.planId = this.route.snapshot.params['id'];
    if (this.planId) {
      this.isEdit.set(true);
      this.api.get<any>(`plans/${this.planId}`).subscribe((p) =>
        this.form.patchValue({ ...p, description: p.description ?? '' }),
      );
    }
  }

  onDurationChange(value: string): void {
    const d = PLAN_DURATIONS.find((x) => x.value === value);
    if (d) this.form.patchValue({ durationDays: d.days });
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const obs = this.isEdit()
      ? this.api.put(`plans/${this.planId}`, this.form.value)
      : this.api.post('plans', this.form.value);

    obs.subscribe({
      next: () => { this.notify.success(this.isEdit() ? 'Plan actualizado' : 'Plan creado'); this.router.navigate(['/plans']); },
      error: () => { this.notify.error('Error al guardar el plan'); this.loading.set(false); },
    });
  }
}
