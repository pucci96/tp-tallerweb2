import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// Validators.required accepts '   '; this rejects whitespace-only text and leaves '' to required.
export const noSoloEspacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor = String(control.value ?? '');
  if (valor === '') {
    return null;
  }
  return valor.trim() === '' ? { soloEspacios: true } : null;
};
