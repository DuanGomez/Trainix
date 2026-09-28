import { Routes } from '@angular/router';

export const ATTENDANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./checkin-panel/checkin-panel.component').then((m) => m.CheckinPanelComponent),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./attendance-history/attendance-history.component').then((m) => m.AttendanceHistoryComponent),
  },
];
