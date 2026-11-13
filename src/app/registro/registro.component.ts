import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})

export class RegistroComponent {
  nombre = '';
  apellido = '';
  email = '';
  direccion = '';
  password = '';
  terminos = false;

  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);
  readonly isError = signal(false);
  readonly showPassword = signal(false);
  readonly mensajeError = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  clearError(): void {
    if (this.isError()) {
      this.mensajeError.set('');
      this.isError.set(false);
    }
  }

  // Live validation helpers
  isNombreValid(): boolean {
    return this.nombre.trim().length > 0;
  }

  isApellidoValid(): boolean {
    return this.apellido.trim().length > 0;
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
  }

  isDireccionValid(): boolean {
    return this.direccion.trim().length > 0;
  }

  hasMinLength(): boolean {
    return this.password.length >= 8;
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.password);
  }

  hasLetter(): boolean {
    return /[a-zA-Z]/.test(this.password);
  }

  hasSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.password);
  }

  passwordScore(): number {
    let score = 0;
    if (this.hasMinLength()) score += 40;
    if (this.hasNumber()) score += 20;
    if (this.hasLetter()) score += 20;
    if (this.hasSpecial()) score += 20;
    return score;
  }

  passwordLabel(): string {
    const s = this.passwordScore();
    if (s < 40) return 'Débil';
    if (s < 80) return 'Media';
    return 'Fuerte';
  }

  isFormValid(): boolean {
    return (
      this.isNombreValid() &&
      this.isApellidoValid() &&
      this.isEmailValid() &&
      this.isDireccionValid() &&
      this.hasMinLength() &&
      this.hasLetter() &&
      this.hasNumber() &&
      this.terminos === true
    );
  }

  handleRegisterSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (!this.isFormValid()) {
      this.isError.set(true);
      return;
    }

    this.isSubmitting.set(true);
    this.isSuccess.set(false);
    this.isError.set(false);
    this.mensajeError.set('');

    this.authService.registrar({
      nombre: this.nombre.trim(),
      apellido: this.apellido.trim(),
      email: this.email.trim().toLowerCase(),
      direccion: this.direccion.trim(),
      password: this.password,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.isError.set(true);
        this.mensajeError.set(error?.error?.error || 'No se pudo crear la cuenta');
      },
    });
  }
}
