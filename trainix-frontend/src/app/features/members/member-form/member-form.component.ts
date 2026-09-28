import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MembersService } from '../services/members.service';
import { NotificationService } from '../../../core/services/notification.service';
import { minAgeValidator } from '../../../shared/validators/min-age.validator';
import { compact, toDateOnly } from '../../../shared/labels';

@Component({
  selector: 'app-member-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageHeaderComponent,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatDatepickerModule, MatNativeDateModule,
    MatCardModule, MatIconModule,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Editar cliente' : 'Nuevo cliente'" />

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <h3 class="section-title">Datos personales</h3>

          <mat-form-field appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="firstName" />
            @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="lastName" />
            @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo de documento</mat-label>
            <mat-select formControlName="documentType">
              <mat-option value="CC">Cédula de ciudadanía</mat-option>
              <mat-option value="CE">Cédula de extranjería</mat-option>
              <mat-option value="TI">Tarjeta de identidad</mat-option>
              <mat-option value="PASAPORTE">Pasaporte</mat-option>
              <mat-option value="NIT">NIT</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Número de documento</mat-label>
            <input matInput formControlName="documentNumber" />
            @if (form.get('documentNumber')?.invalid && form.get('documentNumber')?.touched) {
              <mat-error>Requerido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email" />
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Correo inválido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Fecha de nacimiento</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="birthDate" />
            <mat-datepicker-toggle matSuffix [for]="picker" />
            <mat-datepicker #picker />
            @if (form.get('birthDate')?.hasError('required')) {
              <mat-error>Requerido</mat-error>
            }
            @if (form.get('birthDate')?.hasError('minAge')) {
              <mat-error>Debe ser mayor de 14 años</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Género</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="M">Masculino</mat-option>
              <mat-option value="F">Femenino</mat-option>
              <mat-option value="OTHER">Otro</mat-option>
            </mat-select>
          </mat-form-field>

          <h3 class="section-title span-full">Contacto de emergencia</h3>

          <mat-form-field appearance="outline">
            <mat-label>Nombre de contacto</mat-label>
            <input matInput formControlName="emergencyContactName" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Teléfono de contacto</mat-label>
            <input matInput formControlName="emergencyContactPhone" />
          </mat-form-field>

          <h3 class="section-title span-full">Información adicional</h3>

          <mat-form-field appearance="outline" class="span-full">
            <mat-label>Objetivo</mat-label>
            <textarea matInput formControlName="objective" rows="2"></textarea>
          </mat-form-field>

          <mat-form-field appearance="outline" class="span-full">
            <mat-label>Notas de salud / lesiones</mat-label>
            <textarea matInput formControlName="healthNotes" rows="3"></textarea>
          </mat-form-field>

          <div class="form-actions span-full">
            <button mat-button type="button" (click)="router.navigate(['/members'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              {{ isEdit() ? 'Guardar cambios' : 'Crear cliente' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .section-title { grid-column: 1/-1; margin: 8px 0 4px; color: var(--brand); font-size: 1rem; }
    .span-full { grid-column: 1/-1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 8px; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
  `],
})
export class MemberFormComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private svc     = inject(MembersService);
  private notify  = inject(NotificationService);
  private route   = inject(ActivatedRoute);
  router          = inject(Router);

  isEdit  = signal(false);
  loading = signal(false);
  private memberId = '';

  form = this.fb.group({
    firstName:             ['', Validators.required],
    lastName:              ['', Validators.required],
    documentType:          ['CC', Validators.required],
    documentNumber:        ['', Validators.required],
    email:                 ['', [Validators.email]],
    phone:                 [''],
    birthDate:             [null as any, [Validators.required, minAgeValidator(14)]],
    gender:                [''],
    emergencyContactName:  [''],
    emergencyContactPhone: [''],
    objective:             [''],
    healthNotes:           [''],
  });

  ngOnInit(): void {
    this.memberId = this.route.snapshot.params['id'];
    if (this.memberId) {
      this.isEdit.set(true);
      this.svc.getById(this.memberId).subscribe((m) =>
        this.form.patchValue({ ...m, birthDate: m.birthDate ? new Date(`${m.birthDate}T00:00:00`) : null } as any),
      );
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const raw = this.form.getRawValue();
    const dto = compact({ ...raw, birthDate: toDateOnly(raw.birthDate) }) as any;
    const obs = this.isEdit()
      ? this.svc.update(this.memberId, dto)
      : this.svc.create(dto);

    obs.subscribe({
      next: () => {
        this.notify.success(this.isEdit() ? 'Cliente actualizado' : 'Cliente creado');
        this.router.navigate(['/members']);
      },
      error: (err) => {
        this.notify.error(err?.error?.error?.message ?? 'Error al guardar');
        this.loading.set(false);
      },
    });
  }
}
