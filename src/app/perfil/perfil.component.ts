import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService, UsuarioSesion, ActualizarPerfilDatos } from '../services/auth.service';

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

  /** Campos del formulario. El email no es editable: se muestra desde `datos`. */
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly direccion = signal('');
  readonly passwordActual = signal('');
  readonly passwordNueva = signal('');

  /** El formulario arranca inhabilitado; se habilita con "Modificar mis datos". */
  readonly modoEdicion = signal(false);
  readonly guardando = signal(false);
  readonly mostrarAlertaExito = signal(false);
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

  /** Botón "Modificar mis datos": habilita el formulario. */
  habilitarEdicion(): void {
    this.mostrarAlertaExito.set(false);
    this.mensajeError.set('');
    this.modoEdicion.set(true);
  }

  /** Botón "Cancelar": descarta los cambios y vuelve a inhabilitar el formulario. */
  cancelarEdicion(): void {
    this.restaurarFormulario();
    this.mensajeError.set('');
    this.modoEdicion.set(false);
  }

  guardarCambios(): void {
    if (!this.modoEdicion() || this.guardando()) return;

    const nombre = this.nombre().trim();
    const apellido = this.apellido().trim();
    const direccion = this.direccion().trim();
    const passwordActual = this.passwordActual();
    const passwordNueva = this.passwordNueva();

    if (!nombre || !apellido || !direccion) {
      this.mensajeError.set('Nombre, apellido y dirección son obligatorios.');
      return;
    }
    if ((passwordActual && !passwordNueva) || (!passwordActual && passwordNueva)) {
      this.mensajeError.set('Para cambiar la contraseña completá la actual y la nueva.');
      return;
    }

    const cambios: ActualizarPerfilDatos = { nombre, apellido, direccion };
    if (passwordActual && passwordNueva) {
      cambios.passwordActual = passwordActual;
      cambios.passwordNueva = passwordNueva;
    }

    this.guardando.set(true);
    this.mensajeError.set('');

    this.authService.actualizarMisDatos(cambios).subscribe({
      next: (usuario) => {
        this.guardando.set(false);
        this.cargarDatos(usuario);
        this.modoEdicion.set(false);
        this.mostrarAlertaExito.set(true);
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
    this.mostrarAlertaExito.set(false);
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword.update((valor) => !valor);
  }
}
