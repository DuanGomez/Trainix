import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
  ],
  template: `
    @if (!sent()) {
      <form [formGroup]="form" (ngSubmit)="submit()" class="form">
        <h2 class="form-title">Recuperar contraseña</h2>
        <p class="subtitle">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Correo electrónico</mat-label>
          <mat-icon matPrefix>email</mat-icon>
          <input matInput type="email" formControlName="email" />
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <mat-error>Ingresa un correo válido</mat-error>
          }
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit" class="full-width">
          Enviar enlace
        </button>
        <a routerLink="/auth/login" mat-button class="full-width">Volver al inicio</a>
      </form>
    } @else {
      <div class="success-state">
        <mat-icon class="success-icon">mark_email_read</mat-icon>
        <h2>Revisa tu correo</h2>
        <p>Si el correo existe en nuestro sistema, recibirás las instrucciones pronto.</p>
        <a routerLink="/auth/login" mat-flat-button color="primary">Volver al inicio</a>
      </div>
    }
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 16px; }
    .form-title { margin: 0; font-family: var(--tx-display); font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 2.6rem; line-height: .95; color: var(--tx-text); }
    .subtitle { color: var(--tx-text-2); font-size: 0.95rem; margin: 0 0 8px; }
    .full-width { width: 100%; }
    .success-state { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .success-icon { font-size: 64px; width: 64px; height: 64px; color: var(--tx-yellow); }
    .success-state h2 { font-family: var(--tx-display); font-weight: 900; font-style: italic; text-transform: uppercase; font-size: 2.2rem; margin: 0; }
    .success-state p { color: var(--tx-text-2); margin: 0 0 8px; }
  `],
})
export class ForgotPasswordComponent {
  private fb     = inject(FormBuilder);
  private api    = inject(ApiService);
  private notify = inject(NotificationService);

  sent = signal(false);

  form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.api.post('auth/forgot-password', this.form.value).subscribe({
      next: () => this.sent.set(true),
      error: () => this.sent.set(true), // Don't reveal if email exists
    });
  }
}
