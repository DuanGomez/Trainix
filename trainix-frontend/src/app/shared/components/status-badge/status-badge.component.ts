import { Component, input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge-' + status()">{{ label() }}</span>`,
  styles: [`
    .badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 980px;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase;
      color: var(--tx-text-2); background: rgba(255, 255, 255, 0.06);
    }
    .badge::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
    .badge-active, .badge-completed   { color: var(--tx-green); background: rgba(46, 229, 157, 0.12); }
    .badge-expired, .badge-failed     { color: var(--tx-red); background: rgba(255, 82, 82, 0.12); }
    .badge-frozen                     { color: var(--tx-blue); background: rgba(77, 163, 255, 0.12); }
    .badge-cancelled                  { color: var(--tx-text-3); background: rgba(255, 255, 255, 0.05); }
    .badge-pending, .badge-pending_payment { color: var(--tx-yellow); background: var(--tx-yellow-soft); }
    .badge-refunded                   { color: #c58cff; background: rgba(197, 140, 255, 0.12); }
  `],
})
export class StatusBadgeComponent {
  status = input.required<string>();
  label  = input.required<string>();
}
