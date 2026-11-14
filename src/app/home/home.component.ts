import { Component, OnInit, OnDestroy, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent, Product } from '../productCard/productCard.component';
import { ProductService } from '../services/product.service';

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

  // Señales: en Angular 22 los componentes son OnPush por defecto, así que la vista
  // solo se actualiza sola cuando cambia una señal (no una variable común).
  readonly currentIndex = signal(0);
  private intervalId: ReturnType<typeof setInterval> | undefined;

  readonly productosDestacados = signal<Product[]>([]);

  /** El carrusel muestra los productos destacados; cada slide lleva a su detalle. */
  readonly slides = computed<Slide[]>(() =>
    this.productosDestacados().map((p) => ({
      id: p.id,
      badge: p.category,
      title: p.title,
      description: p.description,
      link: ['/productos', p.id],
      imageUrl: p.imageUrl,
    }))
  );

  ngOnInit(): void {
    this.startAutoSlide();
    this.obtenerProductosDestacados();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  // Slider
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
    if (total === 0) return; // todavía no llegaron los productos
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
