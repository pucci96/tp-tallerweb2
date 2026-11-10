import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../productCard/productCard.component';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/productos/destacados';

  getProductosDestacados(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
}