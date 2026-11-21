import { Routes } from '@angular/router';
import { authGuard } from '../guards/auth-guard';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../checkout-confirmacion/checkout-confirmacion.component').then(m => m.CheckoutConfirmacionComponent),
    canActivate: [authGuard],
  },
  {
    path: 'pago',
    loadComponent: () => import('../checkout-pago/checkout-pago.component').then(m => m.CheckoutPagoComponent),
    canActivate: [authGuard],
  },
  {
    path: 'resultado',
    loadComponent: () => import('../checkout-resultado/checkout-resultado.component').then(m => m.CheckoutResultadoComponent),
    canActivate: [authGuard],
  },
];