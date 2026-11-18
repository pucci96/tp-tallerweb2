import { Component, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable ,BehaviorSubject, combineLatest, map} from 'rxjs';
import { ProductService, ProductoAdmin } from '../services/product.service';
import { FormsModule } from '@angular/forms';

export interface FiltrosAdmin {
  busqueda: string;
  categoria: string;
  precioMin: number | null;
  precioMax: number | null;
  stockMin: number | null;
  stockMax: number | null;
  orden: 'ninguno' | 'precio-asc' | 'precio-desc' | 'stock-asc' | 'stock-desc';
}

@Component({
  selector: 'app-admin-productos-list',
  standalone: true,
  imports: [CommonModule, RouterLink, AsyncPipe, FormsModule],
  templateUrl: './admin-productos-list.component.html',
  styleUrls: ['./admin-productos-list.component.css']
})
export class AdminProductosListComponent {
  private productoService = inject(ProductService);

  productos$: Observable<ProductoAdmin[]> = this.productoService.listarAdmin();
  mensajeError = '';

  filtros: FiltrosAdmin = {
    busqueda: '',
    categoria: '',
    precioMin: null,
    precioMax: null,
    stockMin: null,
    stockMax: null,
    orden: 'ninguno'
  };

  private filtrosSubject = new BehaviorSubject<FiltrosAdmin>({ ...this.filtros });
  filtros$ = this.filtrosSubject.asObservable();
  
readonly itemsPorPagina = 10;
  private paginaActualSubject = new BehaviorSubject<number>(1);
  paginaActual$ = this.paginaActualSubject.asObservable();

  // calcula el total de paginas
  vm$ = this.crearStreamPaginado();

  private crearStreamPaginado() {
    return combineLatest([this.productos$,this.filtros$, this.paginaActual$]).pipe(
      map(([lista,f, pagina]) => {
        const categoriasDisponibles = Array.from(
          new Set(lista.map(p => p.categoriaNombre).filter(Boolean)) ).sort();

        const filtrados = lista.filter(prod => {
          // Nombre o palabra clave (incluye subcategoría o ID)
          const termino = f.busqueda.trim().toLowerCase();
          const coincideTexto = !termino ||
            prod.nombre.toLowerCase().includes(termino) ||
            (prod.subcategoriaNombre && prod.subcategoriaNombre.toLowerCase().includes(termino)) ||
            String(prod.id).includes(termino);

          // Categoría
          const coincideCategoria = !f.categoria || prod.categoriaNombre === f.categoria;

          // Rango de Precio
          const coincidePrecioMin = f.precioMin === null || f.precioMin === undefined || prod.precio >= f.precioMin;
          const coincidePrecioMax = f.precioMax === null || f.precioMax === undefined || prod.precio <= f.precioMax;

          // Rango de Stock
          const coincideStockMin = f.stockMin === null || f.stockMin === undefined || prod.stock >= f.stockMin;
          const coincideStockMax = f.stockMax === null || f.stockMax === undefined || prod.stock <= f.stockMax;

          return coincideTexto && coincideCategoria && coincidePrecioMin && coincidePrecioMax && coincideStockMin && coincideStockMax;
        });

        // 2. Ordenamiento (Precio o Stock)
        const ordenados = [...filtrados].sort((a, b) => {
          switch (f.orden) {
            case 'precio-asc':  return a.precio - b.precio;
            case 'precio-desc': return b.precio - a.precio;
            case 'stock-asc':   return a.stock - b.stock;
            case 'stock-desc':  return b.stock - a.stock;
            default:            return 0;
          }
        });
        const totalItems = ordenados.length;
        const totalPaginas = Math.max(1, Math.ceil(totalItems / this.itemsPorPagina));
        const paginaSegura = Math.min(pagina, totalPaginas);
        const inicio = (paginaSegura - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;

        return {
  items: ordenados.slice(inicio, fin),
  categoriasDisponibles,
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
aplicarFiltros(): void {
    this.paginaActualSubject.next(1); // Volver a página 1 al filtrar
    this.filtrosSubject.next({ ...this.filtros });
  }

  limpiarFiltros(): void {
    this.filtros = {
      busqueda: '',
      categoria: '',
      precioMin: null,
      precioMax: null,
      stockMin: null,
      stockMax: null,
      orden: 'ninguno'
    };
    this.aplicarFiltros();
  }
  
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
