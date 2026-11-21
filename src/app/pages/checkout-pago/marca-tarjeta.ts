/** Detecta la marca por el prefijo del número (solo para mostrar en la tarjeta de ejemplo). */
export function marcaTarjeta(numero: string): string {
  const digitos = numero.replace(/\D/g, '');
  if (/^4/.test(digitos)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(digitos)) return 'MASTERCARD';
  if (/^3[47]/.test(digitos)) return 'AMEX';
  return 'TARJETA';
}
