import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./payments-list/payments-list.component').then((m) => m.PaymentsListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./payment-form/payment-form.component').then((m) => m.PaymentFormComponent),
  },
];
