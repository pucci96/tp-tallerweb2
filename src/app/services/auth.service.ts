import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap, map, of, catchError, forkJoin, finalize, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { CarritoGuestService } from './carrito-guest.service';

import { ActualizarPerfilDatos, UsuarioSesion } from '../interfaces/auth';


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

interface PedidoMerge {
  id: number;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiUrl + '/usuarios';

  readonly usuarioActual = signal<UsuarioSesion | null>(this.leerSesion());

  private http = inject(HttpClient);
  private carritoGuest = inject(CarritoGuestService);

  /**
   * Se emite al cerrar la sesión. Lo escucha PedidoService para poner el contador
   * del header en 0, así no hay que inyectar PedidoService acá y se evita la
   * dependencia circular AuthService → PedidoService → AuthService.
   * Cubre los 3 puntos que cierran sesión: header, perfil e interceptor (401).
   */
  readonly sesionCerrada$ = new Subject<void>();

  private mergeEnCurso = false;

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((respuesta) => this.guardarSesion(respuesta)),
      switchMap((respuesta) => this.mergeCarritoGuest().pipe(map(() => respuesta)))
    );
  }

  mergeCarritoGuest(): Observable<unknown> {
    const items = this.carritoGuest.items();
    if (!items.length) {
      return of(null);
    }
    if (this.mergeEnCurso) {
      return of(null);
    }

    this.mergeEnCurso = true;
    const url = `${environment.apiUrl}/pedidos`;

    return this.http.get<PedidoMerge[]>(url).pipe(
      switchMap((pedidos) => {
        const existente = pedidos.find((p) => p.estado === 'carrito');
        return existente ? of(existente) : this.http.post<PedidoMerge>(url, { estado: 'carrito' });
      }),
      switchMap((carrito) =>
        forkJoin(
          items.map((item) =>
            this.http
              .post(`${url}/${carrito.id}/productos`, {
                id_producto: item.id_producto,
                cantidad: item.cantidad,
              })
              .pipe(
                map(() => item.id_producto),
                catchError(() => of(null))
              )
          )
        )
      ),
      tap((resultados) => {
        const subidos = resultados.filter((id): id is number => id !== null);
        this.carritoGuest.quitarRango(subidos);

        const fallidos = resultados.length - subidos.length;
        if (fallidos > 0) {
          console.warn(
            `${fallidos} producto(s) del carrito no se pudieron agregar (quizás sin stock).`
          );
        }
      }),
      catchError((error) => {
        console.error('No se pudo mergear el carrito del invitado:', error);
        return of(null);
      }),
      finalize(() => {
        this.mergeEnCurso = false;
      })
    );
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

  obtenerMisDatos(): Observable<UsuarioSesion> {
    return this.http.get<UsuarioSesion>(`${this.apiUrl}/me`);
  }

  actualizarMisDatos(datos: ActualizarPerfilDatos): Observable<UsuarioSesion> {
    return this.http
      .put<UsuarioSesion>(`${this.apiUrl}/me`, datos)
      .pipe(tap((usuario) => this.actualizarUsuarioSesion(usuario)));
  }

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
    this.carritoGuest.vaciar();
    this.sesionCerrada$.next();
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
      return null;
    }
  }
}
