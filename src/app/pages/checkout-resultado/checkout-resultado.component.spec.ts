import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { CheckoutResultadoComponent } from './checkout-resultado.component';

describe('CheckoutResultadoComponent', () => {
  let fixture: ComponentFixture<CheckoutResultadoComponent>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CheckoutResultadoComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('debería mostrar el número de pedido y la dirección de envío', async () => {
    TestBed.inject(CheckoutService).registrarPedido({
      numeroPedido: 'TC-123456',
      lineas: [{ nombre: 'Teclado', precio: 1000, cantidad: 2, subtotal: 2000, imagen: '' }],
      cantidadTotal: 2,
      total: 2000,
      fecha: new Date(2026, 10, 19, 16, 42),
      pago: { marca: 'VISA', ultimos4: '1111' },
      envio: {
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana@mail.com',
        direccion: 'Calle 123',
        ciudad: 'CABA',
        codigoPostal: '1414',
      },
    });
    fixture = TestBed.createComponent(CheckoutResultadoComponent);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('¡Pedido realizado con éxito!');
    expect(el.textContent).toContain('TC-123456');
    expect(el.textContent).toContain('VISA •••• 1111');
    expect(el.textContent).toContain('19/11/2026 16:42');
    expect(el.textContent).toContain('Calle 123');
    expect(el.textContent).toContain('Teclado');
    expect(el.querySelector('a[href="/mis-pedidos"]')?.textContent).toContain('Ver mis pedidos');
    expect(el.querySelector('a[href="/productos"]')?.textContent).toContain('Seguir comprando');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debería redirigir a /home si no hay resultado', async () => {
    fixture = TestBed.createComponent(CheckoutResultadoComponent);
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });
});
