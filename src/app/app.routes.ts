import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PerfilComponent} from './perfil/perfil.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { DetallesProductoComponent } from './detalles-producto/detalles-producto.component';
import { CatalogoProductoComponent } from './catalogo-producto/catalogo-producto.component';
import { AdminProductosListComponent } from './admin-productos-list/admin-productos-list.component';
import { AdminProductoFormComponent } from './admin-productos-form/admin-productos-form.component';
import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
{
    path:'',
    component: HomeComponent
},
{ 
    path: 'productos', 
    component: CatalogoProductoComponent },
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
    path: 'login',
    component: LoginComponent
},
{
    path: 'registro',
    component: RegistroComponent
},
{
    path: 'detalles',
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
    path: 'admin/productos/editar/:id', 
    component: AdminProductoFormComponent, 
    canActivate: [adminGuard] 
  },
{
    path: '**',
    redirectTo:'home'
}


];
