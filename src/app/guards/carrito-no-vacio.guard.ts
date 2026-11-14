import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const carritoNoVacioGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  const router = inject(Router);
  return cart.cantidadTotal() > 0 ? true : router.createUrlTree(['/checkout']);
};
