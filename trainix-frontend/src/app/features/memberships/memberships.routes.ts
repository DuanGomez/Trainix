import { Routes } from '@angular/router';

export const MEMBERSHIPS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./memberships-list/memberships-list.component').then((m) => m.MembershipsListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./membership-assign/membership-assign.component').then((m) => m.MembershipAssignComponent),
  },
];
