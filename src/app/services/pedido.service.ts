import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PedidoProductoDTO {
  id: number;
  id_pedido: number;
  id_producto?: number;
  producto: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

export interface PedidoDTO {
  id: number;
  id_usuario: number;
  fecha: Date | string;
  estado: string;
  total: number;
  productos: PedidoProductoDTO[];
}

export interface CrearPedidoDTO {
  estado?: string;
}

export interface AgregarProductoDTO {
  id_producto: number;
  cantidad?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  // SIGNAL GLOBAL para el contador del ícono del carrito en tiempo real
  cantidadCarrito = signal<number>(0);

  /** Carga inicial para contar cuántos productos tiene el carrito activo al iniciar sesión o la vista */
  cargarContadorCarrito() {
    this.obtenerMisPedidos().subscribe({
      next: (pedidos) => {
        const carritoActivo = pedidos.find(p => p.estado === 'carrito');
        if (carritoActivo && carritoActivo.productos) {
          const totalItems = carritoActivo.productos.reduce((acc, prod) => acc + prod.cantidad, 0);
          this.cantidadCarrito.set(totalItems);
        } else {
          this.cantidadCarrito.set(0);
        }
      },
      error: () => this.cantidadCarrito.set(0)
    });
  }

  /** Recalcula y actualiza la signal global consultando los pedidos activos del usuario de forma directa */
  actualizarContadorGlobalDirecto() {
    this.obtenerMisPedidos().subscribe({
      next: (pedidos) => {
        const carritoActivo = pedidos.find(p => p.estado === 'carrito');
        if (carritoActivo && carritoActivo.productos) {
          const totalUnidades = carritoActivo.productos.reduce((acc, prod) => acc + Number(prod.cantidad), 0);
          this.cantidadCarrito.set(totalUnidades);
        } else {
          this.cantidadCarrito.set(0);
        }
      },
      error: () => this.cantidadCarrito.set(0)
    });
  }

  /** Obtiene todos los pedidos realizados / carritos del usuario logueado. */
  obtenerMisPedidos(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(this.apiUrl);
  }

  /** Obtiene un pedido específico por su ID. */
  obtenerPedido(idPedido: number): Observable<PedidoDTO> {
    return this.http.get<PedidoDTO>(`${this.apiUrl}/${idPedido}`);
  }

  /** Crea un nuevo pedido (por defecto en estado "carrito"). */
  crearPedido(data?: CrearPedidoDTO): Observable<PedidoDTO> {
    return this.http.post<PedidoDTO>(this.apiUrl, data ?? { estado: 'carrito' });
  }

  /** Agrega un producto a un pedido en estado carrito e incrementa la signal global de forma reactiva. */
  agregarProducto(idPedido: number, data: AgregarProductoDTO): Observable<any> {
    return this.http.post<PedidoProductoDTO>(`${this.apiUrl}/${idPedido}/productos`, data).pipe(
      tap(() => {
        this.cantidadCarrito.update(count => count + (data.cantidad ?? 1));
      })
    );
  }

  finalizarPedido(idPedido: number) {
    return this.http.put<PedidoDTO>(`${environment.apiUrl}/pedidos/${idPedido}`, { estado: 'completado' });
  }

  /** Elimina un producto específico de un pedido (Petición DELETE al backend) */
  eliminarProductoDelPedido(idPedido: number, idItemPedido: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idPedido}/productos/${idItemPedido}`);
  }
}