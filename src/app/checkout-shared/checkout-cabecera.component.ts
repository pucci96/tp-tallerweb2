import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Migas de pan, título y paso actual compartidos por las pantallas de checkout. */
@Component({
  selector: 'app-checkout-cabecera',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="migas" aria-label="Ruta de navegación">
      <a routerLink="/home">Inicio</a>
      <span aria-hidden="true">›</span>
      <a routerLink="/carrito">Carrito de compras</a>
      <span aria-hidden="true">›</span>
      <span aria-current="page">{{ titulo() }}</span>
      <a routerLink="/carrito" class="volver">← Volver al carrito</a>
    </nav>

    <header class="titulo">
      <div class="titulo-texto">
        <span class="icono" aria-hidden="true">
          @if (icono() === 'pago') {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <path d="M2 10h20"></path>
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"></path>
              <circle cx="5.5" cy="18.5" r="2"></circle>
              <circle cx="18.5" cy="18.5" r="2"></circle>
            </svg>
          }
        </span>
        <div>
          <h1>{{ titulo() }}</h1>
          <p>{{ subtitulo() }}</p>
        </div>
      </div>
      <span class="paso"><strong>Paso {{ paso() }} de 2:</strong> {{ etiquetaPaso() }}</span>
    </header>
  `,
  styles: `
    :host {
      display: block;
    }
    .migas {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--secondary-color);
    }
    .migas a {
      color: inherit;
      text-decoration: none;
    }
    .migas a:hover {
      color: var(--primary-color);
    }
    .migas [aria-current] {
      color: var(--neutral-dark);
      font-weight: 600;
    }
    .volver {
      margin-left: auto;
      color: var(--primary-color) !important;
      font-weight: 600;
    }
    .titulo {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .titulo-texto {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .icono {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: #e7f0ff;
      color: var(--primary-color);
    }
    .icono svg {
      width: 24px;
      height: 24px;
    }
    h1 {
      margin: 0;
      font-size: 1.75rem;
    }
    p {
      margin: 0.15rem 0 0;
      color: var(--secondary-color);
      font-size: 0.95rem;
    }
    .paso {
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      background: #eef1f4;
      font-size: 0.85rem;
      color: var(--secondary-color);
    }
    .paso strong {
      color: var(--primary-color);
    }
  `,
})
export class CheckoutCabeceraComponent {
  readonly paso = input.required<1 | 2>();
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly etiquetaPaso = input('');
  readonly icono = input<'envio' | 'pago'>('envio');
}
