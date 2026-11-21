import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

import { Categoria, Subcategoria } from '../interfaces/categoria';


@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/categorias`;

  
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }
obtenerSubcategorias(): Observable<Subcategoria[]> {
    return this.http.get<Subcategoria[]>(`${environment.apiUrl}/subcategorias`);
  }

}