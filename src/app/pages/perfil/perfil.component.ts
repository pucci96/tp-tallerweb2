import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { ActualizarPerfilDatos, UsuarioSesion } from '../../interfaces/auth';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Todo el estado es con señales: en Angular 22 los componentes son OnPush por defecto
  // y la vista solo se actualiza sola (por ejemplo al llegar una respuesta HTTP) si cambia una señal.

  /** Datos guardados del usuario (los que muestra la tarjeta de la izquierda). */
  readonly datos = signal<UsuarioSesion | null>(null);

  /** Iniciales del avatar (nombre + apellido guardados), por ejemplo "Juan Pérez" → "JP". */
  readonly iniciales = computed(() => {
    const datos = this.datos();
    const inicial = (texto?: string) => texto?.trim().charAt(0).toUpperCase() ?? '';
    return inicial(datos?.nombre) + inicial(datos?.apellido);
  });

  /** Campos del formulario. El email no es editable: se muestra desde `datos`. */
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly direccion = signal('');
  readonly passwordActual = signal('');
  readonly passwordNueva = signal('');

  /** Sección visible del panel derecho, elegida desde el menú lateral. */
  readonly seccion = signal<'datos' | 'seguridad'>('datos');

  /** El formulario de datos arranca inhabilitado; se habilita con "Modificar mis datos". */
  readonly modoEdicion = signal(false);
  readonly guardando = signal(false);
  /** Texto del cartel verde de éxito (vacío = no se muestra). */
  readonly mensajeExito = signal('');
  readonly mensajeError = signal('');
  readonly mostrarPassword = signal(false);

  ngOnInit(): void {
    // Primero lo que ya está en la sesión (respuesta inmediata) y luego los datos actualizados del backend.
    const sesion = this.authService.usuarioActual();
    if (sesion) this.cargarDatos(sesion);

    this.authService.obtenerMisDatos().subscribe({
      next: (datos) => this.cargarDatos(datos),
      error: (err) => console.error('Error al cargar el perfil:', err),
    });
  }

  /** Guarda los datos y copia sus valores al formulario. */
  private cargarDatos(datos: UsuarioSesion): void {
    this.datos.set(datos);
    this.restaurarFormulario();
  }

  /** Vuelve los campos a los datos guardados y vacía las contraseñas. */
  private restaurarFormulario(): void {
    const datos = this.datos();
    this.nombre.set(datos?.nombre ?? '');
    this.apellido.set(datos?.apellido ?? '');
    this.direccion.set(datos?.direccion ?? '');
    this.passwordActual.set('');
    this.passwordNueva.set('');
    this.mostrarPassword.set(false);
  }

  /** Menú lateral: cambia de sección y descarta lo que no se haya guardado. */
  mostrarSeccion(seccion: 'datos' | 'seguridad'): void {
    if (this.guardando()) return;
    this.restaurarFormulario();
    this.modoEdicion.set(false);
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.seccion.set(seccion);
  }

  /** Botón "Modificar mis datos": habilita el formulario. */
  habilitarEdicion(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    this.modoEdicion.set(true);
  }

  /** Botón "Cancelar": descarta los cambios y vuelve a inhabilitar el formulario. */
  cancelarEdicion(): void {
    this.restaurarFormulario();
    this.mensajeError.set('');
    this.modoEdicion.set(false);
  }

  /** Sección "Mis datos": guarda nombre, apellido y dirección. */
  guardarCambios(): void {
    if (!this.modoEdicion() || this.guardando()) return;

    const nombre = this.nombre().trim();
    const apellido = this.apellido().trim();
    const direccion = this.direccion().trim();

    if (!nombre || !apellido || !direccion) {
      this.mensajeError.set('Nombre, apellido y dirección son obligatorios.');
      return;
    }

    this.enviar({ nombre, apellido, direccion }, () => {
      this.modoEdicion.set(false);
      this.mensajeExito.set('Los cambios en tu información de cuenta y domicilio fueron guardados con éxito.');
    });
  }

  /** Sección "Seguridad": cambia la contraseña verificando la actual. */
  cambiarPassword(): void {
    if (this.guardando()) return;

    const passwordActual = this.passwordActual();
    const passwordNueva = this.passwordNueva();
    if (!passwordActual || !passwordNueva) {
      this.mensajeError.set('Completá la contraseña actual y la nueva.');
      return;
    }

    // El endpoint también pide los datos personales: se mandan los ya guardados, sin cambios.
    const datos = this.datos();
    if (!datos) return;

    this.enviar(
      { nombre: datos.nombre, apellido: datos.apellido, direccion: datos.direccion, passwordActual, passwordNueva },
      () => this.mensajeExito.set('Tu contraseña fue cambiada con éxito.')
    );
  }

  /** Envía los cambios al backend; en caso de éxito recarga los datos y ejecuta `alTerminar`. */
  private enviar(cambios: ActualizarPerfilDatos, alTerminar: () => void): void {
    this.guardando.set(true);
    this.mensajeError.set('');
    this.mensajeExito.set('');

    this.authService.actualizarMisDatos(cambios).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.cargarDatos(usuario); // también vacía las contraseñas
        alTerminar();
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.mensajeError.set(err.error?.error || 'No se pudieron guardar los cambios. Intentá de nuevo.');
      },
    });
  }

  /** Igual que el botón del header: borra la sesión y vuelve al inicio. */
  cerrarSesion(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  cerrarAlerta(): void {
    this.mensajeExito.set('');
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }
}
