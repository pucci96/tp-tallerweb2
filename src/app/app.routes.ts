import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'productos',
    loadComponent: () => import('./catalogo-producto/catalogo-producto.component').then(m => m.CatalogoProductoComponent),
  },
  {
    path: 'productos/:id',
    loadComponent: () => import('./detalles-producto/detalles-producto.component').then(m => m.DetallesProductoComponent),
  },
  {
    path: 'perfil',
    canActivate: [authGuard],
    loadComponent: () => import('./perfil/perfil.component').then(m => m.PerfilComponent),
  },
  {
    path: 'carrito',
    loadComponent: () => import('./carrito/carrito.component').then(m => m.CarritoComponent),
  },
  {
    path: 'mis-pedidos',
    canActivate: [authGuard],
    loadComponent: () => import('./components/mis-pedidos/mis-pedidos').then(m => m.MisPedidos),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'registro',
    canActivate: [guestGuard],
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent),
  },
  {
    path: 'admin/productos',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },
  {
    path: 'checkout',
    loadChildren: () => import('./checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES),
  },
  {
    path: '404',
    loadComponent: () => import('./page-not-found/page-not-found').then(m => m.PageNotFound),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];