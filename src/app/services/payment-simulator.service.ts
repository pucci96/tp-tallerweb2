import { Injectable, InjectionToken, inject } from '@angular/core';
import { Observable, defer, delay, of } from 'rxjs';

export interface DatosTarjeta {
  numero: string;
  titular: string;
  vencimiento: string;
  cvv: string;
}

export interface ResultadoPago {
  aprobado: boolean;
  numeroPedido?: string;
  motivo?: string;
}

export const PAYMENT_DELAY_MS = new InjectionToken<number>('PAYMENT_DELAY_MS', {
  providedIn: 'root',
  factory: () => 2000,
});

@Injectable({ providedIn: 'root' })
export class PaymentSimulatorService {
  private readonly demoraMs = inject(PAYMENT_DELAY_MS);

  procesarPago(tarjeta: DatosTarjeta): Observable<ResultadoPago> {
    return defer(() => of(evaluarTarjeta(tarjeta))).pipe(delay(this.demoraMs));
  }
}

function evaluarTarjeta(tarjeta: DatosTarjeta): ResultadoPago {
  const digitos = tarjeta.numero.replace(/\D/g, '');
  if (digitos.endsWith('0000')) {
    return { aprobado: false, motivo: 'Fondos insuficientes' };
  }
  return { aprobado: true, numeroPedido: generarNumeroPedido() };
}

function generarNumeroPedido(): string {
  const numero = Math.floor(Math.random() * 1_000_000);
  return `TC-${numero.toString().padStart(6, '0')}`;
}
