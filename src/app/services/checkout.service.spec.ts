import { TestBed } from '@angular/core/testing';
import { CheckoutService, DatosEnvio } from './checkout.service';

const envio: DatosEnvio = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@mail.com',
  direccion: 'Calle 123',
  ciudad: 'CABA',
  codigoPostal: '1414',
};

describe('CheckoutService', () => {
  let service: CheckoutService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CheckoutService);
  });

  it('debería iniciar sin datos de envío ni pedido', () => {
    expect(service.datosEnvio()).toBeNull();
    expect(service.ultimoPedido()).toBeNull();
  });

  it('debería guardar los datos de envío', () => {
    service.guardarEnvio(envio);
    expect(service.datosEnvio()).toEqual(envio);
  });

  it('debería registrar el último pedido', () => {
    service.registrarPedido({ numeroPedido: 'TC-123456', total: 1000, envio });
    expect(service.ultimoPedido()?.numeroPedido).toBe('TC-123456');
  });
});
