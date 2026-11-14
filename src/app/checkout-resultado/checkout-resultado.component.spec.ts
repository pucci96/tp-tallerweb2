import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutResultadoComponent } from './checkout-resultado.component';

describe('CheckoutResultadoComponent', () => {
  let fixture: ComponentFixture<CheckoutResultadoComponent>;
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CheckoutResultadoComponent],
      providers: [provideRouter([])],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('debería mostrar el número de pedido y la dirección de envío', async () => {
    TestBed.inject(CheckoutService).registrarPedido({
      numeroPedido: 'TC-123456',
      total: 2000,
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
    expect(el.textContent).toContain('¡Pago aprobado!');
    expect(el.textContent).toContain('TC-123456');
    expect(el.textContent).toContain('Calle 123');
    expect(el.querySelector('a[href="/home"]')?.textContent).toContain('Volver a la tienda');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debería redirigir a /home si no hay resultado', async () => {
    fixture = TestBed.createComponent(CheckoutResultadoComponent);
    await fixture.whenStable();
    expect(navigate).toHaveBeenCalledWith(['/home']);
  });
});
