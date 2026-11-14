import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DatosTarjeta, PAYMENT_DELAY_MS, PaymentSimulatorService } from './payment-simulator.service';

const tarjeta = (numero: string): DatosTarjeta => ({
  numero,
  titular: 'Ana García',
  vencimiento: '12/99',
  cvv: '123',
});

describe('PaymentSimulatorService', () => {
  let service: PaymentSimulatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [{ provide: PAYMENT_DELAY_MS, useValue: 0 }] });
    service = TestBed.inject(PaymentSimulatorService);
  });

  it('debería usar 2000 ms de demora por defecto', () => {
    TestBed.resetTestingModule();
    expect(TestBed.inject(PAYMENT_DELAY_MS)).toBe(2000);
  });

  it('debería aprobar una tarjeta normal con número de pedido', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111111111')));
    expect(resultado.aprobado).toBe(true);
    expect(resultado.numeroPedido).toMatch(/^TC-\d{6}$/);
  });

  it('debería rechazar una tarjeta terminada en 0000 por fondos insuficientes', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111110000')));
    expect(resultado).toEqual({ aprobado: false, motivo: 'Fondos insuficientes' });
  });

  it('debería ignorar espacios al evaluar el número de tarjeta', async () => {
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111 1111 1111 0000')));
    expect(resultado.aprobado).toBe(false);
  });

  it('debería generar números de pedido con 6 dígitos aunque el aleatorio sea chico', async () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.000001);
    const resultado = await firstValueFrom(service.procesarPago(tarjeta('4111111111111111')));
    expect(resultado.numeroPedido).toBe('TC-000001');
    spy.mockRestore();
  });
});
