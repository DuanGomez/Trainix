import { Routes } from '@angular/router';

export const CASH_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./cash-dashboard/cash-dashboard.component').then((m) => m.CashDashboardComponent),
  },
];
