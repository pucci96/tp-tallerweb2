import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CarritoCheckout, CheckoutService, DatosEnvio } from '../services/checkout.service';
import { PaymentSimulatorService, ResultadoPago } from '../services/payment-simulator.service';
import { noSoloEspacios } from '../validators/no-solo-espacios.validator';
import {
  limpiarNumeroTarjeta,
  numeroTarjetaValidator,
  vencimientoValidator,
} from './validadores-tarjeta';

type CampoTarjeta = 'numero' | 'titular' | 'vencimiento' | 'cvv';

@Component({
  selector: 'app-checkout-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout-pago.component.html',
  styleUrls: ['./checkout-pago.component.css'],
})
export class CheckoutPagoComponent implements OnInit {
  private readonly checkout = inject(CheckoutService);
  private readonly pagos = inject(PaymentSimulatorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly carrito = signal<CarritoCheckout | null>(null);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    numero: ['', [Validators.required, numeroTarjetaValidator]],
    titular: ['', [Validators.required, noSoloEspacios]],
    vencimiento: ['', [Validators.required, vencimientoValidator()]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  ngOnInit(): void {
    // Los datos de envío viven solo en memoria; tras recargar hay que completarlos de nuevo.
    if (!this.checkout.datosEnvio()) {
      this.router.navigate(['/checkout']);
      return;
    }
    this.checkout
      .cargarCarrito()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (carrito) => {
          if (!carrito) {
            this.router.navigate(['/carrito']);
            return;
          }
          this.carrito.set(carrito);
        },
        error: () => this.router.navigate(['/carrito']),
      });
  }

  campoInvalido(campo: CampoTarjeta): boolean {
    const control = this.form.controls[campo];
    return control.invalid && (control.touched || control.dirty);
  }

  pagar(): void {
    if (this.procesando()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const envio = this.checkout.datosEnvio();
    const carrito = this.carrito();
    if (!envio || !carrito) {
      this.router.navigate(['/checkout']);
      return;
    }

    const { numero, titular, vencimiento, cvv } = this.form.getRawValue();
    this.procesando.set(true);
    this.error.set(null);
    this.form.disable();

    this.pagos
      .procesarPago({
        numero: limpiarNumeroTarjeta(numero),
        titular: titular.trim(),
        vencimiento,
        cvv,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => this.manejarResultado(resultado, carrito, envio),
        error: () => this.mostrarRechazo('No pudimos procesar el pago. Intentá nuevamente.'),
      });
  }

  private manejarResultado(resultado: ResultadoPago, carrito: CarritoCheckout, envio: DatosEnvio): void {
    if (!resultado.aprobado) {
      this.mostrarRechazo(resultado.motivo ?? 'El pago fue rechazado.');
      return;
    }
    // Pago aprobado (simulado): se cierra el pedido real en el backend.
    this.checkout
      .finalizarCarrito(carrito.idPedido)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.checkout.registrarPedido({
            numeroPedido: this.checkout.numeroPedido(carrito.idPedido),
            total: carrito.total,
            envio,
          });
          this.checkout.vaciarContadorCarrito();
          this.router.navigate(['/checkout/resultado']);
        },
        error: () =>
          this.mostrarRechazo('El pago fue aprobado pero no pudimos cerrar tu pedido. Intentá nuevamente.'),
      });
  }

  private mostrarRechazo(motivo: string): void {
    this.error.set(motivo);
    this.procesando.set(false);
    this.form.enable();
  }
}
