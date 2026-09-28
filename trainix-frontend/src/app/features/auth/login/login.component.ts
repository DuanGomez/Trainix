import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../../environments/environment';
import { DEMO_CREDENTIALS } from '../../../core/demo/demo-data';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
      <h2 class="form-title">Iniciar sesión</h2>

      @if (isDemo) {
        <div class="demo-banner">
          <mat-icon>info</mat-icon>
          <div>
            <strong>Modo demo</strong> — los datos se guardan en tu navegador.
            <div class="demo-users">
              @for (c of demoCredentials; track c.email) {
                <button type="button" mat-stroked-button (click)="fillDemo(c.email)">{{ c.label }}</button>
              }
            </div>
          </div>
        </div>
      }

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Correo electrónico</mat-label>
        <mat-icon matPrefix>email</mat-icon>
        <input matInput type="email" formControlName="email" autocomplete="email" />
        @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
          <mat-error>El correo es requerido</mat-error>
        }
        @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
          <mat-error>Correo inválido</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Contraseña</mat-label>
        <mat-icon matPrefix>lock</mat-icon>
        <input matInput
               [type]="showPassword() ? 'text' : 'password'"
               formControlName="password"
               autocomplete="current-password" />
        <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())">
          <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
          <mat-error>La contraseña es requerida</mat-error>
        }
      </mat-form-field>

      @if (errorMessage()) {
        <div class="error-banner">{{ errorMessage() }}</div>
      }

      <button mat-flat-button
              color="primary"
              type="submit"
              class="full-width submit-btn"
              [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Ingresar
        }
      </button>

      <a routerLink="/auth/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>
    </form>
  `,
  styles: [`
    .login-form { display: flex; flex-direction: column; gap: 16px; }
    .form-title { text-align: center; color: #1a237e; font-size: 1.4rem; font-weight: 600; margin: 0 0 8px; }
    .full-width { width: 100%; }
    .submit-btn { height: 48px; font-size: 1rem; font-weight: 600; }
    .error-banner {
      background: #ffebee; color: #c62828;
      padding: 12px; border-radius: 8px;
      text-align: center; font-size: 0.9rem;
    }
    .forgot-link { text-align: center; color: #1976d2; font-size: 0.875rem; text-decoration: none; }
    .forgot-link:hover { text-decoration: underline; }
    mat-spinner { margin: 0 auto; }
    .demo-banner {
      display: flex; gap: 10px; align-items: flex-start;
      background: #e8eaf6; color: #1a237e; padding: 12px; border-radius: 8px; font-size: 0.85rem;
    }
    .demo-users { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  `],
})
export class LoginComponent {
  private fb       = inject(FormBuilder);
  private authSvc  = inject(AuthService);
  private notify   = inject(NotificationService);
  private router   = inject(Router);

  loading      = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');
  isDemo       = environment.demo;
  demoCredentials = DEMO_CREDENTIALS;

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  fillDemo(email: string): void {
    this.form.setValue({ email, password: DEMO_CREDENTIALS[0].password });
    this.submit();
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.form.getRawValue();
    this.authSvc.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        const msg = err?.error?.error?.message ?? 'Credenciales incorrectas';
        this.errorMessage.set(msg);
        this.loading.set(false);
      },
    });
  }
}
