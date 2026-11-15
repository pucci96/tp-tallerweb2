import { Component, Input, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service'; //

export interface Product {
  id: number;
  categoryId: number;
  category: string;
  imageUrl: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  destacado: boolean;
}

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './productCard.component.html',
  styleUrls: ['./productCard.component.css']
})
export class ProductCardComponent {
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef); // <-- 1. Inyectamos el detector de cambios

  private _product = signal<Product | null>(null);
  stockActual = signal<number>(0);

  @Input({ required: true }) set product(val: Product) {
    this._product.set(val);
    this.stockActual.set(val.stock);
  }

  get product(): Product {
    return this._product()!;
  }

  hayStock = computed(() => this.stockActual() > 0);

  // Estados para la notificación flotante (Toast)
  mensajeAlerta: string | null = null;
  tipoAlerta: 'success' | 'danger' | null = null;

  private mostrarToast(mensaje: string, tipo: 'success' | 'danger') {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    
    // <-- 2. Forzamos a Angular a repintar la vista al instante para que el popup aparezca de inmediato
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensajeAlerta = null;
      this.tipoAlerta = null;
      this.cdr.detectChanges(); // <-- Forzamos también al ocultar
    }, 3000);
  }

  agregarAlCarrito() {
    if (this.stockActual() <= 0) return;

    this.pedidoService.obtenerMisPedidos().subscribe({
      next: (pedidos) => {
        let carritoActivo = pedidos.find(p => p.estado === 'carrito');

        if (carritoActivo) {
          this.enviarProductoAlPedido(carritoActivo.id);
        } else {
          this.pedidoService.crearPedido({ estado: 'carrito' }).subscribe({
            next: (nuevoPedido) => {
              this.enviarProductoAlPedido(nuevoPedido.id);
            },
            error: () => this.mostrarToast('Error al crear el carrito', 'danger')
          });
        }
      },
      error: () => {
        this.pedidoService.crearPedido({ estado: 'carrito' }).subscribe({
          next: (nuevoPedido) => {
            this.enviarProductoAlPedido(nuevoPedido.id);
          },
          error: () => this.mostrarToast('No se pudo inicializar el pedido', 'danger')
        });
      }
    });
  }

  private enviarProductoAlPedido(idPedido: number) {
    this.pedidoService.agregarProducto(idPedido, { id_producto: this.product.id, cantidad: 1 }).subscribe({
      next: () => {
        this.stockActual.update(stock => stock - 1);
        this.mostrarToast('¡Producto agregado al carrito con éxito!', 'success'); // <-- Acá salta de una
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || 'No hay suficiente stock disponible.';
        this.mostrarToast(errorMsg, 'danger');
      }
    });
  }
}