import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService, UsuarioSesion } from '../services/auth.service';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  mostrarAlertaExito: boolean = false;
  mostrarPassword: boolean = false;

  // Datos del formulario de usuario. Nombre, apellido, email y dirección vienen del backend;
  // el resto son datos de ejemplo de la maqueta (todavía no existen en la base).
  usuario = {
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    password: '',
    notificacionesWhatsapp: true,
    telefono: '+54 9 11 5824-9102',
    puntosHardware: 2450,
    nivelHardware: 2
  };

  ngOnInit(): void {
    // Primero lo que ya está en la sesión (respuesta inmediata) y luego los datos actualizados del backend.
    const sesion = this.authService.usuarioActual();
    if (sesion) this.cargarDatos(sesion);

    this.http.get<UsuarioSesion>(`${environment.apiUrl}/usuarios/me`).subscribe({
      next: (datos) => this.cargarDatos(datos),
      error: (err) => console.error('Error al cargar el perfil:', err),
    });
  }

  private cargarDatos(datos: UsuarioSesion): void {
    this.usuario.nombre = datos.nombre;
    this.usuario.apellido = datos.apellido;
    this.usuario.email = datos.email;
    this.usuario.direccion = datos.direccion;
  }

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardarCambios(): void {
    // TODO: falta el endpoint en el backend para actualizar los datos del usuario.
    this.mostrarAlertaExito = true;
  }
}
