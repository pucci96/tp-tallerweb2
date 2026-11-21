import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutCabeceraComponent } from '../../components/checkout-shared/checkout-cabecera.component';
import { CheckoutResumenComponent } from '../../components/checkout-shared/checkout-resumen.component';
import { CheckoutService } from '../../services/checkout.service';
import { PaymentSimulatorService } from '../../services/payment-simulator.service';
import { noSoloEspacios } from '../../validators/no-solo-espacios.validator';
import { marcaTarjeta } from './marca-tarjeta';

import { CarritoCheckout, DatosEnvio, MedioPago } from '../../interfaces/checkout';
import { ResultadoPago } from '../../interfaces/pago';
import {
  limpiarNumeroTarjeta,
  numeroTarjetaValidator,
  vencimientoValidator,
} from './validadores-tarjeta';

type CampoTarjeta = 'numero' | 'titular' | 'vencimiento' | 'cvv';

@Component({
  selector: 'app-checkout-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CheckoutCabeceraComponent, CheckoutResumenComponent],
  templateUrl: './checkout-pago.component.html',
  styleUrls: ['../../components/checkout-shared/checkout-shared.css', './checkout-pago.component.css'],
})
export class CheckoutPagoComponent implements OnInit {
  private readonly checkout = inject(CheckoutService);
  private readonly pagos = inject(PaymentSimulatorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly envio = this.checkout.datosEnvio;
  readonly carrito = signal<CarritoCheckout | null>(null);
  readonly procesando = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = inject(FormBuilder).nonNullable.group({
    numero: ['', [Validators.required, numeroTarjetaValidator]],
    titular: ['', [Validators.required, noSoloEspacios]],
    vencimiento: ['', [Validators.required, vencimientoValidator()]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]],
  });

  // Vista previa de la tarjeta: se actualiza a medida que se escribe.
  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  readonly marca = computed(() => marcaTarjeta(this.valores().numero ?? ''));
  readonly numeroVisual = computed(() => {
    const digitos = limpiarNumeroTarjeta(this.valores().numero ?? '').padEnd(16, '•');
    return (digitos.match(/.{1,4}/g) ?? []).join(' ');
  });
  readonly titularVisual = computed(() => (this.valores().titular ?? '').trim().toUpperCase() || 'NOMBRE APELLIDO');
  readonly vencimientoVisual = computed(() => this.valores().vencimiento || 'MM/AA');

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
    const numeroLimpio = limpiarNumeroTarjeta(numero);
    // Del medio de pago solo se conservan la marca y los últimos 4 dígitos para el comprobante.
    const pago: MedioPago = { marca: marcaTarjeta(numeroLimpio), ultimos4: numeroLimpio.slice(-4) };
    this.procesando.set(true);
    this.error.set(null);
    this.form.disable();

    this.pagos
      .procesarPago({ numero: numeroLimpio, titular: titular.trim(), vencimiento, cvv })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resultado) => this.manejarResultado(resultado, carrito, envio, pago),
        error: () => this.mostrarRechazo('No pudimos procesar el pago. Intentá nuevamente.'),
      });
  }

  private manejarResultado(
    resultado: ResultadoPago,
    carrito: CarritoCheckout,
    envio: DatosEnvio,
    pago: MedioPago,
  ): void {
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
            lineas: carrito.lineas,
            cantidadTotal: carrito.cantidadTotal,
            total: carrito.total,
            envio,
            fecha: new Date(),
            pago,
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
