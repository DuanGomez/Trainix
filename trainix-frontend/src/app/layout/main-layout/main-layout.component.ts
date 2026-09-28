import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavModule, SidebarComponent, TopbarComponent],
  template: `
    <mat-sidenav-container class="layout-container">
      <mat-sidenav
        #sidenav
        [mode]="sidenavMode()"
        [opened]="sidenavOpen()"
        class="sidenav">
        <app-sidebar (itemClicked)="onNavClick(sidenav)" />
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <app-topbar (menuToggle)="sidenav.toggle()" />
        <div class="page-wrapper">
          <router-outlet />
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .layout-container { height: 100vh; }
    .sidenav { width: 260px; }
    .main-content { display: flex; flex-direction: column; height: 100%; }
    .page-wrapper { flex: 1; overflow-y: auto; padding: 24px; background: #f5f5f5; }
    @media (max-width: 600px) { .page-wrapper { padding: 16px; } }
  `],
})
export class MainLayoutComponent {
  // En pantallas pequeñas el menú flota sobre el contenido y arranca cerrado.
  private isMobile = toSignal(
    inject(BreakpointObserver).observe('(max-width: 959px)').pipe(map((r) => r.matches)),
    { initialValue: window.matchMedia('(max-width: 959px)').matches },
  );
  sidenavMode = computed<'side' | 'over'>(() => (this.isMobile() ? 'over' : 'side'));
  sidenavOpen = computed(() => !this.isMobile());

  onNavClick(sidenav: MatSidenav): void {
    if (this.sidenavMode() === 'over') sidenav.close();
  }
}
