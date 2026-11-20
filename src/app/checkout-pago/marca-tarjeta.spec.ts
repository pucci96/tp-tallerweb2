import { marcaTarjeta } from './marca-tarjeta';

describe('marcaTarjeta', () => {
  it('debería detectar Visa, Mastercard y Amex por prefijo', () => {
    expect(marcaTarjeta('4111 1111 1111 1111')).toBe('VISA');
    expect(marcaTarjeta('5500 0000 0000 0004')).toBe('MASTERCARD');
    expect(marcaTarjeta('2221000000000009')).toBe('MASTERCARD');
    expect(marcaTarjeta('3782 822463 10005')).toBe('AMEX');
  });

  it('debería devolver TARJETA si no reconoce el prefijo o está vacío', () => {
    expect(marcaTarjeta('')).toBe('TARJETA');
    expect(marcaTarjeta('9999')).toBe('TARJETA');
  });
});
