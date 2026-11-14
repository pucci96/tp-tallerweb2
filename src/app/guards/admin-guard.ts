import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Protege las pantallas de administración en el frontend.
 * Ojo: esto solo oculta la UI; la seguridad real está en el backend
 * (las rutas /api/productos/admin exigen un token con rol ADMIN).
 */
export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.esAdmin()) {
    return true;
  }
  return router.createUrlTree([authService.estaLogueado() ? '/productos' : '/login']);
};
