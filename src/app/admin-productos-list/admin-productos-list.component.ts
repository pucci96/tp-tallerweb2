import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService, ProductoAdmin } from '../services/product.service';

@Component({
  selector: 'app-admin-productos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe],
  templateUrl: './admin-productos-list.component.html',
  styleUrls: ['./admin-productos-list.component.css']
})
export class AdminProductosListComponent {
  private productoService = inject(ProductService);

  productos$: Observable<ProductoAdmin[]> = this.productoService.listarAdmin();
  mensajeError = '';

  cargarProductos(): void {
    this.productos$ = this.productoService.listarAdmin();
  }

  eliminarProducto(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    this.mensajeError = '';
    this.productoService.eliminar(id).subscribe({
      next: () => this.cargarProductos(),
      error: (err) => {
        this.mensajeError = err.error?.error || 'No se pudo eliminar el producto.';
        console.error('Error al eliminar:', err);
      },
    });
  }
}
