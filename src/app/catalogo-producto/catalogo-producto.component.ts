import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../productCard/productCard.component';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-catalogo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  templateUrl: './catalogo-producto.component.html',
  styleUrls: ['./catalogo-producto.component.css']
})
export class CatalogoProductoComponent implements OnInit {
  private http = inject(HttpClient);

  // Señales: en Angular 22 los componentes son OnPush por defecto, así que la vista
  // solo se actualiza sola al llegar la respuesta HTTP si el dato es una señal.
  readonly productos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);

  /**
   * Tope del filtro de precio: el precio del producto más caro, redondeado hacia
   * arriba al múltiplo de PASO_PRECIO. Así el rango siempre abarca todo el catálogo.
   */
  readonly PASO_PRECIO = 10000;
  readonly precioTope = computed(() => {
    const precios = this.productos().map((p) => Number(p.price ?? p.precio ?? 0));
    const masCaro = Math.max(0, ...precios);
    return Math.max(this.PASO_PRECIO, Math.ceil(masCaro / this.PASO_PRECIO) * this.PASO_PRECIO);
  });

  // Filtros reactivos
  searchQuery: string = '';
  categoriaSeleccionadaId: number | null = null;
  ordenSeleccionado: string = 'asc';
  precioMax: number = 0; // se ajusta al tope cuando llegan los productos
  soloStock: boolean = true;
  envioGratis: boolean = false;

  ngOnInit(): void {
  console.log('--- CatalogoComponent inicializado ---');
  this.cargarDatos();
}

cargarDatos(): void {
  this.http.get<any[]>(`${environment.apiUrl}/productos`).subscribe({
    next: (data) => {
      this.productos.set(data);
      this.precioMax = this.precioTope(); // al entrar no se oculta ningún producto por precio
    },
    error: (err) => console.error('Error en productos:', err)
  });

  this.http.get<any[]>(`${environment.apiUrl}/categorias`).subscribe({
    next: (data) => this.categorias.set(data),
    error: (err) => console.error('Error en categorías:', err)
  });
}

  seleccionarCategoria(id: number | null): void {
    this.categoriaSeleccionadaId = id;
  }

  limpiarFiltros(): void {
    this.searchQuery = '';
    this.categoriaSeleccionadaId = null;
    this.ordenSeleccionado = 'asc';
    this.precioMax = this.precioTope();
  }

  get productosFiltrados(): any[] {
  const productos = this.productos();
  if (productos.length === 0) {
    return [];
  }

  return productos
    .filter(p => {
      // 1. Filtro por nombre
      const titulo = (p.title || p.nombre || '').toLowerCase();
      const coincideBusqueda = this.searchQuery 
        ? titulo.includes(this.searchQuery.toLowerCase()) 
        : true;

      // 2. Filtro por categoría (solo filtra si hay una seleccionada)
      const catId = p.categoryId ?? p.categoriaId;
      const coincideCategoria = this.categoriaSeleccionadaId !== null 
        ? catId === this.categoriaSeleccionadaId 
        : true;

      // 3. Filtro por precio (tolerante si no viene definido)
      const precio = Number(p.price ?? p.precio ?? 0);
      const coincidePrecio = precio <= this.precioMax;

      return coincideBusqueda && coincideCategoria && coincidePrecio;
    })
    .sort((a, b) => {
      const precioA = Number(a.price ?? a.precio ?? 0);
      const precioB = Number(b.price ?? b.precio ?? 0);
      if (this.ordenSeleccionado === 'asc') return precioA - precioB;
      if (this.ordenSeleccionado === 'desc') return precioB - precioA;
      return 0;
    });
}
}