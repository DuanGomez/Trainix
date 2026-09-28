import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge-' + status()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-block; padding: 2px 10px;
      border-radius: 12px; font-size: 0.75rem; font-weight: 600;
    }
    .badge-active, .badge-completed   { background: #e8f5e9; color: #2e7d32; }
    .badge-expired, .badge-failed     { background: #ffebee; color: #c62828; }
    .badge-frozen                     { background: #e3f2fd; color: #1565c0; }
    .badge-cancelled                  { background: #fafafa; color: #616161; border: 1px solid #e0e0e0; }
    .badge-pending, .badge-pending_payment { background: #fff8e1; color: #e65100; }
    .badge-refunded                   { background: #f3e5f5; color: #6a1b9a; }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();
  label  = input.required<string>();
}
