import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UsuarioSesion {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  direccion: string;
  rol: string;
}

interface LoginResponse {
  token: string;
  usuario: UsuarioSesion;
}

interface RegistroDatos {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/usuarios';

  readonly usuarioActual = signal<UsuarioSesion | null>(this.leerSesion());

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password });
  }

  registrar(datos: RegistroDatos): Observable<UsuarioSesion> {

    const body = {
      usuario: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        direccion: datos.direccion,
      },
      login: {
        email: datos.email,
        password: datos.password,
      },
    };
    return this.http.post<UsuarioSesion>(`${this.apiUrl}/registrar`, body);
  }

  guardarSesion(respuesta: LoginResponse): void {
    localStorage.setItem('token', respuesta.token);
    localStorage.setItem('usuario', JSON.stringify(respuesta.usuario));
    localStorage.setItem('user_role', respuesta.usuario.rol);
    this.usuarioActual.set(respuesta.usuario);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('user_role');
    this.usuarioActual.set(null);
  }

  estaLogueado(): boolean {
    return this.usuarioActual() !== null && localStorage.getItem('token') !== null;
  }

  esAdmin(): boolean {
    return this.estaLogueado() && this.usuarioActual()?.rol === 'ADMIN';
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  private leerSesion(): UsuarioSesion | null {
    try {
      const guardado = localStorage.getItem('usuario');
      return guardado ? JSON.parse(guardado) : null;
    } catch {
      // Sesión corrupta en localStorage: se ignora en lugar de romper la app.
      return null;
    }
  }
}
