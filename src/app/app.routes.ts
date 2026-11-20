import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { PerfilComponent } from './perfil/perfil.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { DetallesProductoComponent } from './detalles-producto/detalles-producto.component';
import { CatalogoProductoComponent } from './catalogo-producto/catalogo-producto.component';
import { AdminProductosListComponent } from './admin-productos-list/admin-productos-list.component';
import { AdminProductoFormComponent } from './admin-productos-form/admin-productos-form.component';
import { CarritoComponent } from './carrito/carrito.component';
import { MisPedidos } from './components/mis-pedidos/mis-pedidos'; // Ajustá la ruta según la carpeta donde lo hayas guardado
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { CheckoutConfirmacionComponent } from './checkout-confirmacion/checkout-confirmacion.component';
import { CheckoutPagoComponent } from './checkout-pago/checkout-pago.component';
import { CheckoutResultadoComponent } from './checkout-resultado/checkout-resultado.component';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'productos',
    component: CatalogoProductoComponent
  },
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'perfil',
    component: PerfilComponent,
    canActivate: [authGuard]
  },
  {
    path: 'carrito',
    component: CarritoComponent
  },

  {
    path: 'mis-pedidos',
    component: MisPedidos,
    canActivate: [authGuard]
  },

  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'registro',
    component: RegistroComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'productos/:id',
    component: DetallesProductoComponent
  },
  {
    path: 'admin/productos',
    component: AdminProductosListComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'admin/productos/nuevo',
    component: AdminProductoFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: 'checkout',
    component: CheckoutConfirmacionComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout/pago',
    component: CheckoutPagoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'checkout/resultado',
    component: CheckoutResultadoComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/productos/editar/:id',
    component: AdminProductoFormComponent,
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: 'home'
  }


];
