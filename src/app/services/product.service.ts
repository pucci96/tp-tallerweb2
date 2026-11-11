import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../productCard/productCard.component';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api';

obtenerProductos(): Observable<any[]> {
  return this.http.get<any[]>(`${environment.apiUrl}/productos`);
}

eliminar(id: number): Observable<any>{
  return this.http.delete(`${this.apiUrl}/productos/admin/${id}`);
}

  getProductosDestacados(): Observable<Product[]> {
    return this.http.get<any[]>(`${this.apiUrl}/productos`);
  }
}