import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DcodeaBadgeComponent } from '../../shared/components/dcodea-badge.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, DcodeaBadgeComponent],
  template: `
    <div class="auth">
      <section class="auth__panel">
        <div class="panel__inner">
          <span class="logo"><span class="logo__mark">T</span>Trainix</span>
          <router-outlet />
        </div>
        <app-dcodea-badge class="badge" />
      </section>

      <section class="auth__photo" aria-hidden="true">
        <img src="photos/login.webp" alt="" />
        <div class="photo__copy">
          <span class="chip">Gestión de gimnasios</span>
          <h1>Todo tu gimnasio,<br />en un solo lugar.</h1>
          <p>Clientes, membresías, pagos, caja y asistencia, siempre al día.</p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth {
      min-height: 100vh;
      display: grid;
      grid-template-columns: minmax(420px, 1fr) 1.15fr;
      background: var(--tx-bg);
    }

    /* Formulario */
    .auth__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 48px 24px;
    }
    .panel__inner { width: 100%; max-width: 380px; }
    .logo {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 40px;
      font-family: var(--tx-display);
      font-weight: 700;
      font-size: 22px;
      letter-spacing: -0.03em;
      color: var(--tx-text);
    }
    .logo__mark {
      display: grid;
      place-items: center;
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: var(--tx-ink);
      color: var(--tx-yellow);
      font-size: 17px;
      font-weight: 800;
    }

    /* Foto */
    .auth__photo {
      position: relative;
      margin: 16px 16px 16px 0;
      border-radius: 28px;
      overflow: hidden;
      background: var(--tx-surface-3);
    }
    .auth__photo img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      animation: zoom 18s ease-out both;
    }
    .auth__photo::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(19, 19, 22, 0) 40%, rgba(19, 19, 22, 0.72) 100%);
    }
    .photo__copy {
      position: absolute;
      z-index: 1;
      left: clamp(28px, 4vw, 56px);
      right: clamp(28px, 4vw, 56px);
      bottom: clamp(28px, 4vw, 56px);
      color: #fff;
    }
    .chip {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 980px;
      background: rgba(255, 255, 255, 0.18);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      font-size: 13px;
      font-weight: 600;
    }
    .photo__copy h1 {
      margin: 18px 0 0;
      color: #fff;
      font-family: var(--tx-display);
      font-size: clamp(34px, 3.6vw, 52px);
      font-weight: 700;
      line-height: 1.08;
      letter-spacing: -0.035em;
    }
    .photo__copy p { margin: 14px 0 0; max-width: 440px; font-size: 17px; line-height: 1.5; color: rgba(255, 255, 255, 0.82); }

    @keyframes zoom { from { transform: scale(1.08); } to { transform: scale(1); } }

    @media (max-width: 960px) {
      .auth { grid-template-columns: 1fr; }
      .auth__photo { display: none; }
    }
  `],
})
export class AuthLayoutComponent {}
