import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { Product } from '../productCard/productCard.component';
import { PedidoDTO, PedidoService } from './pedido.service';
import { ProductService } from './product.service';

export interface DatosEnvio {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export interface LineaCheckout {
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  /** Imagen del catálogo; vacía si no se pudo resolver. */
  imagen: string;
}

/** Totales y líneas que muestran el resumen de compra y el comprobante. */
export interface ResumenCompra {
  lineas: LineaCheckout[];
  cantidadTotal: number;
  total: number;
}

/** Vista resumida del pedido en estado "carrito" para las pantallas de checkout. */
export interface CarritoCheckout extends ResumenCompra {
  idPedido: number;
}

export interface MedioPago {
  marca: string;
  ultimos4: string;
}

export interface PedidoConfirmado extends ResumenCompra {
  numeroPedido: string;
  envio: DatosEnvio;
  fecha: Date;
  pago: MedioPago;
}

// Los datos de envío viven solo en memoria: recargar la página los borra a propósito.
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly pedidos = inject(PedidoService);
  private readonly productos = inject(ProductService);

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

  /** Carga el carrito activo del usuario desde el backend (null si no hay o está vacío). */
  cargarCarrito(): Observable<CarritoCheckout | null> {
    return forkJoin([
      this.pedidos.obtenerMisPedidos(),
      // Las imágenes son decorativas: si el catálogo falla, el checkout sigue funcionando.
      this.productos.obtenerProductos().pipe(catchError(() => of([] as Product[]))),
    ]).pipe(
      map(([pedidos, catalogo]) =>
        resumirCarrito(
          pedidos.find((p) => p.estado === 'carrito'),
          catalogo,
        ),
      ),
    );
  }

  /** Marca el carrito como completado en el backend. */
  finalizarCarrito(idPedido: number): Observable<PedidoDTO> {
    return this.pedidos.finalizarPedido(idPedido);
  }

  vaciarContadorCarrito(): void {
    this.pedidos.cantidadCarrito.set(0);
  }

  /** Número de pedido legible a partir del id real del pedido, ej: TC-000042. */
  numeroPedido(idPedido: number): string {
    return `TC-${idPedido.toString().padStart(6, '0')}`;
  }
}

function resumirCarrito(pedido: PedidoDTO | undefined, catalogo: Product[]): CarritoCheckout | null {
  if (!pedido?.productos?.length) {
    return null;
  }
  // El backend devuelve una fila por cada alta; se agrupan por nombre de producto.
  const grupos = new Map<string, LineaCheckout>();
  for (const item of pedido.productos) {
    const cantidad = Number(item.cantidad);
    const precio = Number(item.precio);
    const existente = grupos.get(item.producto);
    if (existente) {
      existente.cantidad += cantidad;
      existente.subtotal = existente.precio * existente.cantidad;
    } else {
      grupos.set(item.producto, {
        nombre: item.producto,
        precio,
        cantidad,
        subtotal: precio * cantidad,
        imagen: catalogo.find((p) => p.title === item.producto)?.imageUrl ?? '',
      });
    }
  }
  const lineas = Array.from(grupos.values());
  return {
    idPedido: pedido.id,
    lineas,
    cantidadTotal: lineas.reduce((acc, l) => acc + l.cantidad, 0),
    total: lineas.reduce((acc, l) => acc + l.subtotal, 0),
  };
}
