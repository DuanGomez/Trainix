import { Routes } from '@angular/router';

export const ROUTINES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./routines-list/routines-list.component').then((m) => m.RoutinesListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./routine-builder/routine-builder.component').then((m) => m.RoutineBuilderComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./routine-builder/routine-builder.component').then((m) => m.RoutineBuilderComponent),
  },
];
