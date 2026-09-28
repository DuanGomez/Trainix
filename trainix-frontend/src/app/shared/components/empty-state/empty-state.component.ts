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
      justify-content: center; padding: 48px 24px; text-align: center; color: #9e9e9e;
    }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; margin-bottom: 16px; opacity: .4; }
    h3 { margin: 0 0 8px; font-size: 1.2rem; color: #616161; }
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
