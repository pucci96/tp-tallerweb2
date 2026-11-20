import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { CarritoCheckout, CheckoutService, DatosEnvio } from '../services/checkout.service';
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

const carrito: CarritoCheckout = {
  idPedido: 42,
  lineas: [{ nombre: 'Teclado', precio: 1000, cantidad: 2, subtotal: 2000, imagen: 't.png' }],
  cantidadTotal: 2,
  total: 2000,
};

describe('CheckoutPagoComponent', () => {
  let fixture: ComponentFixture<CheckoutPagoComponent>;
  let component: CheckoutPagoComponent;
  let navigate: ReturnType<typeof vi.spyOn>;
  let checkout: {
    datosEnvio: ReturnType<typeof signal<DatosEnvio | null>>;
    cargarCarrito: ReturnType<typeof vi.fn>;
    finalizarCarrito: ReturnType<typeof vi.fn>;
    registrarPedido: ReturnType<typeof vi.fn>;
    vaciarContadorCarrito: ReturnType<typeof vi.fn>;
    numeroPedido: (id: number) => string;
  };

  const completarTarjeta = (numero: string) =>
    component.form.setValue({ numero, titular: 'Ana García', vencimiento: '12/99', cvv: '123' });

  const crear = async () => {
    fixture = TestBed.createComponent(CheckoutPagoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  };

  beforeEach(() => {
    checkout = {
      datosEnvio: signal<DatosEnvio | null>(envio),
      cargarCarrito: vi.fn().mockReturnValue(of(carrito)),
      finalizarCarrito: vi.fn().mockReturnValue(of({})),
      registrarPedido: vi.fn(),
      vaciarContadorCarrito: vi.fn(),
      numeroPedido: (id) => `TC-${String(id).padStart(6, '0')}`,
    };
    TestBed.configureTestingModule({
      imports: [CheckoutPagoComponent],
      providers: [
        provideRouter([]),
        { provide: PAYMENT_DELAY_MS, useValue: 0 },
        { provide: CheckoutService, useValue: checkout },
      ],
    });
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('debería mostrar el resumen y la pista de tarjeta de prueba', async () => {
    await crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('2 productos');
    expect(el.textContent).toContain('2,000');
    expect(el.querySelector('.test-hint')?.textContent).toContain('0000');
  });

  it('debería usar singular cuando hay un solo producto', async () => {
    checkout.cargarCarrito.mockReturnValue(of({ ...carrito, cantidadTotal: 1 }));
    await crear();
    const resumen = (fixture.nativeElement as HTMLElement).querySelector('app-checkout-resumen')?.textContent ?? '';
    expect(resumen).toContain('1 producto');
    expect(resumen).not.toContain('1 productos');
  });

  it('debería mostrar el domicilio de entrega y actualizar la vista previa de la tarjeta', async () => {
    await crear();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Calle 123, CABA (1414)');
    completarTarjeta('4111 1111 1111 1111');
    fixture.detectChanges();
    const tarjeta = el.querySelector('.tarjeta')?.textContent ?? '';
    expect(tarjeta).toContain('VISA');
    expect(tarjeta).toContain('4111 1111 1111 1111');
    expect(tarjeta).toContain('ANA GARCÍA');
    expect(tarjeta).toContain('12/99');
  });

  it('debería deshabilitar el botón de pago con el formulario inválido', async () => {
    await crear();
    const boton = (fixture.nativeElement as HTMLElement).querySelector(
      '[data-test="pagar"]',
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería volver al paso de envío si no hay datos de envío', async () => {
    checkout.datosEnvio.set(null);
    await crear();
    expect(navigate).toHaveBeenCalledWith(['/checkout']);
    expect(checkout.cargarCarrito).not.toHaveBeenCalled();
  });

  it('debería volver al carrito si no hay carrito activo', async () => {
    checkout.cargarCarrito.mockReturnValue(of(null));
    await crear();
    expect(navigate).toHaveBeenCalledWith(['/carrito']);
  });

  it('con pago aprobado debería cerrar el pedido, registrarlo y mostrar el resultado', async () => {
    await crear();
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith(['/checkout/resultado']));
    expect(checkout.finalizarCarrito).toHaveBeenCalledWith(42);
    expect(checkout.registrarPedido).toHaveBeenCalledWith({
      numeroPedido: 'TC-000042',
      lineas: carrito.lineas,
      cantidadTotal: 2,
      total: 2000,
      envio,
      fecha: expect.any(Date),
      pago: { marca: 'VISA', ultimos4: '1111' },
    });
    expect(checkout.vaciarContadorCarrito).toHaveBeenCalled();
  });

  it('con tarjeta terminada en 0000 debería mostrar el rechazo sin cerrar el pedido', async () => {
    await crear();
    completarTarjeta('4111 1111 1111 0000');
    component.pagar();
    await vi.waitFor(() => expect(component.error()).toBe('Fondos insuficientes'));
    expect(checkout.finalizarCarrito).not.toHaveBeenCalled();
    expect(component.procesando()).toBe(false);
    expect(component.form.enabled).toBe(true);
    expect(navigate).not.toHaveBeenCalledWith(['/checkout/resultado']);
  });

  it('si falla el cierre del pedido debería avisar y permitir reintentar', async () => {
    checkout.finalizarCarrito.mockReturnValue(throwError(() => new Error('500')));
    await crear();
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    await vi.waitFor(() => expect(component.error()).toContain('no pudimos cerrar tu pedido'));
    expect(checkout.registrarPedido).not.toHaveBeenCalled();
    expect(component.procesando()).toBe(false);
  });

  it('no debería pagar dos veces mientras procesa', async () => {
    const pagos = TestBed.inject(PaymentSimulatorService);
    const pendiente = new Subject<ResultadoPago>();
    const procesar = vi.spyOn(pagos, 'procesarPago').mockReturnValue(pendiente);
    await crear();
    completarTarjeta('4111 1111 1111 1111');
    component.pagar();
    component.pagar();
    expect(procesar).toHaveBeenCalledTimes(1);
    expect(component.procesando()).toBe(true);
  });

  it('no debería pagar con el formulario inválido', async () => {
    const procesar = vi.spyOn(TestBed.inject(PaymentSimulatorService), 'procesarPago');
    await crear();
    component.pagar();
    expect(procesar).not.toHaveBeenCalled();
    expect(component.form.controls.numero.touched).toBe(true);
  });
});
