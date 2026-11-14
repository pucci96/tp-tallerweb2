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
