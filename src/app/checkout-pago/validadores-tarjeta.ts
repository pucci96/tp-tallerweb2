import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function limpiarNumeroTarjeta(valor: string): string {
  return valor.replace(/\s+/g, '');
}

export const numeroTarjetaValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const valor = limpiarNumeroTarjeta(String(control.value ?? ''));
  if (!valor) {
    return null;
  }
  return /^\d{16}$/.test(valor) ? null : { numeroTarjeta: true };
};

export function vencimientoValidator(hoy: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = String(control.value ?? '').trim();
    if (!valor) {
      return null;
    }
    const coincidencia = /^(\d{2})\/(\d{2})$/.exec(valor);
    if (!coincidencia) {
      return { vencimientoFormato: true };
    }
    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);
    if (mes < 1 || mes > 12) {
      return { vencimientoMes: true };
    }
    // Cards are valid through the last day of their expiry month.
    const fecha = hoy();
    const mesActual = fecha.getFullYear() * 12 + fecha.getMonth();
    const mesVencimiento = anio * 12 + (mes - 1);
    return mesVencimiento < mesActual ? { vencimientoPasado: true } : null;
  };
}
