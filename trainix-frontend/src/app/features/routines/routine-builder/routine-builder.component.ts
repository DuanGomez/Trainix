import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { WEEKDAYS, compact } from '../../../shared/labels';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';


@Component({
  selector: 'app-routine-builder',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatCardModule, MatIconModule,
    MatExpansionModule, PageHeaderComponent,
  ],
  template: `
    <app-page-header [title]="isEdit() ? 'Editar rutina' : 'Nueva rutina'" />

    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-card class="info-card">
        <mat-card-header><mat-card-title>Información general</mat-card-title></mat-card-header>
        <mat-card-content class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Nombre de la rutina</mat-label>
            <input matInput formControlName="name" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Código o documento del cliente</mat-label>
            <input matInput formControlName="memberId" placeholder="TX-0001 o número de documento" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Objetivo</mat-label>
            <input matInput formControlName="objective" />
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Dificultad</mat-label>
            <mat-select formControlName="difficulty">
              <mat-option value="beginner">Principiante</mat-option>
              <mat-option value="intermediate">Intermedio</mat-option>
              <mat-option value="advanced">Avanzado</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Duración (semanas)</mat-label>
            <input matInput type="number" formControlName="durationWeeks" min="1" />
          </mat-form-field>
        </mat-card-content>
      </mat-card>

      <mat-card class="days-card">
        <mat-card-header>
          <mat-card-title>Días de entrenamiento</mat-card-title>
          <button mat-icon-button type="button" (click)="addDay()">
            <mat-icon>add_circle</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content>
          <mat-accordion formArrayName="days">
            @for (day of daysArray.controls; track $index; let i = $index) {
              <mat-expansion-panel [formGroupName]="i">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    {{ weekdayLabel(day.get('day')?.value) }} — {{ day.get('label')?.value || 'Sin título' }}
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <div class="day-form">
                  <mat-form-field appearance="outline">
                    <mat-label>Día</mat-label>
                    <mat-select formControlName="day">
                      @for (wd of weekdays; track wd.value) {
                        <mat-option [value]="wd.value">{{ wd.label }}</mat-option>
                      }
                    </mat-select>
                  </mat-form-field>
                  <mat-form-field appearance="outline">
                    <mat-label>Etiqueta</mat-label>
                    <input matInput formControlName="label" placeholder="Ej: Pecho y tríceps" />
                  </mat-form-field>
                </div>

                <button mat-stroked-button color="warn" type="button" (click)="removeDay(i)">
                  <mat-icon>delete</mat-icon> Eliminar día
                </button>
              </mat-expansion-panel>
            }
          </mat-accordion>
        </mat-card-content>
      </mat-card>

      <div class="form-actions">
        <button mat-button type="button" (click)="router.navigate(['/routines'])">Cancelar</button>
        <button mat-flat-button color="primary" type="submit" [disabled]="loading()">
          {{ isEdit() ? 'Guardar cambios' : 'Crear rutina' }}
        </button>
      </div>
    </form>
  `,
  styles: [`
    .info-card { margin-bottom: 16px; }
    .days-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
    .day-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px; }
    @media (max-width: 600px) { .form-grid, .day-form { grid-template-columns: 1fr; } }
  `],
})
export class RoutineBuilderComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private route  = inject(ActivatedRoute);
  router         = inject(Router);

  isEdit  = signal(false);
  loading = signal(false);
  weekdays = WEEKDAYS;
  private routineId = '';

  form = this.fb.group({
    name:          ['', Validators.required],
    memberId:      ['', Validators.required],
    objective:     [''],
    difficulty:    ['intermediate'],
    durationWeeks: [4],
    days:          this.fb.array([]),
  });

  get daysArray() { return this.form.get('days') as FormArray; }

  ngOnInit(): void {
    this.routineId = this.route.snapshot.params['id'];
    if (this.routineId) {
      this.isEdit.set(true);
      this.api.get<any>(`routines/${this.routineId}`).subscribe((r) => {
        this.form.patchValue({ ...r, memberId: r.member?.memberCode ?? r.memberId, objective: r.objective ?? '' });
        r.days?.forEach((d: any) => this.addDay(d));
      });
    }
  }

  addDay(data?: any): void {
    this.daysArray.push(this.fb.group({
      day:        [data?.day ?? 'monday'],
      label:      [data?.label ?? ''],
      orderIndex: [this.daysArray.length],
    }));
  }

  removeDay(i: number): void { this.daysArray.removeAt(i); }

  weekdayLabel(v: string): string {
    return WEEKDAYS.find((w) => w.value === v)?.label ?? 'Día';
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    const raw = this.form.getRawValue() as any;
    const dto = {
      ...compact(raw),
      durationWeeks: Number(raw.durationWeeks) || undefined,
      days: raw.days.map((d: any, i: number) => ({ ...compact(d), orderIndex: i })),
    };
    const obs = this.isEdit()
      ? this.api.put(`routines/${this.routineId}`, dto)
      : this.api.post('routines', dto);
    obs.subscribe({
      next: () => { this.notify.success(this.isEdit() ? 'Rutina actualizada' : 'Rutina creada'); this.router.navigate(['/routines']); },
      error: (err) => { this.notify.error(err?.error?.error?.message ?? 'Error al guardar la rutina'); this.loading.set(false); },
    });
  }
}
