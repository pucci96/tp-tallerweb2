# Mocked Checkout Implementation Plan

> **For agentic workers:** Implement this plan task by task with TDD. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a client-side cart and a fully mocked checkout flow (order confirmation, fake card payment, result page) to the Angular storefront.

**Architecture:** Three root-provided services hold state with signals: `CartService` (persisted to `localStorage`), `CheckoutService` (in-memory shipping data and last order) and `PaymentSimulatorService` (deterministic fake payment emitted through an RxJS `delay` driven by the `PAYMENT_DELAY_MS` token). Three standalone views (`/checkout`, `/checkout/pago`, `/checkout/resultado`) consume those services; a functional guard (`carritoNoVacioGuard`) protects the payment step. The header and the detail page are rewired to the real cart.

**Tech Stack:** Angular 22 standalone components, signals/computed, reactive forms, RxJS 7, Vitest via `@angular/build:unit-test` (jsdom, globals).

**Spec:** `docs/superpowers/specs/2026-11-13-checkout-mock-design.md`

---

## Global Constraints

- Frontend only. Do not touch `Backend/` or any `.env` file.
- Standalone components in kebab-case folders under `src/app`, files `x.component.ts/html/css`, `@if`/`@for` control flow, `inject()` for DI.
- Plain CSS per component, using the variables in `src/styles.css` (`--primary-color`, `--secondary-color`, `--tertiary-color`, `--neutral-dark`, `--font-main`). Currency rendered as `$ {{ x | number:'1.0-0' }} ARS`.
- Identifiers follow the spec (Spanish domain names: `agregar`, `vaciar`, `cantidadTotal`...). UI copy in Spanish. Code comments sparse and in English.
- Tests: Vitest, TestBed pattern used in the repo, Spanish test names (`debería ...`). Run with `npx ng test --watch=false` (optionally `--include <path>`).
- Conventional commits (`feat:`, `test:`, `docs:`), no AI attribution lines.
- Baseline before this plan: `src/app/app.spec.ts` (2 tests, missing `ActivatedRoute` provider) and `src/app/home/home.component.spec.ts` (empty suite) already fail. They are out of scope.

## Review Focus

- **Corrupt `localStorage`:** invalid JSON, a non-array value, or malformed items must yield an empty (or filtered) cart without throwing. Storage writes can throw (quota, private mode) and must be swallowed.
- **Quantity edge cases:** `agregar` ignores quantities below 1 and non-finite values and floors fractions; `cambiarCantidad` removes the item for quantities below 1. *Deviation from the spec:* the spec says "1 or less removes"; that would make it impossible to go from 2 to 1 with the minus button, so the threshold is "less than 1".
- **Card expiry boundary:** a card expiring in the current month is valid; the previous month is not. Month `00` and `13` are invalid. The validator takes an injectable clock so the boundary is testable.
- **Card number with spaces:** `4111 1111 1111 1111` is valid; whitespace is stripped before validation and before calling the simulator. Any non-digit other than whitespace is invalid.
- **Refresh on `/checkout/resultado`:** `CheckoutService` is memory-only, so a refresh loses the result and the view redirects to `/home`. A refresh on `/checkout/pago` loses the shipping data; the view redirects to `/checkout` (addition beyond the spec, needed to never build an order without shipping data).
- **Double submit while processing:** `pagar()` is a no-op while `procesando()` is true, the submit button is disabled and the card form is disabled during processing, and re-enabled after a rejection.

---

## Task 1: CartService

**Files:**
- Create: `src/app/services/cart.service.ts`
- Test: `src/app/services/cart.service.spec.ts`

**Interfaces:**
```ts
export interface CartItem { id: number; nombre: string; precio: number; imagen: string; cantidad: number; }
export type ProductoCarrito = Omit<CartItem, 'cantidad'>;
export const CARRITO_STORAGE_KEY = 'carrito';
class CartService {
  readonly items: Signal<CartItem[]>;
  readonly cantidadTotal: Signal<number>;
  readonly total: Signal<number>;
  agregar(producto: ProductoCarrito, cantidad?: number): void;
  cambiarCantidad(id: number, cantidad: number): void;
  quitar(id: number): void;
  vaciar(): void;
}
```

- [ ] **Step 1: Write the failing test** (`src/app/services/cart.service.spec.ts`)

```ts
import { TestBed } from '@angular/core/testing';
import { CARRITO_STORAGE_KEY, CartService, ProductoCarrito } from './cart.service';

const teclado: ProductoCarrito = { id: 1, nombre: 'Teclado', precio: 1000, imagen: 'teclado.png' };
const mouse: ProductoCarrito = { id: 2, nombre: 'Mouse', precio: 500, imagen: 'mouse.png' };

describe('CartService', () => {
  let service: CartService;

  const crearServicio = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(CartService);
  };

  beforeEach(() => {
    localStorage.clear();
    service = crearServicio();
  });

  afterEach(() => localStorage.clear());

  it('debería iniciar vacío', () => {
    expect(service.items()).toEqual([]);
    expect(service.cantidadTotal()).toBe(0);
    expect(service.total()).toBe(0);
  });

  it('debería agregar un producto con cantidad 1 por defecto', () => {
    service.agregar(teclado);
    expect(service.items()).toEqual([{ ...teclado, cantidad: 1 }]);
  });

  it('debería sumar la cantidad cuando el producto ya existe', () => {
    service.agregar(teclado, 2);
    service.agregar(teclado, 3);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].cantidad).toBe(5);
  });

  it('debería ignorar cantidades menores a 1 o no numéricas al agregar', () => {
    service.agregar(teclado, 0);
    service.agregar(teclado, -2);
    service.agregar(teclado, Number.NaN);
    expect(service.items()).toEqual([]);
  });

  it('debería redondear hacia abajo cantidades fraccionarias', () => {
    service.agregar(teclado, 2.7);
    expect(service.items()[0].cantidad).toBe(2);
  });

  it('debería calcular cantidad total y total', () => {
    service.agregar(teclado, 2);
    service.agregar(mouse, 3);
    expect(service.cantidadTotal()).toBe(5);
    expect(service.total()).toBe(2 * 1000 + 3 * 500);
  });

  it('debería cambiar la cantidad de un item', () => {
    service.agregar(teclado, 2);
    service.cambiarCantidad(1, 1);
    expect(service.items()[0].cantidad).toBe(1);
  });

  it('debería quitar el item cuando la cantidad es menor a 1', () => {
    service.agregar(teclado);
    service.agregar(mouse);
    service.cambiarCantidad(1, 0);
    service.cambiarCantidad(2, -1);
    expect(service.items()).toEqual([]);
  });

  it('debería quitar un item por id', () => {
    service.agregar(teclado);
    service.agregar(mouse);
    service.quitar(1);
    expect(service.items().map((i) => i.id)).toEqual([2]);
  });

  it('debería vaciar el carrito', () => {
    service.agregar(teclado);
    service.vaciar();
    expect(service.items()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(CARRITO_STORAGE_KEY)!)).toEqual([]);
  });

  it('debería persistir y recuperar el carrito desde localStorage', () => {
    service.agregar(teclado, 2);
    const recuperado = crearServicio();
    expect(recuperado.items()).toEqual([{ ...teclado, cantidad: 2 }]);
  });

  it('debería iniciar vacío si el JSON guardado es inválido', () => {
    localStorage.setItem(CARRITO_STORAGE_KEY, '{no es json');
    expect(crearServicio().items()).toEqual([]);
  });

  it('debería descartar valores que no son una lista o items mal formados', () => {
    localStorage.setItem(CARRITO_STORAGE_KEY, '{"id":1}');
    expect(crearServicio().items()).toEqual([]);

    localStorage.setItem(
      CARRITO_STORAGE_KEY,
      JSON.stringify([{ ...teclado, cantidad: 2 }, { id: 'x' }, null, { ...mouse, cantidad: 0 }]),
    );
    expect(crearServicio().items()).toEqual([{ ...teclado, cantidad: 2 }]);
  });

  it('no debería fallar si localStorage lanza un error al escribir', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => service.agregar(teclado)).not.toThrow();
    expect(service.cantidadTotal()).toBe(1);
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run the test and confirm it fails** — `npx ng test --watch=false --include src/app/services/cart.service.spec.ts` → fails: cannot resolve `./cart.service`.

- [ ] **Step 3: Implement** (`src/app/services/cart.service.ts`)

```ts
import { Injectable, computed, signal } from '@angular/core';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  cantidad: number;
}

export type ProductoCarrito = Omit<CartItem, 'cantidad'>;

export const CARRITO_STORAGE_KEY = 'carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>(leerCarrito());

  readonly items = this._items.asReadonly();
  readonly cantidadTotal = computed(() =>
    this._items().reduce((acumulado, item) => acumulado + item.cantidad, 0),
  );
  readonly total = computed(() =>
    this._items().reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0),
  );

  agregar(producto: ProductoCarrito, cantidad = 1): void {
    const unidades = Math.floor(cantidad);
    if (!Number.isFinite(unidades) || unidades < 1) {
      return;
    }

    const existe = this._items().some((item) => item.id === producto.id);
    this.actualizar(
      existe
        ? this._items().map((item) =>
            item.id === producto.id ? { ...item, cantidad: item.cantidad + unidades } : item,
          )
        : [...this._items(), { ...producto, cantidad: unidades }],
    );
  }

  cambiarCantidad(id: number, cantidad: number): void {
    const unidades = Math.floor(cantidad);
    if (!Number.isFinite(unidades) || unidades < 1) {
      this.quitar(id);
      return;
    }
    this.actualizar(
      this._items().map((item) => (item.id === id ? { ...item, cantidad: unidades } : item)),
    );
  }

  quitar(id: number): void {
    this.actualizar(this._items().filter((item) => item.id !== id));
  }

  vaciar(): void {
    this.actualizar([]);
  }

  private actualizar(items: CartItem[]): void {
    this._items.set(items);
    try {
      localStorage.setItem(CARRITO_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage can be full or unavailable; the in-memory cart still works.
    }
  }
}

function leerCarrito(): CartItem[] {
  try {
    const guardado = localStorage.getItem(CARRITO_STORAGE_KEY);
    if (!guardado) {
      return [];
    }
    const datos: unknown = JSON.parse(guardado);
    return Array.isArray(datos) ? datos.filter(esCartItem) : [];
  } catch {
    return [];
  }
}

function esCartItem(valor: unknown): valor is CartItem {
  if (typeof valor !== 'object' || valor === null) {
    return false;
  }
  const item = valor as Record<string, unknown>;
  return (
    typeof item['id'] === 'number' &&
    typeof item['nombre'] === 'string' &&
    typeof item['precio'] === 'number' &&
    Number.isFinite(item['precio']) &&
    typeof item['imagen'] === 'string' &&
    Number.isInteger(item['cantidad']) &&
    (item['cantidad'] as number) >= 1
  );
}
```

- [ ] **Step 4: Run the test and confirm it passes** — same command → all `CartService` tests pass.

- [ ] **Step 5: Commit** — `git add src/app/services/cart.service.ts src/app/services/cart.service.spec.ts && git commit -m "feat(cart): add CartService with localStorage persistence"`

---

## Task 2: CheckoutService and PaymentSimulatorService

**Files:**
- Create: `src/app/services/checkout.service.ts`
- Create: `src/app/services/payment-simulator.service.ts`
- Test: `src/app/services/checkout.service.spec.ts`
- Test: `src/app/services/payment-simulator.service.spec.ts`

**Interfaces:**
```ts
export interface DatosEnvio { nombre: string; apellido: string; email: string; direccion: string; ciudad: string; codigoPostal: string; }
export interface PedidoConfirmado { numeroPedido: string; total: number; envio: DatosEnvio; }
class CheckoutService {
  readonly datosEnvio: Signal<DatosEnvio | null>;
  readonly ultimoPedido: Signal<PedidoConfirmado | null>;
  guardarEnvio(datos: DatosEnvio): void;
  registrarPedido(pedido: PedidoConfirmado): void;
}

export interface DatosTarjeta { numero: string; titular: string; vencimiento: string; cvv: string; }
export interface ResultadoPago { aprobado: boolean; numeroPedido?: string; motivo?: string; }
export const PAYMENT_DELAY_MS: InjectionToken<number>; // default 2000
class PaymentSimulatorService { procesarPago(tarjeta: DatosTarjeta): Observable<ResultadoPago>; }
```

- [ ] **Step 1: Write the failing tests**

`src/app/services/checkout.service.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { CheckoutService, DatosEnvio } from './checkout.service';

const envio: DatosEnvio = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@mail.com',
  direccion: 'Calle 123',
  ciudad: 'CABA',
  codigoPostal: '1414',
};

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutService);
  });

  it('debería iniciar sin datos de envío ni pedido', () => {
    expect(service.datosEnvio()).toBeNull();
    expect(service.ultimoPedido()).toBeNull();
  });

  it('debería guardar los datos de envío', () => {
    service.guardarEnvio(envio);
    expect(service.datosEnvio()).toEqual(envio);
  });

  it('debería registrar el último pedido', () => {
    service.registrarPedido({ numeroPedido: 'TC-123456', total: 1000, envio });
    expect(service.ultimoPedido()?.numeroPedido).toBe('TC-123456');
  });
});
```

`src/app/services/payment-simulator.service.spec.ts`:
```ts
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DatosTarjeta, PAYMENT_DELAY_MS, PaymentSimulatorService } from './payment-simulator.service';

const tarjeta = (numero: string): DatosTarjeta => ({
  numero,
  titular: 'Ana García',
  vencimiento: '12/99',
  cvv: '123',
});

describe('PaymentSimulatorService', () => {
  let service: PaymentSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PAYMENT_DELAY_MS, useValue: 0 }] });
    service = TestBed.inject(PaymentSimulatorService);
  });

  it('debería usar 2000 ms de demora por defecto', () => {
    TestBed.resetTestingModule();
    expect(TestBed.inject(PAYMENT_DELAY_MS)).toBe(2000);
  });

  it('debería aprobar una tarjeta normal con número de pedido', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111111111')));
    expect(resultado.aprobado).toBe(true);
    expect(resultado.numeroPedido).toMatch(/^TC-\d{6}$/);
  });

  it('debería rechazar una tarjeta terminada en 0000 por fondos insuficientes', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111110000')));
    expect(resultado).toEqual({ aprobado: false, motivo: 'Fondos insuficientes' });
  });

  it('debería ignorar espacios al evaluar el número de tarjeta', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111 1111 1111 0000')));
    expect(resultado.aprobado).toBe(false);
  });

  it('debería generar números de pedido con 6 dígitos aunque el aleatorio sea chico', async () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.000001);
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111111111')));
    expect(resultado.numeroPedido).toBe('TC-000001');
    spy.mockRestore();
  });
});
```

- [ ] **Step 2: Run and confirm failure** — `npx ng test --watch=false --include "src/app/services/{checkout,payment-simulator}.service.spec.ts"` (or each path) → fails: modules not found.

- [ ] **Step 3: Implement**

`src/app/services/checkout.service.ts`:
```ts
import { Injectable, signal } from '@angular/core';

export interface DatosEnvio {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export interface PedidoConfirmado {
  numeroPedido: string;
  total: number;
  envio: DatosEnvio;
}

// Memory only: a page refresh intentionally clears the checkout state.
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly _datosEnvio = signal<DatosEnvio | null>(null);
  private readonly _ultimoPedido = signal<PedidoConfirmado | null>(null);

  readonly datosEnvio = this._datosEnvio.asReadonly();
  readonly ultimoPedido = this._ultimoPedido.asReadonly();

  guardarEnvio(datos: DatosEnvio): void {
    this._datosEnvio.set({ ...datos });
  }

  registrarPedido(pedido: PedidoConfirmado): void {
    this._ultimoPedido.set(pedido);
  }
}
```

`src/app/services/payment-simulator.service.ts`:
```ts
import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';

export interface DatosTarjeta {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
}

export interface ResultadoPago {
  aprobado: boolean;
  numeroPedido?: string;
  motivo?: string;
}

export const PAYMENT_DELAY_MS = new InjectionToken<number>('PAYMENT_DELAY_MS', {
  providedIn: 'root',
  factory: () => 2000,
});

@Injectable({ providedIn: 'root' })
export class PaymentSimulatorService {
  private readonly demoraMs = inject(PAYMENT_DELAY_MS);

  procesarPago(tarjeta: DatosTarjeta): Observable<ResultadoPago> {
    return defer(() => of(evaluarTarjeta(tarjeta))).pipe(delay(this.demoraMs));
  }
}

function evaluarTarjeta(tarjeta: DatosTarjeta): ResultadoPago {
  const digitos = tarjeta.numero.replace(/\D/g, '');
  if (digitos.endsWith('0000')) {
    return { aprobado: false, motivo: 'Fondos insuficientes' };
  }
  return { aprobado: true, numeroPedido: generarNumeroPedido() };
}

function generarNumeroPedido(): string {
  const numero = Math.floor(Math.random() * 1_000_000);
  return `TC-${numero.toString().padStart(6, '0')}`;
}
```

- [ ] **Step 4: Run and confirm pass.**

- [ ] **Step 5: Commit** — `git commit -m "feat(checkout): add checkout state and payment simulator services"`

---

## Task 3: carritoNoVacioGuard

**Files:**
- Create: `src/app/guards/carrito-no-vacio.guard.ts`
- Test: `src/app/guards/carrito-no-vacio.guard.spec.ts`

**Interfaces:** `export const carritoNoVacioGuard: CanActivateFn` → `true` when the cart has items, otherwise a `UrlTree` for `/checkout`.

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run and confirm failure** — `npx ng test --watch=false --include src/app/guards/carrito-no-vacio.guard.spec.ts`.

- [ ] **Step 3: Implement**

```ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CartService } from '../services/cart.service';

export const carritoNoVacioGuard: CanActivateFn = () => {
  const cart = inject(CartService);
  const router = inject(Router);
  return cart.cantidadTotal() > 0 ? true : router.createUrlTree(['/checkout']);
};
```

- [ ] **Step 4: Run and confirm pass.**

- [ ] **Step 5: Commit** — `git commit -m "feat(checkout): add carritoNoVacioGuard"`

Routes are registered in Tasks 4–6, together with each view, always above the `**` wildcard.

---

## Task 4: checkout-confirmacion view (`/checkout`)

**Files:**
- Create: `src/app/checkout-confirmacion/checkout-confirmacion.component.ts|html|css`
- Test: `src/app/checkout-confirmacion/checkout-confirmacion.component.spec.ts`
- Modify: `src/app/app.routes.ts` (add `{ path: 'checkout', component: CheckoutConfirmacionComponent }` above `**`)

**Interfaces:** `CheckoutConfirmacionComponent` with `items`, `total`, `cantidadTotal` (signals from `CartService`), `form` (nonNullable `FormGroup` of `DatosEnvio`), `cambiarCantidad(id, cantidad)`, `quitar(id)`, `continuar()`.

- [ ] **Step 1: Write the failing test**

```ts
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService, UsuarioSesion } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutConfirmacionComponent } from './checkout-confirmacion.component';

const usuario: UsuarioSesion = {
  id: 7,
  email: 'ana@mail.com',
  nombre: 'Ana',
  apellido: 'García',
  direccion: 'Calle 123',
  rol: 'CLIENTE',
};

describe('CheckoutConfirmacionComponent', () => {
  let fixture: ComponentFixture<CheckoutConfirmacionComponent>;
  let component: CheckoutConfirmacionComponent;
  const usuarioActual = signal<UsuarioSesion | null>(null);

  const crear = async () => {
    fixture = TestBed.createComponent(CheckoutConfirmacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    localStorage.clear();
    usuarioActual.set(null);
    TestBed.configureTestingModule({
      imports: [CheckoutConfirmacionComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { usuarioActual } }],
    });
  });

  afterEach(() => localStorage.clear());

  it('debería mostrar el estado vacío cuando no hay items', async () => {
    const el = await crear();
    expect(el.textContent).toContain('Tu carrito está vacío');
    expect(el.querySelector('a[href="/productos"]')).not.toBeNull();
  });

  it('debería listar los items con subtotal y total', async () => {
    const cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 2);
    cart.agregar({ id: 2, nombre: 'Mouse', precio: 500, imagen: 'm.png' });
    const el = await crear();
    expect(el.querySelectorAll('.cart-item').length).toBe(2);
    expect(el.textContent).toContain('Teclado');
    expect(el.textContent).toContain('Envío');
    expect(el.querySelector('.summary-total')?.textContent).toContain('2,500');
  });

  it('debería actualizar la cantidad y quitar items desde la vista', async () => {
    const cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    const el = await crear();
    (el.querySelector('[data-test="sumar"]') as HTMLButtonElement).click();
    expect(cart.items()[0].cantidad).toBe(2);
    (el.querySelector('.remove-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(cart.items()).toEqual([]);
    expect(el.textContent).toContain('Tu carrito está vacío');
  });

  it('debería precargar el formulario con el usuario logueado', async () => {
    usuarioActual.set(usuario);
    await crear();
    expect(component.form.getRawValue()).toEqual(
      expect.objectContaining({ nombre: 'Ana', apellido: 'García', email: 'ana@mail.com', direccion: 'Calle 123' }),
    );
  });

  it('debería deshabilitar "Continuar al pago" con el formulario inválido', async () => {
    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    const el = await crear();
    const boton = el.querySelector('[data-test="continuar"]') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería validar el código postal (4 a 8 alfanuméricos)', async () => {
    await crear();
    const cp = component.form.controls.codigoPostal;
    cp.setValue('12');
    expect(cp.valid).toBe(false);
    cp.setValue('C1414ABC');
    expect(cp.valid).toBe(true);
    cp.setValue('14-14');
    expect(cp.valid).toBe(false);
  });

  it('debería guardar los datos de envío y navegar al pago', async () => {
    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    await crear();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.setValue({
      nombre: ' Ana ',
      apellido: 'García',
      email: 'ana@mail.com',
      direccion: 'Calle 123',
      ciudad: 'CABA',
      codigoPostal: '1414',
    });
    component.continuar();
    expect(TestBed.inject(CheckoutService).datosEnvio()?.nombre).toBe('Ana');
    expect(navigate).toHaveBeenCalledWith(['/checkout/pago']);
  });
});
```

- [ ] **Step 2: Run and confirm failure.**

- [ ] **Step 3: Implement**

`checkout-confirmacion.component.ts`:
```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CheckoutService, DatosEnvio } from '../services/checkout.service';

@Component({
  selector: 'app-checkout-confirmacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-confirmacion.component.html',
  styleUrls: ['./checkout-confirmacion.component.css'],
})
export class CheckoutConfirmacionComponent {
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = this.cart.items;
  readonly total = this.cart.total;
  readonly cantidadTotal = this.cart.cantidadTotal;

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{4,8}$/)]],
  });

  constructor() {
    const previo = this.checkout.datosEnvio();
    const usuario = this.auth.usuarioActual();
    if (previo) {
      this.form.setValue(previo);
    } else if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre ?? '',
        apellido: usuario.apellido ?? '',
        email: usuario.email ?? '',
        direccion: usuario.direccion ?? '',
      });
    }
  }

  cambiarCantidad(id: number, cantidad: number): void {
    this.cart.cambiarCantidad(id, cantidad);
  }

  quitar(id: number): void {
    this.cart.quitar(id);
  }

  campoInvalido(campo: keyof DatosEnvio): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  continuar(): void {
    if (this.form.invalid || this.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const datos = Object.fromEntries(
      Object.entries(valores).map(([clave, valor]) => [clave, valor.trim()]),
    ) as unknown as DatosEnvio;
    this.checkout.guardarEnvio(datos);
    this.router.navigate(['/checkout/pago']);
  }
}
```

`checkout-confirmacion.component.html`:
```html
<section class="checkout">
  <h1 class="checkout-title">Confirmá tu pedido</h1>

  @if (items().length === 0) {
    <div class="empty-state">
      <p class="empty-title">Tu carrito está vacío</p>
      <p class="empty-text">Agregá productos para continuar con la compra.</p>
      <a routerLink="/productos" class="btn-primary">Ver productos</a>
    </div>
  } @else {
    <div class="checkout-grid">
      <div class="checkout-main">
        <ul class="cart-list">
          @for (item of items(); track item.id) {
            <li class="cart-item">
              <img class="cart-item-img" [src]="item.imagen" [alt]="item.nombre" />
              <div class="cart-item-info">
                <p class="cart-item-name">{{ item.nombre }}</p>
                <p class="cart-item-price">$ {{ item.precio | number: '1.0-0' }} ARS c/u</p>
              </div>
              <div class="qty-control">
                <button type="button" class="qty-btn" data-test="restar"
                  (click)="cambiarCantidad(item.id, item.cantidad - 1)"
                  [attr.aria-label]="'Quitar una unidad de ' + item.nombre">−</button>
                <span class="qty-value">{{ item.cantidad }}</span>
                <button type="button" class="qty-btn" data-test="sumar"
                  (click)="cambiarCantidad(item.id, item.cantidad + 1)"
                  [attr.aria-label]="'Agregar una unidad de ' + item.nombre">+</button>
              </div>
              <p class="cart-item-subtotal">$ {{ item.precio * item.cantidad | number: '1.0-0' }} ARS</p>
              <button type="button" class="remove-btn" (click)="quitar(item.id)">Eliminar</button>
            </li>
          }
        </ul>

        <form id="form-envio" class="shipping-form" [formGroup]="form" (ngSubmit)="continuar()" novalidate>
          <h2 class="section-title">Datos de envío</h2>
          <div class="form-grid">
            <label class="field">
              <span>Nombre</span>
              <input type="text" formControlName="nombre" autocomplete="given-name" />
              @if (campoInvalido('nombre')) { <small class="field-error">Ingresá tu nombre.</small> }
            </label>
            <label class="field">
              <span>Apellido</span>
              <input type="text" formControlName="apellido" autocomplete="family-name" />
              @if (campoInvalido('apellido')) { <small class="field-error">Ingresá tu apellido.</small> }
            </label>
            <label class="field field-wide">
              <span>Email</span>
              <input type="email" formControlName="email" autocomplete="email" />
              @if (campoInvalido('email')) { <small class="field-error">Ingresá un email válido.</small> }
            </label>
            <label class="field field-wide">
              <span>Dirección</span>
              <input type="text" formControlName="direccion" autocomplete="street-address" />
              @if (campoInvalido('direccion')) { <small class="field-error">Ingresá tu dirección.</small> }
            </label>
            <label class="field">
              <span>Ciudad</span>
              <input type="text" formControlName="ciudad" autocomplete="address-level2" />
              @if (campoInvalido('ciudad')) { <small class="field-error">Ingresá tu ciudad.</small> }
            </label>
            <label class="field">
              <span>Código postal</span>
              <input type="text" formControlName="codigoPostal" autocomplete="postal-code" maxlength="8" />
              @if (campoInvalido('codigoPostal')) { <small class="field-error">Entre 4 y 8 letras o números.</small> }
            </label>
          </div>
        </form>
      </div>

      <aside class="summary">
        <h2 class="section-title">Resumen</h2>
        <div class="summary-row"><span>Productos ({{ cantidadTotal() }})</span><span>$ {{ total() | number: '1.0-0' }} ARS</span></div>
        <div class="summary-row"><span>Envío</span><span class="free">Gratis</span></div>
        <div class="summary-row summary-total"><span>Total</span><span>$ {{ total() | number: '1.0-0' }} ARS</span></div>
        <button type="submit" form="form-envio" class="btn-primary btn-block" data-test="continuar" [disabled]="form.invalid">
          Continuar al pago
        </button>
      </aside>
    </div>
  }
</section>
```

`checkout-confirmacion.component.css`: page container (max-width 1100px), two-column grid (`1fr 340px`, single column under 860px), card styles for list/form/summary, `.btn-primary` using `--primary-color`, disabled state, `.field-error` in `#dc3545`, `.free` in `--tertiary-color`. Keep under the 4 kB component style budget.

- [ ] **Step 4: Add the route** in `src/app/app.routes.ts` above `**`:
```ts
{
    path: 'checkout',
    component: CheckoutConfirmacionComponent
},
```

- [ ] **Step 5: Run and confirm pass.**

- [ ] **Step 6: Commit** — `git commit -m "feat(checkout): add order confirmation view"`

---

## Task 5: checkout-pago view (`/checkout/pago`)

**Files:**
- Create: `src/app/checkout-pago/validadores-tarjeta.ts`
- Create: `src/app/checkout-pago/checkout-pago.component.ts|html|css`
- Test: `src/app/checkout-pago/validadores-tarjeta.spec.ts`
- Test: `src/app/checkout-pago/checkout-pago.component.spec.ts`
- Modify: `src/app/app.routes.ts` (add `{ path: 'checkout/pago', component: CheckoutPagoComponent, canActivate: [carritoNoVacioGuard] }`)

**Interfaces:**
```ts
export function limpiarNumeroTarjeta(valor: string): string;
export const numeroTarjetaValidator: ValidatorFn;          // { numeroTarjeta: true }
export function vencimientoValidator(hoy?: () => Date): ValidatorFn; // { vencimientoFormato | vencimientoMes | vencimientoPasado: true }
class CheckoutPagoComponent { procesando: Signal<boolean>; error: Signal<string | null>; form; pagar(): void; }
```

- [ ] **Step 1: Write the failing tests**

`validadores-tarjeta.spec.ts`:
```ts
import { FormControl } from '@angular/forms';
import { limpiarNumeroTarjeta, numeroTarjetaValidator, vencimientoValidator } from './validadores-tarjeta';

describe('validadores de tarjeta', () => {
  const numero = (valor: string) => numeroTarjetaValidator(new FormControl(valor));
  // 15 March 2026
  const vencimiento = (valor: string) => vencimientoValidator(() => new Date(2026, 2, 15))(new FormControl(valor));

  it('debería quitar espacios del número', () => {
    expect(limpiarNumeroTarjeta(' 4111 1111 1111 1111 ')).toBe('4111111111111111');
  });

  it('debería aceptar 16 dígitos con o sin espacios', () => {
    expect(numero('4111111111111111')).toBeNull();
    expect(numero('4111 1111 1111 1111')).toBeNull();
  });

  it('debería rechazar números con largo incorrecto o caracteres no numéricos', () => {
    expect(numero('411111111111111')).toEqual({ numeroTarjeta: true });
    expect(numero('41111111111111112')).toEqual({ numeroTarjeta: true });
    expect(numero('4111-1111-1111-1111')).toEqual({ numeroTarjeta: true });
  });

  it('debería delegar el campo vacío a required', () => {
    expect(numero('')).toBeNull();
    expect(vencimiento('')).toBeNull();
  });

  it('debería exigir el formato MM/AA', () => {
    expect(vencimiento('3/27')).toEqual({ vencimientoFormato: true });
    expect(vencimiento('03-27')).toEqual({ vencimientoFormato: true });
  });

  it('debería rechazar meses inválidos', () => {
    expect(vencimiento('00/27')).toEqual({ vencimientoMes: true });
    expect(vencimiento('13/27')).toEqual({ vencimientoMes: true });
  });

  it('debería aceptar el mes actual y rechazar el anterior', () => {
    expect(vencimiento('03/26')).toBeNull();
    expect(vencimiento('02/26')).toEqual({ vencimientoPasado: true });
    expect(vencimiento('12/25')).toEqual({ vencimientoPasado: true });
    expect(vencimiento('01/27')).toBeNull();
  });
});
```

`checkout-pago.component.spec.ts`:
```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { PAYMENT_DELAY_MS, PaymentSimulatorService, ResultadoPago } from '../services/payment-simulator.service';
import { CheckoutPagoComponent } from './checkout-pago.component';

const envio = {
  nombre: 'Ana', apellido: 'García', email: 'ana@mail.com',
  direccion: 'Calle 123', ciudad: 'CABA', codigoPostal: '1414',
};

describe('CheckoutPagoComponent', () => {
  let fixture: ComponentFixture<CheckoutPagoComponent>;
  let component: CheckoutPagoComponent;
  let cart: CartService;
  let navigate: ReturnType<typeof vi.spyOn>;

  const completarTarjeta = (numero: string) =>
    component.form.setValue({ numero, titular: 'Ana García', vencimiento: '12/99', cvv: '123' });

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CheckoutPagoComponent],
      providers: [provideRouter([]), { provide: PAYMENT_DELAY_MS, useValue: 0 }],
    });
    cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 2);
    TestBed.inject(CheckoutService).guardarEnvio(envio);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CheckoutPagoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  it('debería mostrar el resumen y la pista de tarjeta de prueba', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2 productos');
    expect(el.textContent).toContain('2,000');
    expect(el.textContent).toContain('0000');
  });

  it('debería deshabilitar el botón de pago con el formulario inválido', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector('[data-test="pagar"]') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería redirigir a /checkout si no hay datos de envío', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ imports: [CheckoutPagoComponent], providers: [provideRouter([])] });
    const spy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const f = TestBed.createComponent(CheckoutPagoComponent);
    await f.whenStable();
    expect(spy).toHaveBeenCalledWith(['/checkout']);
  });

  it('debería aprobar, vaciar el carrito y navegar al resultado', async () => {
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    expect(component.procesando()).toBe(true);
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(['/checkout/resultado']));
    expect(cart.items()).toEqual([]);
    const pedido = TestBed.inject(CheckoutService).ultimoPedido();
    expect(pedido?.numeroPedido).toMatch(/^TC-\d{6}$/);
    expect(pedido?.total).toBe(2000);
    expect(pedido?.envio).toEqual(envio);
  });

  it('debería mostrar el error, conservar el carrito y permitir reintentar', async () => {
    completarTarjeta('4111 1111 1111 0000');
    component.pagar();
    await vi.waitFor(() => expect(component.error()).toBe('Fondos insuficientes'));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.payment-error')?.textContent).toContain('Fondos insuficientes');
    expect(el.querySelector('[data-test="pagar"]')?.textContent).toContain('Reintentar');
    expect(component.procesando()).toBe(false);
    expect(component.form.enabled).toBe(true);
    expect(cart.cantidadTotal()).toBe(2);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debería ignorar un segundo envío mientras procesa', () => {
    const pendiente = new Subject<ResultadoPago>();
    const procesar = vi.spyOn(TestBed.inject(PaymentSimulatorService), 'procesarPago').mockReturnValue(pendiente);
    completarTarjeta('4111111111111111');
    component.pagar();
    component.pagar();
    expect(procesar).toHaveBeenCalledTimes(1);
    expect(procesar).toHaveBeenCalledWith(expect.objectContaining({ numero: '4111111111111111' }));
    expect(component.form.disabled).toBe(true);
  });
});
```

- [ ] **Step 2: Run and confirm failure.**

- [ ] **Step 3: Implement**

`validadores-tarjeta.ts`:
```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function limpiarNumeroTarjeta(valor: string): string {
  return valor.replace(/\s+/g, '');
}

export const numeroTarjetaValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = limpiarNumeroTarjeta(String(control.value ?? ''));
  if (!valor) {
    return null;
  }
  return /^\d{16}$/.test(valor) ? null : { numeroTarjeta: true };
};

export function vencimientoValidator(hoy: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return null;
    }
    const coincidencia = /^(\d{2})\/(\d{2})$/.exec(valor);
    if (!coincidencia) {
      return { vencimientoFormato: true };
    }
    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);
    if (mes < 1 || mes > 12) {
      return { vencimientoMes: true };
    }
    // Cards are valid through the last day of their expiry month.
    const fecha = hoy();
    const mesActual = fecha.getFullYear() * 12 + fecha.getMonth();
    const mesVencimiento = anio * 12 + (mes - 1);
    return mesVencimiento < mesActual ? { vencimientoPasado: true } : null;
  };
}
```

`checkout-pago.component.ts`:
```ts
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CheckoutService, DatosEnvio } from '../services/checkout.service';
import { PaymentSimulatorService, ResultadoPago } from '../services/payment-simulator.service';
import { limpiarNumeroTarjeta, numeroTarjetaValidator, vencimientoValidator } from './validadores-tarjeta';

type CampoTarjeta = 'numero' | 'titular' | 'vencimiento' | 'cvv';

@Component({
  selector: 'app-checkout-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-pago.component.html',
  styleUrls: ['./checkout-pago.component.css'],
})
export class CheckoutPagoComponent implements OnInit {
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly pagos = inject(PaymentSimulatorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cantidadTotal = this.cart.cantidadTotal;
  readonly total = this.cart.total;
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    numero: ['', [Validators.required, numeroTarjetaValidator]],
    titular: ['', Validators.required],
    vencimiento: ['', [Validators.required, vencimientoValidator()]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  ngOnInit(): void {
    // Shipping data lives in memory only; a refresh sends the user back to fill it again.
    if (!this.checkout.datosEnvio()) {
      this.router.navigate(['/checkout']);
    }
  }

  campoInvalido(campo: CampoTarjeta): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  pagar(): void {
    if (this.procesando()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const envio = this.checkout.datosEnvio();
    if (!envio) {
      this.router.navigate(['/checkout']);
      return;
    }

    const { numero, titular, vencimiento, cvv } = this.form.getRawValue();
    const total = this.cart.total();
    this.procesando.set(true);
    this.error.set(null);
    this.form.disable();

    this.pagos
      .procesarPago({ numero: limpiarNumeroTarjeta(numero), titular: titular.trim(), vencimiento, cvv })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => this.manejarResultado(resultado, total, envio),
        error: () => this.mostrarRechazo('No pudimos procesar el pago. Intentá nuevamente.'),
      });
  }

  private manejarResultado(resultado: ResultadoPago, total: number, envio: DatosEnvio): void {
    if (!resultado.aprobado || !resultado.numeroPedido) {
      this.mostrarRechazo(resultado.motivo ?? 'El pago fue rechazado.');
      return;
    }
    this.checkout.registrarPedido({ numeroPedido: resultado.numeroPedido, total, envio });
    this.cart.vaciar();
    this.router.navigate(['/checkout/resultado']);
  }

  private mostrarRechazo(motivo: string): void {
    this.error.set(motivo);
    this.procesando.set(false);
    this.form.enable();
  }
}
```

`checkout-pago.component.html`:
```html
<section class="payment">
  <a routerLink="/checkout" class="back-link">← Volver al pedido</a>
  <h1 class="payment-title">Pago con tarjeta</h1>

  <div class="payment-grid">
    <form class="card-form" [formGroup]="form" (ngSubmit)="pagar()" novalidate>
      <label class="field">
        <span>Número de tarjeta</span>
        <input type="text" formControlName="numero" inputmode="numeric" autocomplete="cc-number"
          placeholder="4111 1111 1111 1111" maxlength="19" />
        @if (campoInvalido('numero')) { <small class="field-error">Ingresá los 16 dígitos de la tarjeta.</small> }
      </label>
      <label class="field">
        <span>Titular</span>
        <input type="text" formControlName="titular" autocomplete="cc-name" placeholder="Como figura en la tarjeta" />
        @if (campoInvalido('titular')) { <small class="field-error">Ingresá el nombre del titular.</small> }
      </label>
      <div class="field-row">
        <label class="field">
          <span>Vencimiento</span>
          <input type="text" formControlName="vencimiento" autocomplete="cc-exp" placeholder="MM/AA" maxlength="5" />
          @if (campoInvalido('vencimiento')) { <small class="field-error">Usá MM/AA con una fecha vigente.</small> }
        </label>
        <label class="field">
          <span>CVV</span>
          <input type="password" formControlName="cvv" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="3" />
          @if (campoInvalido('cvv')) { <small class="field-error">3 dígitos.</small> }
        </label>
      </div>

      <p class="test-hint">Modo de prueba: las tarjetas terminadas en <strong>0000</strong> son rechazadas.</p>

      @if (error(); as motivo) {
        <div class="payment-error" role="alert">
          <strong>Pago rechazado:</strong> {{ motivo }}
        </div>
      }

      <button type="submit" class="btn-primary btn-block" data-test="pagar" [disabled]="form.invalid || procesando()">
        @if (procesando()) {
          Procesando pago...
        } @else if (error()) {
          Reintentar
        } @else {
          Pagar $ {{ total() | number: '1.0-0' }} ARS
        }
      </button>
    </form>

    <aside class="summary">
      <h2 class="section-title">Tu pedido</h2>
      <div class="summary-row"><span>{{ cantidadTotal() }} productos</span><span>$ {{ total() | number: '1.0-0' }} ARS</span></div>
      <div class="summary-row"><span>Envío</span><span class="free">Gratis</span></div>
      <div class="summary-row summary-total"><span>Total</span><span>$ {{ total() | number: '1.0-0' }} ARS</span></div>
    </aside>
  </div>
</section>
```

`checkout-pago.component.css`: same visual language as Task 4 (cards, `.btn-primary`, `.field`, `.summary`), plus `.test-hint` (muted, small) and `.payment-error` (`#f8d7da` background, `#842029` text, rounded). Under 4 kB.

- [ ] **Step 4: Add the route** above `**`:
```ts
{
    path: 'checkout/pago',
    component: CheckoutPagoComponent,
    canActivate: [carritoNoVacioGuard]
},
```

- [ ] **Step 5: Run and confirm pass.**

- [ ] **Step 6: Commit** — `git commit -m "feat(checkout): add mocked card payment view"`

---

## Task 6: checkout-resultado view (`/checkout/resultado`)

**Files:**
- Create: `src/app/checkout-resultado/checkout-resultado.component.ts|html|css`
- Test: `src/app/checkout-resultado/checkout-resultado.component.spec.ts`
- Modify: `src/app/app.routes.ts` (add `{ path: 'checkout/resultado', component: CheckoutResultadoComponent }`)

- [ ] **Step 1: Write the failing test**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutResultadoComponent } from './checkout-resultado.component';

describe('CheckoutResultadoComponent', () => {
  let fixture: ComponentFixture<CheckoutResultadoComponent>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CheckoutResultadoComponent],
      providers: [provideRouter([])],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('debería mostrar el número de pedido y la dirección de envío', async () => {
    TestBed.inject(CheckoutService).registrarPedido({
      numeroPedido: 'TC-123456',
      total: 2000,
      envio: { nombre: 'Ana', apellido: 'García', email: 'ana@mail.com', direccion: 'Calle 123', ciudad: 'CABA', codigoPostal: '1414' },
    });
    fixture = TestBed.createComponent(CheckoutResultadoComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('¡Pago aprobado!');
    expect(el.textContent).toContain('TC-123456');
    expect(el.textContent).toContain('Calle 123');
    expect(el.querySelector('a[href="/home"]')?.textContent).toContain('Volver a la tienda');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debería redirigir a /home si no hay resultado', async () => {
    fixture = TestBed.createComponent(CheckoutResultadoComponent);
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });
});
```

- [ ] **Step 2: Run and confirm failure.**

- [ ] **Step 3: Implement**

`checkout-resultado.component.ts`:
```ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';

@Component({
  selector: 'app-checkout-resultado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout-resultado.component.html',
  styleUrls: ['./checkout-resultado.component.css'],
})
export class CheckoutResultadoComponent implements OnInit {
  private readonly router = inject(Router);
  readonly pedido = inject(CheckoutService).ultimoPedido;

  ngOnInit(): void {
    if (!this.pedido()) {
      this.router.navigate(['/home']);
    }
  }
}
```

`checkout-resultado.component.html`:
```html
@if (pedido(); as p) {
  <section class="result">
    <div class="result-card">
      <div class="result-icon" aria-hidden="true">✓</div>
      <h1 class="result-title">¡Pago aprobado!</h1>
      <p class="result-text">Gracias por tu compra, {{ p.envio.nombre }}. Te enviamos la confirmación a {{ p.envio.email }}.</p>
      <dl class="result-details">
        <div><dt>Número de pedido</dt><dd class="order-number">{{ p.numeroPedido }}</dd></div>
        <div><dt>Total pagado</dt><dd>$ {{ p.total | number: '1.0-0' }} ARS</dd></div>
        <div><dt>Envío a</dt><dd>{{ p.envio.direccion }}, {{ p.envio.ciudad }} ({{ p.envio.codigoPostal }})</dd></div>
      </dl>
      <a routerLink="/home" class="btn-primary">Volver a la tienda</a>
    </div>
  </section>
}
```

`checkout-resultado.component.css`: centered card, green check icon using `--tertiary-color`, detail list, `.btn-primary`.

- [ ] **Step 4: Add the route** above `**`.

- [ ] **Step 5: Run and confirm pass.**

- [ ] **Step 6: Commit** — `git commit -m "feat(checkout): add payment result view"`

---

## Task 7: Header and detail page wiring

> **Update (header from upstream `main`, commit 69332b6):** the header was replaced by upstream's version (login/logout, admin link, `cartCount = 0` with a TODO, badge rendered only when `cartCount > 0`). The wiring was applied to that header instead of the snippets below: `cartCount` became `inject(CartService).cantidadTotal` (TODO removed), the template reads `cartCount()` and keeps the "hide when 0" badge, the cart `<button>` became `<a class="cart-btn" routerLink="/checkout">` (`text-decoration: none` added), and upstream's auth behavior and its spec cases were left untouched. The new spec cases assert no badge for an empty cart, the live count after `agregar`, and `href="/checkout"`. The detail page part was done separately (commit 0abee77).

**Files:**
- Modify: `src/app/layout/header/header.component.ts|html`, `header.component.spec.ts`
- Modify: `src/app/detalles-producto/detalles-producto.component.ts|html`, `detalles-producto.component.spec.ts`

- [ ] **Step 1: Update tests first**

`header.component.spec.ts` — replace the hardcoded-count test with:
```ts
  it('debería mostrar la cantidad real de items en el carrito', async () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cart-badge')?.textContent?.trim()).toBe('0');

    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 3);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(compiled.querySelector('.cart-badge')?.textContent?.trim()).toBe('3');
  });

  it('debería enlazar el botón del carrito a /checkout', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector('.cart-btn');
    expect(boton?.getAttribute('href')).toBe('/checkout');
  });
```
(The cart control becomes an `<a>` so it exposes a real `href`; `localStorage.clear()` in `beforeEach`/`afterEach`.)

`detalles-producto.component.spec.ts` — add:
```ts
  it('debería agregar el producto actual al carrito con la cantidad elegida', () => {
    component.changeQuantity(1);
    component.triggerAddToCart();
    const cart = TestBed.inject(CartService);
    expect(cart.items()).toEqual([
      { id: 1, nombre: component.title, precio: component.price, imagen: component.mainImageSrc, cantidad: 2 },
    ]);
    expect(component.showToast()).toBe(true);
  });

  it('debería agregar y navegar a /checkout con "Comprar ahora"', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.comprarAhora();
    expect(TestBed.inject(CartService).cantidadTotal()).toBe(1);
    expect(navigate).toHaveBeenCalledWith(['/checkout']);
  });

  it('debería enlazar los accesos del aviso al checkout con la cantidad real', async () => {
    component.triggerAddToCart();
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.toast-link');
    expect(links[0].textContent).toContain('Ver carrito (1)');
    expect(links[0].getAttribute('href')).toBe('/checkout');
    expect(links[1].getAttribute('href')).toBe('/checkout');
  });
```

- [ ] **Step 2: Run and confirm the new tests fail.**

- [ ] **Step 3: Implement**

`header.component.ts`:
```ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({ /* unchanged metadata */ })
export class HeaderComponent {
  //Cambiar cuando tengamos BD
  userName: string = 'user';
  readonly cartCount = inject(CartService).cantidadTotal;
}
```
`header.component.html`: the cart `<button class="cart-btn">` becomes `<a class="cart-btn" routerLink="/checkout" aria-label="Carrito de compras">`, badge renders `{{ cartCount() }}`. Add `text-decoration: none` to `.cart-btn` in the CSS.

`detalles-producto.component.ts` additions:
```ts
  private readonly cart = inject(CartService);
  private readonly router = inject(Router);
  readonly productId = 1;
  readonly cantidadEnCarrito = this.cart.cantidadTotal;
  readonly cantidadAgregada = signal(1);

  private agregarProductoActual(): void {
    this.cart.agregar(
      { id: this.productId, nombre: this.title, precio: this.price, imagen: this.mainImageSrc },
      this.quantity(),
    );
    this.cantidadAgregada.set(this.quantity());
  }

  triggerAddToCart(): void {
    this.agregarProductoActual();
    // ...existing toast logic unchanged
  }

  comprarAhora(): void {
    this.agregarProductoActual();
    this.router.navigate(['/checkout']);
  }
```
`detalles-producto.component.html`: toast message `{{ cantidadAgregada() }}x {{ title }} añadido con éxito`; links become `<a class="toast-link" routerLink="/checkout">Ver carrito ({{ cantidadEnCarrito() }})</a>` and `<a class="toast-link muted" routerLink="/checkout">Finalizar compra</a>`; "Comprar ahora" button gets `(click)="comprarAhora()"`.

- [ ] **Step 4: Run and confirm pass.**

- [ ] **Step 5: Commit** — `git commit -m "feat(cart): wire header counter and detail page to the cart"`

---

## Final verification

- [ ] `npx ng test --watch=false` — all new tests pass; only the two pre-existing failures remain (`app.spec.ts`, `home.component.spec.ts`).
- [ ] `npx ng build` (fall back to `--configuration development` if pre-existing production budgets fail; report it).
- [ ] Manual end-to-end on the running dev server (spec "Manual end-to-end" steps 1–6).
