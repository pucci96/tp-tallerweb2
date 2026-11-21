import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/producto';

interface Slide {
  id: number;
  badge: string;
  title: string;
  description: string;
  link: (string | number)[]; // ['/productos', id] → página de detalle
  imageUrl: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private productService = inject(ProductService);

  readonly currentIndex = signal(0);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  readonly productosDestacados = signal<Product[]>([]);
  readonly paginaDestacados = signal(0);
  readonly itemsPorVista = 4;

  // Slides del banner superior generados dinámicamente desde los destacados (máx. 4)
  readonly slides = computed<Slide[]>(() =>
    this.productosDestacados().slice(0, 4).map((prod) => ({
      id: prod.id,
      badge: prod.category || 'Destacado',
      title: prod.title,
      description: prod.description || '',
      link: ['/productos', prod.id],
      imageUrl: prod.imageUrl || ''
    }))
  );

  // Recorta los productos destacados en grupos de a 4 para la grilla inferior
  readonly destacadosVisibles = computed(() => {
    const inicio = this.paginaDestacados() * this.itemsPorVista;
    return this.productosDestacados().slice(inicio, inicio + this.itemsPorVista);
  });

  readonly totalPaginasDestacados = computed(() =>
    Math.ceil(this.productosDestacados().length / this.itemsPorVista)
  );

  siguienteDestacados(): void {
    const total = this.totalPaginasDestacados();
    if (total > 1) {
      this.paginaDestacados.update((p) => (p + 1) % total);
    }
  }

  anteriorDestacados(): void {
    const total = this.totalPaginasDestacados();
    if (total > 1) {
      this.paginaDestacados.update((p) => (p - 1 + total) % total);
    }
  }

  ngOnInit(): void {
    this.startAutoSlide();
    this.obtenerProductosDestacados();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Slider superior
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 4500);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i + 1) % total);
  }

  prevSlide(): void {
    const total = this.slides().length;
    if (total === 0) return;
    this.currentIndex.update((i) => (i - 1 + total) % total);
  }

  goToSlide(index: number): void {
    this.currentIndex.set(index);
    this.startAutoSlide();
  }

  obtenerProductosDestacados(): void {
    this.productService.getProductosDestacados().subscribe({
      next: (destacados) => {
        this.paginaDestacados.set(0);
        if (destacados.length > 0) {
          this.productosDestacados.set(destacados);
          return;
        }
        // Si no hay ninguno marcado como destacado, se muestran los primeros 4 del catálogo
        this.productService.obtenerProductos().subscribe({
          next: (todos) => this.productosDestacados.set(todos.slice(0, 4)),
          error: (err) => console.error('Error al cargar productos:', err),
        });
      },
      error: (err) => console.error('Error al cargar productos destacados:', err),
    });
  }
}