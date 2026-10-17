import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge-' + status()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex; align-items: center;
      padding: 4px 10px; border-radius: 980px;
      font-size: 0.76rem; font-weight: 600;
      color: var(--tx-text-2); background: var(--tx-surface-2);
    }
    .badge-active, .badge-completed   { color: var(--tx-green); background: var(--tx-green-soft); }
    .badge-expired, .badge-failed     { color: var(--tx-red); background: var(--tx-red-soft); }
    .badge-frozen                     { color: var(--tx-blue); background: var(--tx-blue-soft); }
    .badge-cancelled                  { color: var(--tx-text-3); background: var(--tx-surface-2); }
    .badge-pending, .badge-pending_payment { color: var(--tx-yellow-ink); background: var(--tx-yellow-soft); }
    .badge-refunded                   { color: #7c3aed; background: #f1eafe; }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();
  label  = input.required<string>();
}
