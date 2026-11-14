import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../services/cart.service';
import { CheckoutService, DatosEnvio } from '../services/checkout.service';
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
  private readonly cart = inject(CartService);
  private readonly checkout = inject(CheckoutService);
  private readonly pagos = inject(PaymentSimulatorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cantidadTotal = this.cart.cantidadTotal;
  readonly total = this.cart.total;
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    numero: ['', [Validators.required, numeroTarjetaValidator]],
    titular: ['', [Validators.required, noSoloEspacios]],
    vencimiento: ['', [Validators.required, vencimientoValidator()]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  ngOnInit(): void {
    // Shipping data lives in memory only; after a refresh the user must fill it again.
    if (!this.checkout.datosEnvio()) {
      this.router.navigate(['/checkout']);
    }
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
    if (!envio) {
      this.router.navigate(['/checkout']);
      return;
    }

    const { numero, titular, vencimiento, cvv } = this.form.getRawValue();
    const total = this.cart.total();
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
        next: (resultado) => this.manejarResultado(resultado, total, envio),
        error: () => this.mostrarRechazo('No pudimos procesar el pago. Intentá nuevamente.'),
      });
  }

  private manejarResultado(resultado: ResultadoPago, total: number, envio: DatosEnvio): void {
    if (!resultado.aprobado || !resultado.numeroPedido) {
      this.mostrarRechazo(resultado.motivo ?? 'El pago fue rechazado.');
      return;
    }
    this.checkout.registrarPedido({ numeroPedido: resultado.numeroPedido, total, envio });
    this.cart.vaciar();
    this.router.navigate(['/checkout/resultado']);
  }

  private mostrarRechazo(motivo: string): void {
    this.error.set(motivo);
    this.procesando.set(false);
    this.form.enable();
  }
}
