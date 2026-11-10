import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PerfilComponent} from './perfil/perfil.component';
import { LoginComponent } from './login/login.component';
import { RegistroComponent } from './registro/registro.component';
import { DetallesProductoComponent } from './detalles-producto/detalles-producto.component';
import { CatalogoProductoComponent } from './catalogo-producto/catalogo-producto.component';

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
    component: PerfilComponent
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
    path: '**',
    redirectTo:'home'
}


];
