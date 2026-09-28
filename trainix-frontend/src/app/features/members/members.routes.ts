import { Routes } from '@angular/router';

export const MEMBERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./members-list/members-list.component').then((m) => m.MembersListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./member-form/member-form.component').then((m) => m.MemberFormComponent),
  },
  {
    path: ':id',
    redirectTo: ':id/edit',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./member-form/member-form.component').then((m) => m.MemberFormComponent),
  },
];
