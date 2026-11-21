import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { CarritoGuestService } from './carrito-guest.service';
import { ItemGuest } from '../interfaces/carrito-guest';
import { AgregarProductoDTO, CrearPedidoDTO, PedidoDTO, PedidoProductoDTO, ProductoParaCarrito } from '../interfaces/pedido';


@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private carritoGuest = inject(CarritoGuestService);
  private apiUrl = `${environment.apiUrl}/pedidos`;

  cantidadCarrito = signal<number>(0);

  constructor() {
    // Cerrar sesión (header, perfil o interceptor 401) => contador en 0.
    // Se suscribe por evento para no crear el ciclo AuthService -> PedidoService.
    this.auth.sesionCerrada$.subscribe(() => this.cantidadCarrito.set(0));
  }

  esGuest(): boolean {
    return !this.auth.estaLogueado();
  }

  agregarAlCarrito(producto: ProductoParaCarrito, cantidad: number): Observable<void> {
    if (this.esGuest()) {
      this.carritoGuest.agregar({
        id_producto: producto.id,
        producto: producto.nombre,
        categoria: producto.categoria,
        subcategoria: producto.subcategoria,
        precio: producto.precio,
        imageUrl: producto.imageUrl,
        cantidad,
      });
      this.cantidadCarrito.set(this.carritoGuest.cantidad());
      return of(void 0);
    }

    return this.obtenerMisPedidos().pipe(
      switchMap((pedidos) => {
        const activo = pedidos.find((p) => p.estado === 'carrito');
        return activo ? of(activo) : this.crearPedido({ estado: 'carrito' });
      }),
      switchMap((pedido) => this.agregarProducto(pedido.id, { id_producto: producto.id, cantidad })),
      map(() => void 0)
    );
  }

  inicializarContador(): void {
    if (this.esGuest()) {
      this.cantidadCarrito.set(this.carritoGuest.cantidad());
      return;
    }

    // Sesión activa con ítems locales (F5, sesión restaurada, otro dispositivo):
    // es el caso en que el merge no corría, porque solo vivía dentro de login().
    // Primero se suben al backend y recién ahí se sincroniza el contador.
    if (this.carritoGuest.cantidad() > 0) {
      this.auth.mergeCarritoGuest().subscribe({
        next: () => this.cargarContadorCarrito(),
      });
      return;
    }

    this.cargarContadorCarrito();
  }

  itemsGuest(): ItemGuest[] {
    return this.carritoGuest.items();
  }

  cantidadGuest(): number {
    return this.carritoGuest.cantidad();
  }

  cambiarCantidadGuest(id_producto: number, delta: number): void {
    this.carritoGuest.cambiarCantidad(id_producto, delta);
    this.cantidadCarrito.set(this.carritoGuest.cantidad());
  }

  quitarGuest(id_producto: number): void {
    this.carritoGuest.quitar(id_producto);
    this.cantidadCarrito.set(this.carritoGuest.cantidad());
  }

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

  obtenerMisPedidos(): Observable<PedidoDTO[]> {
    return this.http.get<PedidoDTO[]>(this.apiUrl);
  }

  obtenerPedido(idPedido: number): Observable<PedidoDTO> {
    return this.http.get<PedidoDTO>(`${this.apiUrl}/${idPedido}`);
  }

  crearPedido(data?: CrearPedidoDTO): Observable<PedidoDTO> {
    return this.http.post<PedidoDTO>(this.apiUrl, data ?? { estado: 'carrito' });
  }

  agregarProducto(idPedido: number, data: AgregarProductoDTO): Observable<PedidoProductoDTO> {
    return this.http.post<PedidoProductoDTO>(`${this.apiUrl}/${idPedido}/productos`, data).pipe(
      tap(() => {
        this.cantidadCarrito.update(count => count + (data.cantidad ?? 1));
      })
    );
  }

  finalizarPedido(idPedido: number) {
    return this.http.put<PedidoDTO>(`${environment.apiUrl}/pedidos/${idPedido}`, { estado: 'completado' });
  }

  eliminarProductoDelPedido(idPedido: number, idItemPedido: number): Observable<PedidoDTO> {
    return this.http.delete<PedidoDTO>(`${this.apiUrl}/${idPedido}/productos/${idItemPedido}`);
  }
  eliminarProductoCompleto(idPedido: number, idProductoReal: number, idItemFallback: number): Observable<PedidoDTO> {
    return this.http.delete<PedidoDTO>(`${this.apiUrl}/${idPedido}/productos/producto/${idProductoReal}`).pipe(
      catchError(() => this.eliminarProductoDelPedido(idPedido, idItemFallback))
    );
  }
}
