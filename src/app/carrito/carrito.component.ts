import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PedidoService, PedidoDTO } from '../services/pedido.service';
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

  carrito: PedidoDTO | null = null;
  cargando: boolean = true;
  
  // Mensaje estilo Mercado Libre (Fondo oscuro)
  mensajeAlerta: string | null = null;

  ngOnInit(): void {
    this.cargarCarritoConImagenes();
  }

  cargarCarritoConImagenes(): void {
    this.cargando = true;

    // 1. Obtenemos el catálogo general de productos para rescatar sus imágenes reales
    this.http.get<any[]>(`${environment.apiUrl}/productos`).subscribe({
      next: (productosCatalogo) => {
        // 2. Obtenemos los pedidos del usuario
        this.pedidoService.obtenerMisPedidos().subscribe({
          next: (pedidos) => {
            this.carrito = pedidos.find(p => p.estado === 'carrito') || null;

            // Cruzamos los ítems del carrito con el catálogo para inyectarles la 'imageUrl'
            if (this.carrito && this.carrito.productos) {
              this.carrito.productos = this.carrito.productos.map(itemPedido => {
                const prodEnCatalogo = productosCatalogo.find(
                  p => p.title === itemPedido.producto || p.nombre === itemPedido.producto
                );
                return {
                  ...itemPedido,
                  imageUrl: prodEnCatalogo ? (prodEnCatalogo.imageUrl || prodEnCatalogo.imagen) : 'assets/placeholder.png'
                };
              });
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
    const nuevaCantidad = item.cantidad + delta;
    if (nuevaCantidad < 1) return;

    item.cantidad = nuevaCantidad;
    item.subtotal = item.precio * nuevaCantidad;
    this.recalcularTotal();
    
    // Actualizamos el número del header al instante
    this.actualizarContadorGlobal();
    this.cdr.detectChanges();
  }

  eliminarProducto(idItemPedido: number): void {
    if (this.carrito && this.carrito.productos) {
      this.carrito.productos = this.carrito.productos.filter(p => p.id !== idItemPedido);
      this.recalcularTotal();
      
      // Actualizamos el contador del header para que baje de inmediato
      this.actualizarContadorGlobal();
      
      // Lanzamos el popup estilo Mercado Libre
      this.mostrarToastML('¡Listo! Eliminaste el producto.');
      this.cdr.detectChanges();
    }
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
    if (!this.carrito) return;

    this.mostrarToastML('¡Compra finalizada con éxito!');
    setTimeout(() => {
      this.carrito = null;
      this.pedidoService.cantidadCarrito.set(0);
      this.cdr.detectChanges();
    }, 2000);
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