import { Routes } from '@angular/router';

export const REPORTS_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'financial',
    pathMatch: 'full',
  },
  {
    path: 'financial',
    loadComponent: () =>
      import('./financial-report/financial-report.component').then((m) => m.FinancialReportComponent),
  },
];
