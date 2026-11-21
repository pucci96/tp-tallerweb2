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

/** Un comentario de un producto, como lo devuelve /productos/:id/comentarios */
export interface Comentario {
  id: number;
  id_usuario: number;
  autor: string;        // "Juan P."
  calificacion: number; // 1 a 5
  texto: string;
  fecha: string;        // fecha ISO (JSON)
}

/** Comentarios de un producto con el resumen de su calificación. */
export interface ComentariosProducto {
  promedio: number; // 0 si no tiene comentarios
  cantidad: number;
  comentarios: Comentario[];
}

/** Lo que se manda para comentar. El autor lo toma el backend del token. */
export interface NuevoComentario {
  calificacion: number;
  texto: string;
}
export interface GuardarProductoAdminDTO {
  nombre: string;
  precio: number;
  stock: number;
  id_categoria: number;
  id_subcategoria: number;
  imagen: string;
  descripcion: string;
  destacado: boolean;
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

  /** Comentarios del producto con el promedio y la cantidad (público). */
  obtenerComentarios(idProducto: number): Observable<ComentariosProducto> {
    return this.http.get<ComentariosProducto>(`${this.apiUrl}/${idProducto}/comentarios`);
  }

  /** Publica un comentario (requiere sesión: el interceptor agrega el token). */
  comentar(idProducto: number, comentario: NuevoComentario): Observable<Comentario> {
    return this.http.post<Comentario>(`${this.apiUrl}/${idProducto}/comentarios`, comentario);
  }

  /** Listado completo para el panel de admin (requiere rol ADMIN). */
  listarAdmin(): Observable<ProductoAdmin[]> {
    return this.http.get<ProductoAdmin[]>(`${this.apiUrl}/admin/listado`);
  }

  eliminar(id: number): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/admin/${id}`);
  }
  obtenerAdminPorId(id: number): Observable<ProductoAdmin> {
    return this.http.get<ProductoAdmin>(`${this.apiUrl}/admin/${id}`);
  }

  /** Crea un nuevo producto desde el panel admin. */
  crearAdmin(payload: GuardarProductoAdminDTO): Observable<ProductoAdmin> {
    return this.http.post<ProductoAdmin>(`${this.apiUrl}/admin`, payload);
  }

  /** Actualiza un producto existente desde el panel admin. */
  actualizarAdmin(id: number, payload: GuardarProductoAdminDTO): Observable<ProductoAdmin> {
    return this.http.put<ProductoAdmin>(`${this.apiUrl}/admin/${id}`, payload);
  }

}
