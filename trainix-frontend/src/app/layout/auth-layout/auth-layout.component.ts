import { DcodeaBadgeComponent } from '../../shared/components/dcodea-badge.component';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, DcodeaBadgeComponent],
  template: `
    <div class="auth-container dc-dark">
      <div class="auth-card dc-rise">
        <div class="auth-brand">
          <span class="dc-chip">Dcodea · Gestión de gimnasios</span>
          <h1 class="brand-name"><span class="dc-gradient-text">Trainix</span></h1>
          <p class="brand-tagline">Clientes, membresías, pagos y asistencia en un solo lugar.</p>
        </div>
        <router-outlet />
      </div>
      <app-dcodea-badge />
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 24px;
      padding: 24px;
    }
    .auth-card {
      background: white;
      border-radius: 28px;
      padding: 40px;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
    }
    .auth-brand { text-align: center; margin-bottom: 32px; }
    /* La tarjeta es clara aunque el fondo sea oscuro: el chip usa la variante clara. */
    .auth-card .dc-chip {
      color: var(--brand);
      background: color-mix(in srgb, var(--brand) 8%, white);
      border-color: color-mix(in srgb, var(--brand) 25%, transparent);
    }
    .auth-brand { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .brand-name {
      font-size: 2.6rem;
      font-weight: 800;
      letter-spacing: -0.045em;
      margin: 4px 0 0;
      line-height: 1.1;
    }
    .brand-tagline { color: #6e6e73; margin: 0; font-size: 0.92rem; }
    @media (max-width: 480px) { .auth-card { padding: 28px 22px; } }
  `],
})
export class AuthLayoutComponent {}
