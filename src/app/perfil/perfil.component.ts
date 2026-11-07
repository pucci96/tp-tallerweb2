import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent {
  mostrarAlertaExito: boolean = true;
  mostrarPassword: boolean = false;

  // Datos del formulario de usuario
  usuario = {
    nombre: 'Lucas',
    apellido: 'González',
    email: 'lucas.gonzalez@dominio.com',
    direccion: 'Av. Corrientes 2450, Piso 4 B, CABA, Argentina',
    password: 'password12345',
    notificacionesWhatsapp: true,
    telefono: '+54 9 11 5824-9102',
    puntosHardware: 2450,
    nivelHardware: 2
  };

  cerrarAlerta(): void {
    this.mostrarAlertaExito = false;
  }

  toggleMostrarPassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  guardarCambios(): void {
    this.mostrarAlertaExito = true;
    console.log('Datos guardados:', this.usuario);
  }
}