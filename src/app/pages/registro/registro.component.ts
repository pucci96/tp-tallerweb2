import { Component, signal, inject, computed } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { form, FormField, required, email, minLength } from '@angular/forms/signals';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormField, RouterModule],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css'],
})

export class RegistroComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  readonly model = signal({
    nombre: '',
    apellido: '',
    email: '',
    direccion: '',
    password: '',
    terminos: false,
  });

  // Signal Form: el schema define las validaciones por campo.
  readonly f = form(this.model, (p) => {
    required(p.nombre);
    required(p.apellido);
    required(p.email);
    email(p.email);
    required(p.direccion);
    required(p.password);
    minLength(p.password, 8);
    required(p.terminos);
  });

  // signals de UI
  readonly isSubmitting = signal(false);
  readonly isSuccess = signal(false);
  readonly isError = signal(false);
  readonly showPassword = signal(false);
  readonly mensajeError = signal('');

  readonly password = computed(() => this.model().password);
  readonly passwordScore = computed(() => {
    const pw = this.password();
    let score = 0;
    if (pw.length >= 8) score += 40;
    if (/[0-9]/.test(pw)) score += 20;
    if (/[a-zA-Z]/.test(pw)) score += 20;
    if (/[^a-zA-Z0-9]/.test(pw)) score += 20;
    return score;
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  hasMinLength(): boolean {
    return this.password().length >= 8;
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.password());
  }

  hasLetter(): boolean {
    return /[a-zA-Z]/.test(this.password());
  }

  hasSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.password());
  }

  passwordLabel(): string {
    const s = this.passwordScore();
    if (s < 40) return 'Débil';
    if (s < 80) return 'Media';
    return 'Fuerte';
  }

  handleRegisterSubmit(): void {
    if (this.isSubmitting()) return;

    if (this.f().invalid()) {
      this.f().markAsTouched();
      this.isError.set(true);
      return;
    }

    this.isSubmitting.set(true);
    this.isSuccess.set(false);
    this.isError.set(false);
    this.mensajeError.set('');

    const datos = this.model();
    this.authService.registrar({
      nombre: datos.nombre.trim(),
      apellido: datos.apellido.trim(),
      email: datos.email.trim().toLowerCase(),
      direccion: datos.direccion.trim(),
      password: datos.password,
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        setTimeout(() => {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
          this.router.navigate(
            ['/login'],
            returnUrl ? { queryParams: { returnUrl } } : undefined
          );
        }, 1500);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.isError.set(true);
        this.mensajeError.set(error?.error?.error || 'No se pudo crear la cuenta');
      },
    });
  }
}
