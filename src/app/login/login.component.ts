import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PedidoService } from '../services/pedido.service';

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
    private router: Router,
    private route: ActivatedRoute,
    private pedidoService: PedidoService
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
        // AuthService ya guardó la sesión y mergeó el carrito del invitado (tap + switchMap).
        this.authService.guardarSesion(respuesta);

        // Refresca el contador del header con el carrito recién subido al backend.
        this.pedidoService.cargarContadorCarrito();

        this.isSubmitting.set(false);
        this.isSuccess.set(true);

        // Volvemos a donde estaba el invitado (p. ej. /carrito) si vino un returnUrl.
        // Se exige que empiece con "/" y no con "//" para no salir del sitio.
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const destino =
          returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
            ? returnUrl
            : '/';
        setTimeout(() => this.router.navigateByUrl(destino), 800);
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.isError.set(true);
        this.mensajeError.set(error?.error?.error || 'Credenciales inválidas');
      },
    });
  }
}
