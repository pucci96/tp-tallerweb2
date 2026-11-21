import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../productCard/productCard.component';
import { PedidoService } from '../services/pedido.service'; 
import { CategoriaService, Categoria } from '../services/categoria.service';
import { ProductService, Product } from '../services/product.service';


@Component({
  selector: 'app-catalogo-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  templateUrl: './catalogo-producto.component.html',
  styleUrls: ['./catalogo-producto.component.css']
})
export class CatalogoProductoComponent implements OnInit {
  private pedidoService = inject(PedidoService); 
  private productService = inject(ProductService);
  private categoriaService= inject(CategoriaService); 
  readonly productos = signal<Product[]>([]);
  readonly categorias = signal<Categoria[]>([]);

 
  readonly PASO_PRECIO = 10000;
  readonly precioTope = computed(() => {
    const precios = this.productos().map((p) => Number(p.price ?? p.price ?? 0));
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
    
    // contador del carrito apenas entra al catálogo
    this.pedidoService.inicializarContador();
  }

cargarDatos(): void {
  this.productService.obtenerProductos().subscribe({
    next: (data)=>{
      this.productos.set(data);
      this.precioMax = this.precioTope();
    },
    error: (err) => console.error('error en producits', err)
  });

  this.categoriaService.obtenerCategorias().subscribe({
    next: (data) => this.categorias.set(data),
    error: (err) => console.error('Error en categorias', err)
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

  get productosFiltrados(): Product[] {
  const productos = this.productos();
  if (productos.length === 0) {
    return [];
  }

  return productos
    .filter(p => {
     
      const titulo = (p.title || p.nombre || '').toLowerCase();
      const coincideBusqueda = this.searchQuery 
        ? titulo.includes(this.searchQuery.toLowerCase()) 
        : true;

      
      const catId = p.categoryId ?? p.categoryId;
      const coincideCategoria = this.categoriaSeleccionadaId !== null 
        ? catId === this.categoriaSeleccionadaId 
        : true;

     
      const precio = Number(p.price ?? p.price ?? 0);
      const coincidePrecio = precio <= this.precioMax;

      return coincideBusqueda && coincideCategoria && coincidePrecio;
    })
    .sort((a, b) => {
      const precioA = Number(a.price ?? a.price ?? 0);
      const precioB = Number(b.price ?? b.price ?? 0);
      if (this.ordenSeleccionado === 'asc') return precioA - precioB;
      if (this.ordenSeleccionado === 'desc') return precioB - precioA;
      return 0;
    });
}
}