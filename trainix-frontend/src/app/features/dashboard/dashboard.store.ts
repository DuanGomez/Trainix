import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { forkJoin } from 'rxjs';

export interface DashboardSummary {
  totalMembers: number;
  activeMembers: number;
  todayAttendance: number;
  todayRevenue: number;
  expiringMemberships: number;
  monthRevenue: number;
  newMembersMonth: number;
  openCashSession: boolean;
}

export interface ChartPoint { label: string; value: number; }

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private api = inject(ApiService);

  private _summary   = signal<DashboardSummary | null>(null);
  private _revenue   = signal<ChartPoint[]>([]);
  private _attendance = signal<ChartPoint[]>([]);
  private _loading   = signal(false);

  summary    = computed(() => this._summary());
  revenue    = computed(() => this._revenue());
  attendance = computed(() => this._attendance());
  loading    = computed(() => this._loading());

  load(): void {
    this._loading.set(true);
    forkJoin({
      summary:    this.api.get<DashboardSummary>('dashboard/summary'),
      revenue:    this.api.get<ChartPoint[]>('dashboard/revenue-chart'),
      attendance: this.api.get<ChartPoint[]>('dashboard/attendance-chart'),
    }).subscribe({
      next: ({ summary, revenue, attendance }) => {
        this._summary.set(summary);
        this._revenue.set(revenue);
        this._attendance.set(attendance);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }
}
