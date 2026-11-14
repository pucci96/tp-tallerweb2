import { FormControl } from '@angular/forms';
import { limpiarNumeroTarjeta, numeroTarjetaValidator, vencimientoValidator } from './validadores-tarjeta';

describe('validadores de tarjeta', () => {
  const numero = (valor: string) => numeroTarjetaValidator(new FormControl(valor));
  // Fixed clock: 15 March 2026.
  const vencimiento = (valor: string) =>
    vencimientoValidator(() => new Date(2026, 2, 15))(new FormControl(valor));

  it('debería quitar espacios del número', () => {
    expect(limpiarNumeroTarjeta(' 4111 1111 1111 1111 ')).toBe('4111111111111111');
  });

  it('debería aceptar 16 dígitos con o sin espacios', () => {
    expect(numero('4111111111111111')).toBeNull();
    expect(numero('4111 1111 1111 1111')).toBeNull();
  });

  it('debería rechazar números con largo incorrecto o caracteres no numéricos', () => {
    expect(numero('411111111111111')).toEqual({ numeroTarjeta: true });
    expect(numero('41111111111111112')).toEqual({ numeroTarjeta: true });
    expect(numero('4111-1111-1111-1111')).toEqual({ numeroTarjeta: true });
  });

  it('debería delegar el campo vacío a required', () => {
    expect(numero('')).toBeNull();
    expect(vencimiento('')).toBeNull();
  });

  it('debería exigir el formato MM/AA', () => {
    expect(vencimiento('3/27')).toEqual({ vencimientoFormato: true });
    expect(vencimiento('03-27')).toEqual({ vencimientoFormato: true });
  });

  it('debería rechazar meses inválidos', () => {
    expect(vencimiento('00/27')).toEqual({ vencimientoMes: true });
    expect(vencimiento('13/27')).toEqual({ vencimientoMes: true });
  });

  it('debería aceptar el mes actual y rechazar el anterior', () => {
    expect(vencimiento('03/26')).toBeNull();
    expect(vencimiento('02/26')).toEqual({ vencimientoPasado: true });
    expect(vencimiento('12/25')).toEqual({ vencimientoPasado: true });
    expect(vencimiento('01/27')).toBeNull();
  });
});
