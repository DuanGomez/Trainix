import { Component, computed, inject, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardStore, ChartPoint } from './dashboard.store';
import { MetricCardComponent } from '../../shared/components/metric-card/metric-card.component';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, MetricCardComponent],
  template: `
    @if (store.loading()) {
      <div class="center-spin"><mat-spinner diameter="48" /></div>
    } @else if (store.summary(); as s) {
      <!-- Banner del día -->
      <section class="hero">
        <div class="hero__stripes" aria-hidden="true"><i></i><i></i></div>
        <div class="hero__copy">
          <p class="hero__kicker">{{ today }}</p>
          <h1 class="hero__title">Hola, <span>{{ firstName() }}</span></h1>
          <p class="hero__lead">Así va tu gimnasio hoy.</p>
          <div class="hero__actions">
            <a mat-flat-button color="primary" routerLink="/attendance"><mat-icon>bolt</mat-icon> Check-in rápido</a>
            <a mat-stroked-button routerLink="/members/new"><mat-icon>person_add</mat-icon> Nuevo cliente</a>
          </div>
        </div>
        <div class="hero__stats">
          <div>
            <strong>{{ s.todayAttendance }}</strong>
            <span>Entrenando hoy</span>
          </div>
          <div>
            <strong>{{ s.todayRevenue | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
            <span>Ingresos hoy</span>
          </div>
        </div>
      </section>

      <!-- Métricas -->
      <div class="metrics">
        <app-metric-card label="Clientes activos" [value]="s.activeMembers" icon="groups" [subtitle]="s.totalMembers + ' en total'" color="yellow" />
        <app-metric-card label="Ingresos del mes" [value]="(s.monthRevenue | currency:'COP':'symbol-narrow':'1.0-0') ?? ''" icon="trending_up" color="green" />
        <app-metric-card label="Por vencer" [value]="s.expiringMemberships" icon="event_busy" subtitle="Próximos 7 días" color="orange" />
        <app-metric-card label="Nuevos clientes" [value]="s.newMembersMonth" icon="person_add" subtitle="Este mes" color="blue" />
      </div>

      <!-- Gráficos -->
      <div class="charts">
        <section class="panel">
          <header class="panel__head">
            <div>
              <h2>Ingresos</h2>
              <p>Últimos 6 meses</p>
            </div>
            <strong class="panel__total">{{ total(store.revenue()) | currency:'COP':'symbol-narrow':'1.0-0' }}</strong>
          </header>
          <div class="bars">
            @for (point of store.revenue(); track point.label; let last = $last) {
              <div class="bar" [class.bar--now]="last">
                <span class="bar__value">{{ short(point.value) }}</span>
                <div class="bar__track"><i [style.height.%]="barHeight(point.value, store.revenue())"></i></div>
                <span class="bar__label">{{ point.label }}</span>
              </div>
            }
          </div>
        </section>

        <section class="panel">
          <header class="panel__head">
            <div>
              <h2>Asistencia</h2>
              <p>Últimos 7 días</p>
            </div>
            <strong class="panel__total">{{ total(store.attendance()) }} <small>visitas</small></strong>
          </header>
          <div class="bars">
            @for (point of store.attendance(); track point.label; let last = $last) {
              <div class="bar bar--green" [class.bar--now]="last">
                <span class="bar__value">{{ point.value }}</span>
                <div class="bar__track"><i [style.height.%]="barHeight(point.value, store.attendance())"></i></div>
                <span class="bar__label">{{ point.label }}</span>
              </div>
            }
          </div>
        </section>
      </div>

      <!-- Accesos rápidos -->
      <h2 class="section-label">Accesos rápidos</h2>
      <div class="shortcuts">
        @for (a of shortcuts; track a.route) {
          <a class="shortcut" [routerLink]="a.route">
            <span class="shortcut__icon"><mat-icon>{{ a.icon }}</mat-icon></span>
            <span class="shortcut__text"><strong>{{ a.label }}</strong><small>{{ a.hint }}</small></span>
            <mat-icon class="shortcut__arrow">arrow_forward</mat-icon>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .center-spin { display: flex; justify-content: center; padding: 80px; }

    /* Banner */
    .hero {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      justify-content: space-between;
      gap: 28px;
      padding: clamp(24px, 4vw, 40px);
      margin-bottom: 20px;
      border-radius: 28px;
      background:
        radial-gradient(60% 120% at 100% 0%, rgba(255, 200, 0, 0.22), transparent 60%),
        linear-gradient(135deg, #161616, #0d0d0d);
      border: 1px solid var(--tx-line);
    }
    .hero__stripes {
      position: absolute;
      right: 6%;
      top: -20%;
      bottom: -20%;
      display: flex;
      gap: 18px;
      transform: skewX(-18deg);
      pointer-events: none;
    }
    .hero__stripes i { width: 46px; background: linear-gradient(180deg, rgba(255, 200, 0, 0.35), transparent); }
    .hero__stripes i:last-child { width: 26px; opacity: 0.6; }
    .hero__copy { position: relative; }
    .hero__kicker {
      margin: 0 0 10px;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--tx-yellow);
    }
    .hero__title {
      margin: 0;
      font-family: var(--tx-display);
      font-size: clamp(2.8rem, 6vw, 4.6rem);
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      line-height: 0.9;
    }
    .hero__title span { color: var(--tx-yellow); }
    .hero__lead { margin: 10px 0 0; color: var(--tx-text-2); }
    .hero__actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 22px; }
    .hero__stats { position: relative; display: flex; gap: clamp(20px, 4vw, 48px); }
    .hero__stats div { display: flex; flex-direction: column; }
    .hero__stats strong {
      font-family: var(--tx-display);
      font-size: clamp(2.6rem, 5vw, 4rem);
      font-weight: 800;
      line-height: 1;
    }
    .hero__stats span {
      margin-top: 6px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--tx-text-2);
    }

    /* Métricas */
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    /* Gráficos */
    .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
    .panel {
      padding: 22px 24px;
      border-radius: 24px;
      background: var(--tx-surface);
      border: 1px solid var(--tx-line);
    }
    .panel__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .panel__head h2 {
      margin: 0;
      font-family: var(--tx-display);
      font-size: 1.7rem;
      font-weight: 800;
      text-transform: uppercase;
      line-height: 1;
    }
    .panel__head p { margin: 4px 0 0; font-size: 0.8rem; color: var(--tx-text-3); }
    .panel__total { font-family: var(--tx-display); font-size: 1.7rem; font-weight: 800; line-height: 1; }
    .panel__total small { font-size: 0.9rem; color: var(--tx-text-3); font-weight: 600; }
    .bars { display: flex; align-items: stretch; gap: 10px; height: 210px; margin-top: 20px; }
    .bar { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: 8px; --c: var(--tx-yellow); }
    .bar--green { --c: var(--tx-green); }
    .bar__value { font-size: 0.7rem; font-weight: 700; color: var(--tx-text-3); white-space: nowrap; }
    .bar__track { flex: 1; width: 100%; display: flex; align-items: flex-end; }
    .bar__track i {
      display: block;
      width: 100%;
      min-height: 4px;
      border-radius: 8px 8px 3px 3px;
      background: color-mix(in srgb, var(--c) 28%, var(--tx-surface-3));
      transition: height .6s var(--dc-ease-out), background-color .3s ease;
    }
    .bar:hover .bar__track i { background: color-mix(in srgb, var(--c) 60%, var(--tx-surface-3)); }
    .bar--now .bar__track i { background: var(--c); box-shadow: 0 0 24px -4px var(--c); }
    .bar--now .bar__value { color: var(--c); }
    .bar__label {
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--tx-text-3);
      white-space: nowrap;
    }

    /* Accesos rápidos */
    .section-label {
      margin: 0 0 14px;
      font-family: var(--tx-display);
      font-size: 1.5rem;
      font-weight: 800;
      text-transform: uppercase;
    }
    .shortcuts { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 12px; }
    .shortcut {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 18px;
      border-radius: 18px;
      background: var(--tx-surface);
      border: 1px solid var(--tx-line);
      color: var(--tx-text);
      text-decoration: none;
      transition: border-color .25s ease, transform .3s var(--dc-ease), background-color .25s ease;
    }
    .shortcut:hover { border-color: var(--tx-yellow); transform: translateY(-2px); background: var(--tx-surface-2); }
    .shortcut__icon {
      display: grid;
      place-items: center;
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 12px;
      background: var(--tx-yellow-soft);
      color: var(--tx-yellow);
    }
    .shortcut__text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
    .shortcut__text strong { font-size: 0.95rem; }
    .shortcut__text small { color: var(--tx-text-3); font-size: 0.78rem; }
    .shortcut__arrow { color: var(--tx-text-3); transition: transform .3s var(--dc-ease), color .2s ease; }
    .shortcut:hover .shortcut__arrow { color: var(--tx-yellow); transform: translateX(3px); }

    @media (max-width: 900px) { .charts { grid-template-columns: 1fr; } }
    @media (max-width: 600px) { .hero__stripes { display: none; } .bars { height: 170px; gap: 6px; } }
  `],
})
export class DashboardComponent implements OnInit {
  store = inject(DashboardStore);
  private auth = inject(AuthStore);

  firstName = computed(() => this.auth.currentUser()?.firstName ?? '');
  today = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

  shortcuts = [
    { label: 'Nueva membresía', hint: 'Asignar un plan', icon: 'card_membership', route: '/memberships/new' },
    { label: 'Registrar pago', hint: 'Efectivo, tarjeta o transferencia', icon: 'payments', route: '/payments/new' },
    { label: 'Caja', hint: 'Apertura y cierre', icon: 'point_of_sale', route: '/cash-register' },
    { label: 'Rutinas', hint: 'Planes de entrenamiento', icon: 'fitness_center', route: '/routines' },
  ];

  ngOnInit(): void { this.store.load(); }

  barHeight(value: number, points: ChartPoint[]): number {
    const max = Math.max(...points.map((p) => p.value), 1);
    return Math.max((value / max) * 100, 3);
  }

  total(points: ChartPoint[]): number {
    return points.reduce((sum, p) => sum + p.value, 0);
  }

  /** 2376000 → "2,4M"; 95000 → "95k". */
  short(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}M`;
    if (value >= 1_000) return `${Math.round(value / 1_000)}k`;
    return String(value);
  }
}
