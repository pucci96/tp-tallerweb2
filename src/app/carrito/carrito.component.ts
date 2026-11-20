import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PedidoService, PedidoDTO } from '../services/pedido.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  protected readonly auth = inject(AuthService);
  private router = inject(Router);

  carrito: PedidoDTO | null = null;
  cargando: boolean = true;


  mensajeAlerta: string | null = null;

  ngOnInit(): void {
    // guest: el carrito vive en el navegador, no en el back.
    if (this.pedidoService.esGuest()) {
      this.carrito = this.armarCarritoLocal();
      this.cargando = false;
      return;
    }
    this.cargarCarritoConImagenes();
  }

  /*convierte el carrito guest al estilo del back*/
  private armarCarritoLocal(): PedidoDTO | null {
    const items = this.pedidoService.itemsGuest();
    if (!items.length) {
      return null;
    }

    const productos = items.map((i) => ({
      id: i.id_producto,          // sirve como clave del @for
      id_pedido: 0,
      id_producto: i.id_producto,
      producto: i.producto,
      categoria: i.categoria,
      subcategoria: i.subcategoria,
      precio: i.precio,
      cantidad: i.cantidad,
      subtotal: i.precio * i.cantidad,
      imageUrl: i.imageUrl,
    }));

    return {
      id: 0,
      id_usuario: 0,
      fecha: new Date(),
      estado: 'carrito',
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
      productos,
    } as PedidoDTO;
  }

  /** Reconstruye la vista del carrito local y actualiza el contador del header. */
  private refrescarLocal(): void {
    this.carrito = this.armarCarritoLocal();
    this.pedidoService.cantidadCarrito.set(this.pedidoService.cantidadGuest());
    this.cdr.detectChanges();
  }

  cargarCarritoConImagenes(): void {
    this.cargando = true;

    // 1. Obtenemos el catálogo general de productos para rescatar sus imágenes reales
    this.http.get<any[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (productosCatalogo) => {
        // 2. Obtenemos los pedidos del usuario
        this.pedidoService.obtenerMisPedidos().subscribe({
          next: (pedidos) => {
            const carritoCrudo = pedidos.find(p => p.estado === 'carrito') || null;

            // Cruzamos los ítems del carrito con el catálogo para inyectarles la 'imageUrl'
            if (carritoCrudo && carritoCrudo.productos) {
              const productosMapeados = carritoCrudo.productos.map(itemPedido => {
                const prodEnCatalogo = productosCatalogo.find(
                  p => p.title === itemPedido.producto || p.nombre === itemPedido.producto
                );
                return {
                  ...itemPedido,
                  imageUrl: prodEnCatalogo ? (prodEnCatalogo.imageUrl || prodEnCatalogo.imagen) : 'assets/placeholder.png'
                };
              });

              // Agrupación precisa por ID o nombre único
              const productosAgrupadosMap = new Map<number | string, any>();

              for (const item of productosMapeados) {
                const claveUnica = item.id_producto ?? item.producto;

                if (productosAgrupadosMap.has(claveUnica)) {
                  const existente = productosAgrupadosMap.get(claveUnica);
                  existente.cantidad += item.cantidad;
                  existente.subtotal = existente.precio * existente.cantidad;
                  // Mantenemos el ID de línea más alto para conservar el orden arriba
                  if (item.id > existente.id) {
                    existente.id = item.id;
                  }
                } else {
                  productosAgrupadosMap.set(claveUnica, { ...item });
                }
              }

              // Convertimos el Map de vuelta a array y ordenamos para que el último agregado quede arriba
              this.carrito = {
                ...carritoCrudo,
                productos: Array.from(productosAgrupadosMap.values()).sort((a, b) => b.id - a.id)
              };
            } else {
              this.carrito = null;
            }

            this.cargando = false;
            this.actualizarContadorGlobal();
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al cargar los pedidos:', err);
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      },
      error: (err) => {
        console.error('Error al cargar el catálogo de productos para las imágenes:', err);
        // Si falla el catálogo, intentamos cargar el carrito igual
        this.pedidoService.obtenerMisPedidos().subscribe({
          next: (pedidos) => {
            this.carrito = pedidos.find(p => p.estado === 'carrito') || null;
            this.cargando = false;
            this.actualizarContadorGlobal();
            this.cdr.detectChanges();
          },
          error: () => {
            this.cargando = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  cambiarCantidad(item: any, delta: number): void {
    // Invitado: se modifica el carrito local, sin tocar el backend.
    if (this.pedidoService.esGuest()) {
      this.pedidoService.cambiarCantidadGuest(item.id_producto ?? item.id, delta);
      this.refrescarLocal();
      return;
    }

    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    item.cantidad = nuevaCantidad;
    item.subtotal = item.precio * nuevaCantidad;
    this.recalcularTotal();

    // Actualizamos el número del header al instante
    this.actualizarContadorGlobal();
    this.cdr.detectChanges();
  }

 eliminarProducto(idProductoOItem: number): void {
    // Invitado: se quita del carrito local, sin tocar el backend.
    if (this.pedidoService.esGuest()) {
      this.pedidoService.quitarGuest(idProductoOItem);
      this.mostrarToastML('¡Listo! Eliminaste el producto del carrito.');
      this.refrescarLocal();
      return;
    }

    if (!this.carrito || !this.carrito.productos) return;

    // Buscamos si hay varios ítems en el carrito que correspondan al mismo producto (por id_producto)
    const itemEncontrado = this.carrito.productos.find(p => p.id === idProductoOItem || p.id_producto === idProductoOItem);
    const idProductoReal = itemEncontrado ? (itemEncontrado.id_producto ?? itemEncontrado.id) : idProductoOItem;

    // Hacemos una petición DELETE masiva o apuntamos al endpoint que limpia el producto entero del pedido
    // Si tu backend soporta borrar por id_producto o si mandamos el id del ítem:
    this.http.delete(`${environment.apiUrl}/pedidos/${this.carrito.id}/productos/producto/${idProductoReal}`).subscribe({
      next: () => {
        this.cargarCarritoConImagenes();
        this.mostrarToastML('¡Listo! Eliminaste el producto del carrito.');
      },
      error: (err) => {
        console.error('Error al eliminar el producto:', err);
        // Fallback por si el backend usa el id directo del renglón
        this.http.delete(`${environment.apiUrl}/pedidos/${this.carrito!.id}/productos/${idProductoOItem}`).subscribe({
          next: () => {
            this.cargarCarritoConImagenes();
            this.mostrarToastML('¡Listo! Eliminaste el producto del carrito.');
          }
        });
      }
    });
  }

  private actualizarContadorGlobal(): void {
    if (this.carrito && this.carrito.productos) {
      const totalUnidades = this.carrito.productos.reduce((acc, item) => acc + item.cantidad, 0);
      this.pedidoService.cantidadCarrito.set(totalUnidades);
    } else {
      this.pedidoService.cantidadCarrito.set(0);
    }
  }

  private recalcularTotal(): void {
    if (this.carrito && this.carrito.productos) {
      this.carrito.total = this.carrito.productos.reduce(
        (acc, item) => acc + (item.subtotal || (item.precio * item.cantidad)),
        0
      );
    }
  }

  finalizarCompra(): void {
    // Invitado: no se puede comprar sin cuenta. Volvemos al carrito tras el login.
    if (this.pedidoService.esGuest()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/carrito' } });
      return;
    }

    if (!this.carrito) return;

    // Llamamos al servicio centralizado
    this.pedidoService.finalizarPedido(this.carrito.id).subscribe({
      next: () => {
        this.mostrarToastML('¡Compra finalizada con éxito!');

        // Limpiamos la vista y ponemos el contador del header en 0
        this.carrito = null;
        this.pedidoService.cantidadCarrito.set(0);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al finalizar la compra en el servidor:', err);
        this.mostrarToastML('Hubo un error al procesar tu compra.');
      }
    });
  }

  private mostrarToastML(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeAlerta = null;
      this.cdr.detectChanges();
    }, 3500);
  }
}
