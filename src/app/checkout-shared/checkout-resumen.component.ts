import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatosEnvio, ResumenCompra } from '../interfaces/checkout';

/** Resumen de productos y totales; muestra el domicilio de entrega si se le pasa el envío. */
@Component({
  selector: 'app-checkout-resumen',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <aside class="panel resumen">
      <div class="panel-head">
        <h2>{{ titulo() }}</h2>
        <span class="contador">{{ resumen().cantidadTotal }} {{ resumen().cantidadTotal === 1 ? 'producto' : 'productos' }}</span>
      </div>

      <ul class="lineas">
        @for (item of resumen().lineas; track item.nombre) {
          <li class="cart-item">
            @if (item.imagen) {
              <img [src]="item.imagen" [alt]="item.nombre" />
            } @else {
              <span class="sin-imagen" aria-hidden="true"></span>
            }
            <div class="info">
              <p class="nombre">{{ item.nombre }}</p>
              <p class="detalle">Cantidad: {{ item.cantidad }} · $ {{ item.precio | number: '1.0-0' }} c/u</p>
            </div>
            <p class="subtotal">$ {{ item.subtotal | number: '1.0-0' }}</p>
          </li>
        }
      </ul>

      <div class="totales">
        <div class="fila"><span>Subtotal productos</span><span>$ {{ resumen().total | number: '1.0-0' }} ARS</span></div>
        <div class="fila"><span>Costo de envío</span><span class="gratis">Gratis</span></div>
        <div class="fila summary-total">
          <span>Total final</span>
          <strong>$ {{ resumen().total | number: '1.0-0' }} <small>ARS</small></strong>
        </div>
      </div>

      @if (envio(); as e) {
        <div class="entrega">
          <strong>Entrega a domicilio</strong>
          <span>{{ e.direccion }}, {{ e.ciudad }} ({{ e.codigoPostal }})</span>
          <span>Recibe: {{ e.nombre }} {{ e.apellido }}</span>
        </div>
      }

      @if (modificarRuta(); as ruta) {
        <a class="modificar" [routerLink]="ruta">{{ modificarTexto() }}</a>
      }
      <div class="accion"><ng-content /></div>
    </aside>
  `,
  styleUrls: ['./checkout-shared.css', './checkout-resumen.component.css'],
})
export class CheckoutResumenComponent {
  readonly resumen = input.required<ResumenCompra>();
  readonly titulo = input('Resumen de la compra');
  readonly envio = input<DatosEnvio | null>(null);
  readonly modificarRuta = input<string | null>(null);
  readonly modificarTexto = input('Modificar');
}
