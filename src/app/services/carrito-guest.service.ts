import { Injectable, signal, computed } from '@angular/core';

export interface ItemGuest {
  id_producto: number;
  producto: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  imageUrl: string;
  cantidad: number;
}

const STORAGE_KEY = 'carrito_guest';

@Injectable({ providedIn: 'root' })
export class CarritoGuestService {
  items = signal<ItemGuest[]>(this.leer());

  /*contador d header*/
  cantidad = computed(() =>
    this.items().reduce((acc, item) => acc + item.cantidad, 0)
  );

  agregar(item: ItemGuest): void {
    const actual = this.items();
    const existente = actual.find(i => i.id_producto === item.id_producto);

    if (existente) {
      this.items.set(actual.map(i =>
        i.id_producto === item.id_producto
          ? { ...i, cantidad: i.cantidad + item.cantidad }
          : i
      ));
    } else {
      this.items.set([...actual, item]);
    }
    this.persistir();
  }

  cambiarCantidad(id_producto: number, delta: number): void {
    this.items.set(
      this.items()
        .map(i => i.id_producto === id_producto
          ? { ...i, cantidad: i.cantidad + delta }
          : i)
        .filter(i => i.cantidad > 0)
    );
    this.persistir();
  }

  quitar(id_producto: number): void {
    this.items.set(this.items().filter(i => i.id_producto !== id_producto));
    this.persistir();
  }

  /*Borrar cosas q ya estan en back */
  quitarRango(ids: number[]): void {
    this.items.set(this.items().filter(i => !ids.includes(i.id_producto)));
    this.persistir();
  }

  vaciar(): void {
    this.items.set([]);
    this.persistir();
  }

  private leer(): ItemGuest[] {
    try {
      const crudo = localStorage.getItem(STORAGE_KEY);
      return crudo ? JSON.parse(crudo) : [];
    } catch {
      return [];
    }
  }

  private persistir(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items()));
  }
}
