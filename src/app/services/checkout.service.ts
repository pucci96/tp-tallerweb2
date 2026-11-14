import { Injectable, signal } from '@angular/core';

export interface DatosEnvio {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export interface PedidoConfirmado {
  numeroPedido: string;
  total: number;
  envio: DatosEnvio;
}

// Memory only: a page refresh intentionally clears the checkout state.
@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly _datosEnvio = signal<DatosEnvio | null>(null);
  private readonly _ultimoPedido = signal<PedidoConfirmado | null>(null);

  readonly datosEnvio = this._datosEnvio.asReadonly();
  readonly ultimoPedido = this._ultimoPedido.asReadonly();

  guardarEnvio(datos: DatosEnvio): void {
    this._datosEnvio.set({ ...datos });
  }

  registrarPedido(pedido: PedidoConfirmado): void {
    this._ultimoPedido.set(pedido);
  }
}
