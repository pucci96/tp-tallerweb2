import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../productCard/productCard.component';
import { environment } from '../../environments/environment';

/** Producto con todos los campos, como lo devuelve /productos/admin/... */
export interface ProductoAdmin {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string | null;
  destacado: boolean;
  id_categoria: number;
  categoriaNombre: string;
  id_subcategoria: number;
  subcategoriaNombre: string;
  descripcion: string;
}

/** Par nombre/descripción (especificaciones y estilos del producto). */
export interface ProductoAtributo {
  nombre: string;
  descripcion: string;
}

/** Producto completo para la página de detalle, como lo devuelve /productos/:id */
export interface ProductoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  categoria: { id: number; nombre: string };
  subcategoria: { id: number; nombre: string };
  especificaciones: ProductoAtributo[];
  estilos: ProductoAtributo[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  /** Catálogo público completo. */
  obtenerProductos(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /** Productos marcados como destacados (home). */
  getProductosDestacados(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/destacados`);
  }

  /** Detalle público de un producto (página /productos/:id). */
  obtenerDetalle(id: number): Observable<ProductoDetalle> {
    return this.http.get<ProductoDetalle>(`${this.apiUrl}/${id}`);
  }

  /** Listado completo para el panel de admin (requiere rol ADMIN). */
  listarAdmin(): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.apiUrl}/admin/listado`);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/admin/${id}`);
  }
}
