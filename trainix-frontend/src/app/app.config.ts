import {
  ApplicationConfig, DEFAULT_CURRENCY_CODE, LOCALE_ID, provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { demoBackendInterceptor } from './core/demo/demo-backend.interceptor';
import { SpanishPaginatorIntl } from './core/i18n/paginator-intl';

// En modo demo (GitHub Pages) el último interceptor responde en lugar del servidor.
const interceptors: HttpInterceptorFn[] = [authInterceptor, errorInterceptor, loadingInterceptor];
if (environment.demo) interceptors.push(demoBackendInterceptor);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors(interceptors)),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'COP' },
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntl },
  ],
};
