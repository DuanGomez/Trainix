import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-brand">
          <h1 class="brand-name">Trainix</h1>
          <p class="brand-tagline">Gestión inteligente de gimnasios</p>
        </div>
        <router-outlet />
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #1565c0 100%);
      padding: 24px;
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .auth-brand { text-align: center; margin-bottom: 32px; }
    .brand-name {
      font-size: 2.2rem;
      font-weight: 800;
      color: #1a237e;
      letter-spacing: 2px;
      margin: 0;
    }
    .brand-tagline { color: #666; margin: 4px 0 0; font-size: 0.9rem; }
  `],
})
export class AuthLayoutComponent {}
