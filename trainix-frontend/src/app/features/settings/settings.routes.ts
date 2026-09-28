import { Routes } from '@angular/router';

export const SETTINGS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./gym-settings/gym-settings.component').then((m) => m.GymSettingsComponent),
  },
];
