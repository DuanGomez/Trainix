import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-icon">{{ icon() }}</mat-icon>
      <h3>{{ title() }}</h3>
      <p>{{ message() }}</p>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="actionClick.emit()">
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; padding: 48px 24px; text-align: center; color: var(--tx-text-3);
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; color: var(--tx-yellow); opacity: .5; }
    h3 { margin: 0 0 8px; font-family: var(--tx-display); font-size: 1.6rem; font-weight: 800; text-transform: uppercase; color: var(--tx-text-2); }
    p { margin: 0 0 24px; font-size: 0.9rem; }
  `],
})
export class EmptyStateComponent {
  icon        = input('inbox');
  title       = input('Sin resultados');
  message     = input('No hay datos para mostrar.');
  actionLabel = input('');
  actionClick = output<void>();
}
