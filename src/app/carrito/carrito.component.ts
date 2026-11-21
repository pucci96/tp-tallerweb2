import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PedidoService, PedidoConImagenes, PedidoProductoConImagen } from '../services/pedido.service';
import { AuthService } from '../services/auth.service';
import { environment } from '../../environments/environment';
import { ProductService } from '../services/product.service';
import { Product } from '../productCard/productCard.component';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private productService = inject(ProductService);
  private cdr = inject(ChangeDetectorRef);
  protected readonly auth = inject(AuthService);
  private router = inject(Router);

  carrito: PedidoConImagenes | null = null;
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
  private armarCarritoLocal(): PedidoConImagenes | null {
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
    };
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
   this.productService.obtenerProductos().subscribe({
      next: (productosCatalogo: Product[]) => {
        // 2. Obtenemos los pedidos del usuario desde PedidoService
        this.pedidoService.obtenerMisPedidos().subscribe({
          next: (pedidos) => {
            const carritoCrudo = pedidos.find(p => p.estado === 'carrito') || null;

            if (carritoCrudo && carritoCrudo.productos) {
              const productosMapeados = carritoCrudo.productos.map(itemPedido => {
                const prodEnCatalogo = productosCatalogo.find(
                  p => p.title === itemPedido.producto
                );
                return {
                  ...itemPedido,
                  imageUrl: prodEnCatalogo ? (prodEnCatalogo.imageUrl) : 'assets/placeholder.png'
                };
              });

              const productosAgrupadosMap = new Map<number | string, PedidoProductoConImagen>();

              for (const item of productosMapeados) {
                const claveUnica = item.id_producto ?? item.producto;

                const existente = productosAgrupadosMap.get(claveUnica);

                if (existente) {
                  existente.cantidad += item.cantidad;
                  existente.subtotal = existente.precio * existente.cantidad;
                  if (item.id > existente.id) {
                    existente.id = item.id;
                  }
                } else {
                  productosAgrupadosMap.set(claveUnica, { ...item });
                }
              }

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

  cambiarCantidad(item: PedidoProductoConImagen, delta: number): void {
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

    this.actualizarContadorGlobal();
    this.cdr.detectChanges();
  }

  eliminarProducto(idProductoOItem: number): void {
    if (this.pedidoService.esGuest()) {
      this.pedidoService.quitarGuest(idProductoOItem);
      this.mostrarToastML('¡Listo! Eliminaste el producto del carrito.');
      this.refrescarLocal();
      return;
    }

    if (!this.carrito || !this.carrito.productos) return;

    const itemEncontrado = this.carrito.productos.find(
      p => p.id === idProductoOItem || p.id_producto === idProductoOItem
    );
    const idProductoReal = itemEncontrado ? (itemEncontrado.id_producto ?? itemEncontrado.id) : idProductoOItem;

    // Delegamos ambos DELETE (principal + fallback) a PedidoService
    this.pedidoService.eliminarProductoCompleto(this.carrito.id, idProductoReal, idProductoOItem).subscribe({
      next: () => {
        this.cargarCarritoConImagenes();
        this.mostrarToastML('¡Listo! Eliminaste el producto del carrito.');
      },
      error: (err) => console.error('Error al eliminar el producto:', err)
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

  private mostrarToastML(mensaje: string) {
    this.mensajeAlerta = mensaje;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.mensajeAlerta = null;
      this.cdr.detectChanges();
    }, 3500);
  }
}
