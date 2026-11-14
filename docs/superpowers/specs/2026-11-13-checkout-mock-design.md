# Mocked Checkout: Order Confirmation and Payment Simulation

- **Date:** 2026-11-13
- **Branch:** `feat/confirmacion-pedido-pago`
- **Status:** Approved design

## Goal

Add a believable, fully mocked purchase flow to the storefront: the user adds products to a cart, reviews the order, enters fake card data, and sees an approved or rejected payment. No real orders are stored and no real payment is processed.

## Context

- The cart does not exist today. `header.component.ts` hardcodes `cartCount = 2`. The detail page's "Agregar al carrito" only shows a toast, and its "Finalizar compra" and "Comprar ahora" controls do nothing.
- `AuthService` (`src/app/services/auth.service.ts`) exposes `usuarioActual` (signal) with `nombre`, `apellido`, `email`, `direccion`.
- The detail page (`/detalles`) uses hardcoded product data and has no `:id` param.
- The backend `Pedido` routes are not mounted and the model lacks quantity, total and user. This flow does not use them.

## Scope

**In scope (frontend only):**

1. `CartService`: client-side cart with `localStorage` persistence.
2. `PaymentSimulatorService`: fake payment with deterministic approve/reject rules.
3. Three standalone views:
   - `/checkout`: order confirmation.
   - `/checkout/pago`: payment simulation.
   - `/checkout/resultado`: payment result.
4. Wiring:
   - The header cart counter shows the real count and links to `/checkout`.
   - The detail page's "Agregar al carrito", "Ver carrito", "Finalizar compra" and "Comprar ahora" use the cart.
5. Unit tests (Vitest) and a manual end-to-end check in the browser.

**Out of scope:**

- Persisting orders in the backend.
- Real payment providers.
- Other payment methods.
- "Mis pedidos" in the profile.
- Stock validation.
- Making the detail page load a real product by `:id` (see Follow-up).

## Flow

```
/detalles ──"Agregar al carrito"──> CartService.agregar() + toast
          ──"Comprar ahora"──────> CartService.agregar() → /checkout
Header cart icon (live count) ──> /checkout

/checkout           items (+/- quantity, remove), subtotal, shipping (free), total,
                    shipping data form (prefilled from AuthService when logged in)
  └ "Continuar al pago" (form valid, cart not empty) → /checkout/pago
/checkout/pago      fake card form → "Procesando pago..." (~2 s)
  ├ approved → CartService.vaciar() → /checkout/resultado (fake order number)
  └ rejected → inline error + "Reintentar"; cart is kept
```

## Units

### CartService (`src/app/services/cart.service.ts`)

- **`CartItem`:** `{ id: number; nombre: string; precio: number; imagen: string; cantidad: number }`.
- **State:**
  - `items`: a private `signal<CartItem[]>`, exposed read-only.
  - `cantidadTotal`: a `computed` with the sum of all quantities.
  - `total`: a `computed` with the sum of `precio * cantidad`.
- **`agregar(producto, cantidad = 1)`:** if the id already exists, the quantity is added to that item. Otherwise a new item is appended.
- **`cambiarCantidad(id, cantidad)`:** a quantity of 1 or less removes the item.
- **Other methods:** `quitar(id)` and `vaciar()`.
- **Persistence:**
  - Every change writes the items to `localStorage` under the key `carrito`.
  - On startup the service reads that key.
  - Invalid JSON or a missing key gives an empty cart.
  - All storage access is wrapped in try/catch.

### Shipping data (shared between steps)

`CheckoutService` (`src/app/services/checkout.service.ts`) holds the shipping data entered in `/checkout` as a signal: `{ nombre, apellido, email, direccion, ciudad, codigoPostal }`. It also holds the last order result, so `/checkout/pago` and `/checkout/resultado` can read both. It is memory only and clears on refresh.

### PaymentSimulatorService (`src/app/services/payment-simulator.service.ts`)

- **`procesarPago(tarjeta: DatosTarjeta): Observable<ResultadoPago>`**
- **Types:**
  - `DatosTarjeta`: `{ numero, titular, vencimiento, cvv }`.
  - `ResultadoPago`: `{ aprobado: boolean; numeroPedido?: string; motivo?: string }`.
- **Rules (deterministic for demos):**
  - A card number (digits only) ending in `0000` is rejected with `motivo: 'Fondos insuficientes'`.
  - Every other card is approved, with `numeroPedido` = `'TC-'` plus 6 random digits.
- **Delay:** results are emitted after `delay(2000)`. The delay is a constructor-injectable token (`PAYMENT_DELAY_MS`) so tests can use 0.

### Views (standalone, plain CSS using `styles.css` variables, Spanish UI copy)

**`checkout-confirmacion` (`/checkout`)**
- **Empty cart:** shows "Tu carrito está vacío" and a link to `/productos`.
- **Otherwise:**
  - Item list with image, name, unit price, quantity controls, line subtotal and a remove button.
  - Summary: subtotal, "Envío: Gratis", total.
  - Shipping form (reactive forms) with all fields required, an email validator, and `codigoPostal` limited to 4–8 alphanumeric characters.
- **Prefill:** when the user is logged in, the form is prefilled from `usuarioActual`.
- **"Continuar al pago":** disabled until the form is valid. It saves the data to `CheckoutService` and navigates to `/checkout/pago`.

**`checkout-pago` (`/checkout/pago`)**
- **Guard:** if the cart is empty, it redirects to `/checkout` (functional guard `carritoNoVacioGuard`).
- **Order summary:** item count and total.
- **Card form:**
  - `numero`: 16 digits; spaces are allowed and stripped.
  - `titular`: required.
  - `vencimiento`: `MM/AA`, a valid month, not in the past.
  - `cvv`: 3 digits.
- **Test card hint:** a small text explains that cards ending in `0000` are rejected.
- **Submit:**
  - The button is disabled and shows "Procesando pago...".
  - Approved: the result is stored in `CheckoutService`, `CartService.vaciar()` runs, and the view navigates to `/checkout/resultado`.
  - Rejected: an error box shows the reason, the form stays editable and the button turns back into "Reintentar". The cart is kept.

**`checkout-resultado` (`/checkout/resultado`)**
- **With an approved result:** shows "¡Pago aprobado!", the order number, the shipping address and a "Volver a la tienda" link.
- **Without a result** (direct visit or refresh): redirects to `/home`.

### Wiring changes

- **`header.component.ts`:**
  - `cartCount` is replaced by `cartService.cantidadTotal()`.
  - The cart button gets `routerLink="/checkout"`.
  - The `header.component.spec.ts` expectations are updated if they assert the hardcoded value.
- **`detalles-producto.component.ts`:**
  - `triggerAddToCart()` calls `cartService.agregar()` with the page's current product (id `1`, title, price, main image, selected quantity) and still shows the toast.
  - "Comprar ahora" adds the product and navigates to `/checkout`.
  - The toast links "Ver carrito" and "Finalizar compra" go to `/checkout`.
  - "Ver carrito" shows the live count.
- **`app.routes.ts`:** add the three routes above the `**` wildcard.

## Error handling

- Corrupt `localStorage`: the cart resets to empty and nothing is thrown.
- `/checkout/pago` without items: the guard redirects to `/checkout`.
- `/checkout/resultado` without a result: it redirects to `/home`.
- Rejected payment: the user sees an inline message and can retry.

## Testing

**Unit (Vitest, existing TestBed pattern, Spanish test names):**
- `CartService`:
  - add, merge by id, change quantity, remove, empty, and both totals.
  - Persistence round-trip.
  - Recovery from corrupt JSON.
- `PaymentSimulatorService` with delay 0:
  - approves a normal card;
  - rejects a card ending in `0000`;
  - order number matches `^TC-\d{6}$`.
- `carritoNoVacioGuard`: blocks when the cart is empty and allows when it has items.
- Each view renders:
  - Confirmation shows the empty state and the item list.
  - Payment disables submit while the form is invalid.
  - Result shows the order number.
- Header shows the live count.

**Manual end-to-end (browser):**
1. Add a product from `/detalles`.
2. The header counter updates.
3. Open `/checkout`, change the quantity, fill in the shipping form and continue.
4. Pay with `4111 1111 1111 1111`: approved, the order number is shown and the cart is empty.
5. Repeat with `4111 1111 1111 0000`: rejected, the cart is kept and a retry works.
6. Visit `/checkout/pago` with an empty cart: redirected to `/checkout`.

## Follow-up (required later)

**Detail page by `:id`.** `/detalles` uses hardcoded data, so the cart always receives the same product (id `1`). When the detail page is connected to the API:

- Change the route to `detalles/:id`.
- Load the product with `GET /api/productos/admin/:id`, or a new public `GET /api/productos/:id`.
- Pass the real `{ id, nombre, precio: Number(precio), imagen }` to `CartService.agregar()`.
- Update the product cards and catalog links to navigate to `/detalles/:id`.

`CartService` needs no changes for this: it already merges items by `id`.
