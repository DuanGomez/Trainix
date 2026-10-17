import { Component, input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (src()) {
      <img [src]="src()" [alt]="initials()" class="avatar" [style.width.px]="size()" [style.height.px]="size()" />
    } @else {
      <div class="avatar-placeholder"
           [style.width.px]="size()"
           [style.height.px]="size()"
           [style.fontSize.px]="size() * 0.4">
        {{ initials() }}
      </div>
    }
  `,
  styles: [`
    .avatar { border-radius: 50%; object-fit: cover; }
    .avatar-placeholder {
      border-radius: 50%; background: var(--tx-surface-2); color: var(--tx-text); border: 1px solid var(--tx-line);
      display: flex; align-items: center; justify-content: center;
      font-weight: 600; flex-shrink: 0;
    }
  `],
})
export class AvatarComponent {
  src      = input<string>('');
  initials = input.required<string>();
  size     = input<number>(40);
}
