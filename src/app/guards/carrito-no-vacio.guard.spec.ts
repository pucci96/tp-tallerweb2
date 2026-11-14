import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from '@angular/router';
import { CartService } from '../services/cart.service';
import { carritoNoVacioGuard } from './carrito-no-vacio.guard';

describe('carritoNoVacioGuard', () => {
  const ejecutarGuard: CanActivateFn = (...parametros) =>
    TestBed.runInInjectionContext(() => carritoNoVacioGuard(...parametros));
  const route = {} as ActivatedRouteSnapshot;
  const state = { url: '/checkout/pago' } as RouterStateSnapshot;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  it('debería redirigir a /checkout cuando el carrito está vacío', () => {
    const resultado = ejecutarGuard(route, state);
    const router = TestBed.inject(Router);
    expect(resultado instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(resultado as UrlTree)).toBe('/checkout');
  });

  it('debería permitir el acceso cuando el carrito tiene items', () => {
    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 'x.png' });
    expect(ejecutarGuard(route, state)).toBe(true);
  });
});
