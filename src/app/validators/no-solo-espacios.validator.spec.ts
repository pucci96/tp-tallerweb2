import { FormControl } from '@angular/forms';
import { noSoloEspacios } from './no-solo-espacios.validator';

describe('noSoloEspacios', () => {
  const validar = (valor: string | null) => noSoloEspacios(new FormControl(valor));

  it('debería delegar el valor vacío a required', () => {
    expect(validar('')).toBeNull();
    expect(validar(null)).toBeNull();
  });

  it('debería rechazar valores compuestos solo por espacios', () => {
    expect(validar('   ')).toEqual({ soloEspacios: true });
    expect(validar('\t \n')).toEqual({ soloEspacios: true });
  });

  it('debería aceptar texto con contenido', () => {
    expect(validar(' Ana ')).toBeNull();
  });
});
