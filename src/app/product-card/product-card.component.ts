import { Component, Input, signal, computed, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PedidoService } from '../services/pedido.service'; 
import { Product } from '../interfaces/producto';




@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  private pedidoService = inject(PedidoService);
  private cdr = inject(ChangeDetectorRef);
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
    
    
    this.cdr.detectChanges();

    setTimeout(() => {
      this.mensajeAlerta = null;
      this.tipoAlerta = null;
      this.cdr.detectChanges(); 
    }, 3000);
  }

  agregarAlCarrito() {
    if (this.stockActual() <= 0) return;

    this.pedidoService.agregarAlCarrito({
      id: this.product.id,
      nombre: this.product.title,
      categoria: this.product.category,
      subcategoria: '',
      precio: this.product.price,
      imageUrl: this.product.imageUrl,
    }, 1).subscribe({
      next: () => {
        this.stockActual.update(stock => stock - 1);
        this.mostrarToast('¡Producto agregado al carrito con éxito!', 'success');
      },
      error: (err) => {
        const errorMsg = err.error?.mensaje || 'No hay suficiente stock disponible.';
        this.mostrarToast(errorMsg, 'danger');
      }
    });
  }
}