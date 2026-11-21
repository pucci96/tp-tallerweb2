import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Comentario, ComentariosProducto, GuardarProductoAdminDTO, NuevoComentario, Product, ProductoAdmin, ProductoDetalle } from '../interfaces/producto';


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
