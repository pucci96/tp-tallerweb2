import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductCardComponent, Product } from '../productCard/productCard.component';
import { ProductService } from '../services/product.service';

interface Slide {
  badge: string;
  badgeType: 'primary' | 'success';
  title: string;
  description: string;
  buttonText: string;
  link: string;
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

  // Sliders
  slides: Slide[] = [
    {
      badge: 'Lanzamiento Exclusivo',
      badgeType: 'primary',
      title: 'Nueva Serie RTX 40 Super',
      description: 'Potenciá tu setup con arquitectura Ada Lovelace y máximo rendimiento en 1440p y 4K.',
      buttonText: 'Ver Placas de Video',
      link: '/productos',
      imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80'
    },
    {
      badge: 'Envío Gratis',
      badgeType: 'success',
      title: 'Monitores Gamer 180Hz IPS',
      description: 'Panel ultra rápido con fidelidad de color profesional y compatibilidad G-Sync.',
      buttonText: 'Explorar Monitores',
      link: '/productos',
      imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80'
    },
    {
      badge: 'Configurador Online',
      badgeType: 'primary',
      title: 'Armá tu PC a Medida',
      description: 'Elegí tus componentes con compatibilidad garantizada y asesoramiento técnico directo.',
      buttonText: 'Comenzar Armado',
      link: '/productos',
      imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=900&q=80'
    }
  ];
  currentIndex: number = 0;
  private intervalId: any;

  
  productosDestacados: Product[] = [];

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
    this.currentIndex = (this.currentIndex + 1) % this.slides.length;
  }

  prevSlide(): void {
    this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentIndex = index;
    this.startAutoSlide();
  }

 
  obtenerProductosDestacados(): void {
    this.productService.getProductosDestacados().subscribe({
      next: (destacados) => {
        if (destacados.length > 0) {
          this.productosDestacados = destacados;
          return;
        }
        // Si no hay ninguno marcado como destacado, se muestran los primeros 4 del catálogo
        this.productService.obtenerProductos().subscribe({
          next: (todos) => (this.productosDestacados = todos.slice(0, 4)),
          error: (err) => console.error('Error al cargar productos:', err),
        });
      },
      error: (err) => console.error('Error al cargar productos destacados:', err),
    });
  }
}
