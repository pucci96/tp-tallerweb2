import {inject} from '@angular/core'
import { CanActivateFn, Router} from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const rol = localStorage.getItem('user_role');

  if(rol === 'ADMIN'){
    return true; 
  }
  router.navigate(['/productos'])
  return false;
};
