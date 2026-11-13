import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';

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
      this.isError.set(false);
      this.mensajeError.set('');
    }
  }

  handleLoginSubmit(): void {
    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.isSuccess.set(false);
    this.isError.set(false);

    this.authService.login(this.email.trim().toLowerCase(), this.password).subscribe({
      next: (respuesta) => {
        this.authService.guardarSesion(respuesta);
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        setTimeout(() => this.router.navigate(['/']), 800);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.isError.set(true);
        this.mensajeError.set(error?.error?.error || 'Credenciales inválidas');
      },
    });
  }
}
