import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DcodeaBadgeComponent } from '../../shared/components/dcodea-badge.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet, DcodeaBadgeComponent],
  template: `
    <div class="auth">
      <section class="auth__hero" aria-hidden="true">
        <div class="stripes"><i></i><i></i><i></i></div>
        <div class="hero__top">
          <span class="logo"><span class="logo__mark">T</span>TRAINIX</span>
        </div>
        <div class="hero__copy">
          <p class="hero__kicker">Gestión de gimnasios</p>
          <h1 class="hero__title">
            <span>Entrena.</span>
            <span>Gestiona.</span>
            <span class="hl">Crece.</span>
          </h1>
          <p class="hero__lead">Clientes, membresías, pagos, caja y asistencia en una sola plataforma.</p>
        </div>
        <div class="hero__stats">
          <div><strong>+24</strong><span>Clientes activos</span></div>
          <div><strong>5 s</strong><span>Check-in promedio</span></div>
          <div><strong>100%</strong><span>En la nube</span></div>
        </div>
      </section>

      <section class="auth__panel">
        <div class="panel__inner">
          <span class="logo logo--small"><span class="logo__mark">T</span>TRAINIX</span>
          <router-outlet />
        </div>
        <app-dcodea-badge class="badge" />
      </section>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .auth {
      min-height: 100vh;
      display: grid;
      grid-template-columns: 1.15fr 1fr;
      background: var(--tx-bg);
    }

    /* ── Portada ── */
    .auth__hero {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 40px clamp(32px, 5vw, 72px);
      background:
        radial-gradient(60% 50% at 80% 10%, rgba(255, 200, 0, 0.16), transparent 70%),
        linear-gradient(160deg, #111 0%, #050505 100%);
      border-right: 1px solid var(--tx-line);
    }
    .stripes {
      position: absolute;
      right: -22%;
      top: -10%;
      bottom: -10%;
      width: 50%;
      display: flex;
      gap: 26px;
      transform: skewX(-18deg);
      pointer-events: none;
    }
    .stripes i {
      flex: 1;
      background: linear-gradient(180deg, rgba(255, 200, 0, 0.9), rgba(255, 200, 0, 0.05));
      animation: rise 1.2s var(--dc-ease-out) both;
    }
    .stripes i:nth-child(1) { opacity: 0.18; animation-delay: 0.1s; }
    .stripes i:nth-child(2) { opacity: 0.32; animation-delay: 0.2s; }
    .stripes i:nth-child(3) { opacity: 0.6; flex: 0.6; animation-delay: 0.3s; }

    .logo {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-family: var(--tx-display);
      font-weight: 900;
      font-style: italic;
      font-size: 28px;
      letter-spacing: 0.04em;
      color: #fff;
    }
    .logo__mark {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: var(--tx-yellow);
      color: #0a0a0a;
      font-size: 24px;
      transform: skewX(-8deg);
    }
    .logo--small { display: none; margin-bottom: 28px; }

    .hero__copy { position: relative; }
    .hero__kicker {
      margin: 0 0 18px;
      color: var(--tx-yellow);
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      font-size: 13px;
    }
    .hero__title {
      margin: 0;
      font-family: var(--tx-display);
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      font-size: clamp(64px, 8.5vw, 132px);
      line-height: 0.86;
      letter-spacing: 0;
      color: #fff;
    }
    .hero__title span { display: block; animation: rise 0.9s var(--dc-ease-out) both; }
    .hero__title span:nth-child(2) { animation-delay: 0.08s; }
    .hero__title span:nth-child(3) { animation-delay: 0.16s; }
    .hero__title .hl { color: var(--tx-yellow); }
    .hero__lead {
      margin: 24px 0 0;
      max-width: 420px;
      font-size: 17px;
      line-height: 1.5;
      color: var(--tx-text-2);
    }
    .hero__stats {
      position: relative;
      display: flex;
      gap: clamp(24px, 4vw, 56px);
    }
    .hero__stats div { display: flex; flex-direction: column; }
    .hero__stats strong {
      font-family: var(--tx-display);
      font-size: 40px;
      font-weight: 800;
      color: #fff;
      line-height: 1;
    }
    .hero__stats span {
      margin-top: 6px;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--tx-text-3);
    }

    /* ── Formulario ── */
    .auth__panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 32px;
      padding: 48px 24px;
    }
    .panel__inner { width: 100%; max-width: 400px; }

    @keyframes rise {
      from { opacity: 0; transform: translateY(24px); }
      to { opacity: 1; transform: none; }
    }

    @media (max-width: 960px) {
      .auth { grid-template-columns: 1fr; }
      .auth__hero { display: none; }
      .logo--small { display: inline-flex; }
    }
  `],
})
export class AuthLayoutComponent {}
