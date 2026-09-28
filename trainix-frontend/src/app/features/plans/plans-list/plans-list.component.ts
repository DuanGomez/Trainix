import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { PLAN_DURATIONS } from '../../../shared/labels';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Plan {
  id: string;
  name: string;
  description: string;
  duration: string;
  durationDays: number;
  price: number;
  color: string;
  isActive: boolean;
  maxFreezes: number;
  allowsGuest: boolean;
  includesClasses: boolean;
}

@Component({
  selector: 'app-plans-list',
  standalone: true,
  imports: [
    CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, PageHeaderComponent,

  ],
  template: `
    <app-page-header
      title="Planes"
      subtitle="Planes de membresía disponibles"
      actionLabel="Nuevo plan"
      actionIcon="add"
      (actionClick)="router.navigate(['/plans/new'])" />

    <div class="plans-grid">
      @for (plan of plans(); track plan.id) {
        <mat-card class="plan-card" [style.borderTop]="'4px solid ' + (plan.color || '#3D5AFE')">
          <mat-card-header>
            <mat-card-title>{{ plan.name }}</mat-card-title>
            <mat-card-subtitle>{{ durationLabel(plan.duration) }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p class="price">{{ plan.price | currency:'COP':'symbol-narrow':'1.0-0' }}</p>
            @if (plan.description) { <p class="desc">{{ plan.description }}</p> }
            <div class="features">
              @if (plan.allowsGuest) {
                <mat-chip>Permite acompañante</mat-chip>
              }
              @if (plan.includesClasses) {
                <mat-chip>Incluye clases</mat-chip>
              }
              @if (plan.maxFreezes > 0) {
                <mat-chip>{{ plan.maxFreezes }} congelamiento(s)</mat-chip>
              }
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-icon-button (click)="router.navigate(['/plans', plan.id, 'edit'])">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deletePlan(plan)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .plan-card { cursor: default; }
    .price { font-size: 1.9rem; font-weight: 800; letter-spacing: -0.03em; color: #1d1d1f; margin: 8px 0; }
    .desc { color: #666; font-size: 0.9rem; }
    .features { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  `],
})
export class PlansListComponent implements OnInit {
  private api    = inject(ApiService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);
  router         = inject(Router);

  plans = signal<Plan[]>([]);

  ngOnInit(): void {
    this.api.get<Plan[]>('plans').subscribe((p) => this.plans.set(p));
  }

  durationLabel(d: string): string {
    return PLAN_DURATIONS.find((x) => x.value === d)?.label ?? d;
  }

  deletePlan(plan: Plan): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar plan', message: `¿Eliminar el plan "${plan.name}"? Las membresías existentes no se verán afectadas.`, confirmLabel: 'Eliminar', danger: true },
    }).afterClosed().subscribe((ok) => {
      if (!ok) return;
      this.api.delete(`plans/${plan.id}`).subscribe({
        next: () => { this.notify.success('Plan eliminado'); this.plans.update((p) => p.filter((x) => x.id !== plan.id)); },
        error: () => this.notify.error('No se pudo eliminar el plan'),
      });
    });
  }
}
