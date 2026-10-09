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
      <header class="head">
        <h2 class="title">Bienvenido<br /><span>de vuelta</span></h2>
        <p class="sub">Ingresa a tu panel de gestión.</p>
      </header>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Correo electrónico</mat-label>
        <mat-icon matPrefix>alternate_email</mat-icon>
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
        <button mat-icon-button matSuffix type="button" (click)="showPassword.set(!showPassword())"
                [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Mostrar contraseña'">
          <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
        </button>
        @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
          <mat-error>La contraseña es requerida</mat-error>
        }
      </mat-form-field>

      @if (errorMessage()) {
        <div class="error-banner"><mat-icon>error_outline</mat-icon> {{ errorMessage() }}</div>
      }

      <button mat-flat-button color="primary" type="submit" class="full-width submit-btn" [disabled]="loading()">
        @if (loading()) {
          <mat-spinner diameter="20" />
        } @else {
          Ingresar
        }
      </button>

      <a routerLink="/auth/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</a>

      @if (isDemo) {
        <section class="demo">
          <p class="demo__label"><span></span> Acceso demo <span></span></p>
          <div class="demo__roles">
            @for (c of demoCredentials; track c.email; let i = $index) {
              <button type="button" class="role" (click)="fillDemo(c.email)" [disabled]="loading()">
                <mat-icon>{{ roleIcons[i] }}</mat-icon>
                <span>{{ c.label }}</span>
              </button>
            }
          </div>
          <p class="demo__note">Los datos se guardan solo en tu navegador.</p>
        </section>
      }
    </form>
  `,
  styles: [`
    .login-form { display: flex; flex-direction: column; gap: 14px; }
    .head { margin-bottom: 14px; }
    .title {
      margin: 0;
      font-family: var(--tx-display);
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      font-size: 3.4rem;
      line-height: 0.9;
      letter-spacing: 0;
      color: var(--tx-text);
    }
    .title span { color: var(--tx-yellow); }
    .sub { margin: 12px 0 0; color: var(--tx-text-2); font-size: 0.98rem; }
    .full-width { width: 100%; }
    .submit-btn { height: 52px; font-size: 1rem; }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(255, 82, 82, 0.1); color: var(--tx-red);
      border: 1px solid rgba(255, 82, 82, 0.25);
      padding: 12px 14px; border-radius: 12px; font-size: 0.9rem;
    }
    .forgot-link { text-align: center; color: var(--tx-text-2); font-size: 0.875rem; text-decoration: none; }
    .forgot-link:hover { color: var(--tx-yellow); }
    mat-spinner { margin: 0 auto; }

    .demo { margin-top: 18px; }
    .demo__label {
      display: flex; align-items: center; gap: 12px; margin: 0 0 14px;
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
      color: var(--tx-text-3);
    }
    .demo__label span { flex: 1; height: 1px; background: var(--tx-line); }
    .demo__roles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .role {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      padding: 16px 8px;
      border-radius: 16px;
      border: 1px solid var(--tx-line);
      background: var(--tx-surface);
      color: var(--tx-text);
      font: inherit; font-size: 0.85rem; font-weight: 600;
      cursor: pointer;
      transition: border-color .25s ease, transform .3s var(--dc-ease), background-color .25s ease;
    }
    .role mat-icon { color: var(--tx-yellow); }
    .role:hover:not(:disabled) { border-color: var(--tx-yellow); transform: translateY(-2px); background: var(--tx-surface-2); }
    .demo__note { margin: 12px 0 0; text-align: center; font-size: 0.78rem; color: var(--tx-text-3); }
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
  roleIcons = ['admin_panel_settings', 'support_agent', 'fitness_center'];

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
