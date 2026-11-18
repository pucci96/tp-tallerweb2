import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable ,BehaviorSubject, combineLatest, map} from 'rxjs';
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

  
readonly itemsPorPagina = 10;
  private paginaActualSubject = new BehaviorSubject<number>(1);
  paginaActual$ = this.paginaActualSubject.asObservable();

  // calcula el total de páginas
  vm$ = this.crearStreamPaginado();

  private crearStreamPaginado() {
    return combineLatest([this.productos$, this.paginaActual$]).pipe(
      map(([lista, pagina]) => {
        const totalItems = lista.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this.itemsPorPagina));
        const paginaSegura = Math.min(pagina, totalPaginas);
        const inicio = (paginaSegura - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;

        return {
          items: lista.slice(inicio, fin),
          paginaActual: paginaSegura,
          totalPaginas,
          totalItems,
          desde: totalItems === 0 ? 0 : inicio + 1,
          hasta: Math.min(fin, totalItems),
          paginas: Array.from({ length: totalPaginas }, (_, i) => i + 1)
        };
      })
    );
  }

  // 3. NUEVO: Método para los botones del paginador
  cambiarPagina(nuevaPagina: number, totalPaginas: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      this.paginaActualSubject.next(nuevaPagina);
    }
  }

  cargarProductos(): void {
    this.productos$ = this.productoService.listarAdmin();
    this.vm$ = this.crearStreamPaginado(); // Re-vincula el paginado con la lista nueva
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
