import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
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

/**
 * Datos editables desde el perfil. El email no se puede cambiar.
 * La contraseña solo cambia si se mandan la actual y la nueva.
 */
export interface ActualizarPerfilDatos {
  nombre: string;
  apellido: string;
  direccion: string;
  passwordActual?: string;
  passwordNueva?: string;
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

  /** Datos del usuario logueado, actualizados desde el backend. */
  obtenerMisDatos(): Observable<UsuarioSesion> {
    return this.http.get<UsuarioSesion>(`${this.apiUrl}/me`);
  }

  /**
   * Guarda los cambios del perfil y actualiza la sesión con la respuesta,
   * así el header (y cualquier vista que use usuarioActual) muestra los datos nuevos.
   */
  actualizarMisDatos(datos: ActualizarPerfilDatos): Observable<UsuarioSesion> {
    return this.http
      .put<UsuarioSesion>(`${this.apiUrl}/me`, datos)
      .pipe(tap((usuario) => this.actualizarUsuarioSesion(usuario)));
  }

  /** Reemplaza los datos del usuario en la sesión, sin tocar el token. */
  private actualizarUsuarioSesion(usuario: UsuarioSesion): void {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('user_role', usuario.rol);
    this.usuarioActual.set(usuario);
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
