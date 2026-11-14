import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CheckoutService, DatosEnvio } from '../services/checkout.service';

@Component({
  selector: 'app-checkout-confirmacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-confirmacion.component.html',
  styleUrls: ['./checkout-confirmacion.component.css'],
})
export class CheckoutConfirmacionComponent {
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly items = this.cart.items;
  readonly total = this.cart.total;
  readonly cantidadTotal = this.cart.cantidadTotal;

  readonly form = inject(FormBuilder).nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required],
    codigoPostal: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{4,8}$/)]],
  });

  constructor() {
    const previo = this.checkout.datosEnvio();
    const usuario = this.auth.usuarioActual();
    if (previo) {
      this.form.setValue(previo);
    } else if (usuario) {
      this.form.patchValue({
        nombre: usuario.nombre ?? '',
        apellido: usuario.apellido ?? '',
        email: usuario.email ?? '',
        direccion: usuario.direccion ?? '',
      });
    }
  }

  cambiarCantidad(id: number, cantidad: number): void {
    this.cart.cambiarCantidad(id, cantidad);
  }

  quitar(id: number): void {
    this.cart.quitar(id);
  }

  campoInvalido(campo: keyof DatosEnvio): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  continuar(): void {
    if (this.form.invalid || this.items().length === 0) {
      this.form.markAllAsTouched();
      return;
    }
    const valores = this.form.getRawValue();
    const datos = Object.fromEntries(
      Object.entries(valores).map(([clave, valor]) => [clave, valor.trim()]),
    ) as unknown as DatosEnvio;
    this.checkout.guardarEnvio(datos);
    this.router.navigate(['/checkout/pago']);
  }
}
