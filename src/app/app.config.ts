import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
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
  ],
};
