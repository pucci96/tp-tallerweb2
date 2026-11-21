import { Routes } from '@angular/router';
import { adminGuard } from '../guards/admin-guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../admin-productos-list/admin-productos-list.component').then(m => m.AdminProductosListComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'nuevo',
    loadComponent: () => import('../admin-productos-form/admin-productos-form.component').then(m => m.AdminProductoFormComponent),
    canActivate: [adminGuard],
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('../admin-productos-form/admin-productos-form.component').then(m => m.AdminProductoFormComponent),
    canActivate: [adminGuard],
  },
];