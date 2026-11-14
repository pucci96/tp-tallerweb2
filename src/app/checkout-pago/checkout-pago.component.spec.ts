import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { CartService } from '../services/cart.service';
import { CheckoutService, DatosEnvio } from '../services/checkout.service';
import {
  PAYMENT_DELAY_MS,
  PaymentSimulatorService,
  ResultadoPago,
} from '../services/payment-simulator.service';
import { CheckoutPagoComponent } from './checkout-pago.component';

const envio: DatosEnvio = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@mail.com',
  direccion: 'Calle 123',
  ciudad: 'CABA',
  codigoPostal: '1414',
};

describe('CheckoutPagoComponent', () => {
  let fixture: ComponentFixture<CheckoutPagoComponent>;
  let component: CheckoutPagoComponent;
  let cart: CartService;
  let navigate: ReturnType<typeof vi.spyOn>;

  const completarTarjeta = (numero: string) =>
    component.form.setValue({ numero, titular: 'Ana García', vencimiento: '12/99', cvv: '123' });

  beforeEach(async () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [CheckoutPagoComponent],
      providers: [provideRouter([]), { provide: PAYMENT_DELAY_MS, useValue: 0 }],
    });
    cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 2);
    TestBed.inject(CheckoutService).guardarEnvio(envio);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CheckoutPagoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => localStorage.clear());

  it('debería mostrar el resumen y la pista de tarjeta de prueba', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2 productos');
    expect(el.textContent).toContain('2,000');
    expect(el.querySelector('.test-hint')?.textContent).toContain('0000');
  });

  it('debería deshabilitar el botón de pago con el formulario inválido', () => {
    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-test="pagar"]',
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería rechazar un titular compuesto solo por espacios', () => {
    const titular = component.form.controls.titular;
    titular.setValue('   ');
    expect(titular.hasError('soloEspacios')).toBe(true);
  });

  it('debería redirigir a /checkout si no hay datos de envío', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [CheckoutPagoComponent],
      providers: [provideRouter([])],
    });
    const spy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const sinEnvio = TestBed.createComponent(CheckoutPagoComponent);
    await sinEnvio.whenStable();
    expect(spy).toHaveBeenCalledWith(['/checkout']);
  });

  it('debería aprobar, vaciar el carrito y navegar al resultado', async () => {
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    expect(component.procesando()).toBe(true);
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(['/checkout/resultado']));
    expect(cart.items()).toEqual([]);
    const pedido = TestBed.inject(CheckoutService).ultimoPedido();
    expect(pedido?.numeroPedido).toMatch(/^TC-\d{6}$/);
    expect(pedido?.total).toBe(2000);
    expect(pedido?.envio).toEqual(envio);
  });

  it('debería mostrar el error, conservar el carrito y permitir reintentar', async () => {
    completarTarjeta('4111 1111 1111 0000');
    component.pagar();
    await vi.waitFor(() => expect(component.error()).toBe('Fondos insuficientes'));
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.payment-error')?.textContent).toContain('Fondos insuficientes');
    expect(el.querySelector('[data-test="pagar"]')?.textContent).toContain('Reintentar');
    expect(component.procesando()).toBe(false);
    expect(component.form.enabled).toBe(true);
    expect(cart.cantidadTotal()).toBe(2);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('debería pagar completando la tarjeta desde el DOM y haciendo clic en pagar', async () => {
    const el = fixture.nativeElement as HTMLElement;
    const boton = el.querySelector('[data-test="pagar"]') as HTMLButtonElement;
    const valores: Record<string, string> = {
      numero: '4111 1111 1111 1111',
      titular: 'Ana García',
      vencimiento: '12/99',
      cvv: '123',
    };
    for (const [campo, valor] of Object.entries(valores)) {
      const input = el.querySelector(`input[formControlName="${campo}"]`) as HTMLInputElement;
      input.value = valor;
      input.dispatchEvent(new Event('input'));
    }
    await fixture.whenStable();
    expect(boton.disabled).toBe(false);

    boton.click();
    await fixture.whenStable();
    expect(boton.textContent).toContain('Procesando pago...');
    expect(boton.disabled).toBe(true);

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(['/checkout/resultado']));
    expect(cart.items()).toEqual([]);
    expect(TestBed.inject(CheckoutService).ultimoPedido()?.numeroPedido).toMatch(/^TC-\d{6}$/);
  });

  it('debería descartar el resultado si la vista se destruye antes de que llegue', () => {
    const pendiente = new Subject<ResultadoPago>();
    vi.spyOn(TestBed.inject(PaymentSimulatorService), 'procesarPago').mockReturnValue(pendiente);
    const checkout = TestBed.inject(CheckoutService);
    const registrar = vi.spyOn(checkout, 'registrarPedido');
    completarTarjeta('4111 1111 1111 1111');

    component.pagar();
    fixture.destroy();
    pendiente.next({ aprobado: true, numeroPedido: 'TC-123456' });

    expect(navigate).not.toHaveBeenCalled();
    expect(registrar).not.toHaveBeenCalled();
    expect(checkout.ultimoPedido()).toBeNull();
    expect(cart.cantidadTotal()).toBe(2);
  });

  it('debería ignorar un segundo envío mientras procesa', () => {
    const pendiente = new Subject<ResultadoPago>();
    const procesar = vi
      .spyOn(TestBed.inject(PaymentSimulatorService), 'procesarPago')
      .mockReturnValue(pendiente);
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    component.pagar();
    expect(procesar).toHaveBeenCalledTimes(1);
    expect(procesar).toHaveBeenCalledWith(
      expect.objectContaining({ numero: '4111111111111111' }),
    );
    expect(component.form.disabled).toBe(true);
  });
});
