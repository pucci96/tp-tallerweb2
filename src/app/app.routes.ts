import { Routes } from '@angular/router';
import {HomeComponent} from './home/home.component';
import {PerfilComponent} from './perfil/perfil.component';

export const routes: Routes = [
{
    path:'',
    component: HomeComponent
},
{
    path: 'home',
    component: HomeComponent
},
{
    path: 'perfil',
    component: PerfilComponent
},
{
    path: '**',
    redirectTo:'home'
}





];
