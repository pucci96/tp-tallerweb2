import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';

// Formatos de Argentina para los pipes (date, number, currency):
// meses en español ("20 de noviembre") y punto como separador de miles.
registerLocaleData(localeEsAr);
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Detección de cambios con zone.js: la vista se actualiza sola cuando llegan
    // las respuestas HTTP, aunque los componentes usen variables comunes (no signals).
    // Sin esto, Angular 22 funciona en modo "zoneless" y los datos no aparecen
    // hasta que el usuario interactúa con la página.
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-AR' },
  ],
};
