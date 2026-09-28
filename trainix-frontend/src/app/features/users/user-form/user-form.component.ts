import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ROLE_LABELS, compact, label } from '../../../shared/labels';

interface Role { id: string; name: string; }

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatCardModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Editar usuario' : 'Nuevo usuario'" />

    <mat-card style="max-width: 520px;">
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form">
          <mat-form-field appearance="outline">
            <mat-label>Nombres</mat-label>
            <input matInput formControlName="firstName" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Apellidos</mat-label>
            <input matInput formControlName="lastName" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Teléfono</mat-label>
            <input matInput formControlName="phone" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Rol</mat-label>
            <mat-select formControlName="roleId">
              @for (role of roles(); track role.id) {
                <mat-option [value]="role.id">{{ roleLabel(role.name) }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
          @if (!isEdit()) {
            <mat-form-field appearance="outline">
              <mat-label>Contraseña inicial</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
          }
          <div class="actions">
            <button mat-button type="button" (click)="router.navigate(['/users'])">Cancelar</button>
            <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
              {{ isEdit() ? 'Guardar' : 'Crear usuario' }}
            </button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.form { display: flex; flex-direction: column; gap: 4px; } .actions { display: flex; justify-content: flex-end; gap: 12px; }`],
})
export class UserFormComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private route  = inject(ActivatedRoute);
  router         = inject(Router);

  isEdit  = signal(false);
  loading = signal(false);
  roles   = signal<Role[]>([]);
  private userId = '';

  form = this.fb.group({
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    email:     ['', [Validators.required, Validators.email]],
    phone:     [''],
    roleId:    ['', Validators.required],
    password:  [''],
  });

  ngOnInit(): void {
    // Solo roles del staff del gimnasio.
    this.api.get<Role[]>('roles').subscribe((r) =>
      this.roles.set(r.filter((x) => !['super_admin', 'member'].includes(x.name))),
    );
    this.userId = this.route.snapshot.params['id'];
    if (this.userId) {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.api.get<any>(`users/${this.userId}`).subscribe((u) => this.form.patchValue(u));
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  roleLabel(name: string): string { return label(ROLE_LABELS, name); }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const { password, ...fields } = this.form.getRawValue();
    const obs = this.isEdit()
      ? this.api.put(`users/${this.userId}`, compact(fields))
      : this.api.post('users', compact({ ...fields, password }));
    obs.subscribe({
      next: () => { this.notify.success(this.isEdit() ? 'Usuario actualizado' : 'Usuario creado'); this.router.navigate(['/users']); },
      error: (err) => { this.notify.error(err?.error?.error?.message ?? 'Error'); this.loading.set(false); },
    });
  }
}
