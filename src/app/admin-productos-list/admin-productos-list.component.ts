import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { ProductService } from '../services/product.service';

@Component({
  selector: 'app-admin-productos-list',
  standalone: true,
  imports: [CommonModule, RouterLink,AsyncPipe],
  templateUrl: './admin-productos-list.component.html',
  styleUrls: ['./admin-productos-list.component.css']
})
export class AdminProductosListComponent implements OnInit {
  private productoService = inject(ProductService);

  
  productos$: Observable<any[]> =this.productoService.obtenerProductos();

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productos$ = this.productoService.obtenerProductos();
  }

  eliminarProducto(id: number, nombre: string): void {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;

    this.productoService.eliminar(id).subscribe({
      next: () => {
        
        this.cargarProductos();
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }
}