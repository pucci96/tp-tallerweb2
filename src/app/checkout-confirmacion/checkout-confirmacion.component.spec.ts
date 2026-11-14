import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService, UsuarioSesion } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CheckoutService } from '../services/checkout.service';
import { CheckoutConfirmacionComponent } from './checkout-confirmacion.component';

const usuario: UsuarioSesion = {
  id: 7,
  email: 'ana@mail.com',
  nombre: 'Ana',
  apellido: 'García',
  direccion: 'Calle 123',
  rol: 'CLIENTE',
};

describe('CheckoutConfirmacionComponent', () => {
  let fixture: ComponentFixture<CheckoutConfirmacionComponent>;
  let component: CheckoutConfirmacionComponent;
  const usuarioActual = signal<UsuarioSesion | null>(null);

  const crear = async () => {
    fixture = TestBed.createComponent(CheckoutConfirmacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    localStorage.clear();
    usuarioActual.set(null);
    TestBed.configureTestingModule({
      imports: [CheckoutConfirmacionComponent],
      providers: [provideRouter([]), { provide: AuthService, useValue: { usuarioActual } }],
    });
  });

  afterEach(() => localStorage.clear());

  it('debería mostrar el estado vacío cuando no hay items', async () => {
    const el = await crear();
    expect(el.textContent).toContain('Tu carrito está vacío');
    expect(el.querySelector('a[href="/productos"]')).not.toBeNull();
  });

  it('debería listar los items con subtotal y total', async () => {
    const cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' }, 2);
    cart.agregar({ id: 2, nombre: 'Mouse', precio: 500, imagen: 'm.png' });
    const el = await crear();
    expect(el.querySelectorAll('.cart-item').length).toBe(2);
    expect(el.textContent).toContain('Teclado');
    expect(el.textContent).toContain('Envío');
    expect(el.querySelector('.summary-total')?.textContent).toContain('2,500');
  });

  it('debería actualizar la cantidad y quitar items desde la vista', async () => {
    const cart = TestBed.inject(CartService);
    cart.agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    const el = await crear();
    (el.querySelector('[data-test="sumar"]') as HTMLButtonElement).click();
    expect(cart.items()[0].cantidad).toBe(2);
    (el.querySelector('.remove-btn') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(cart.items()).toEqual([]);
    expect(el.textContent).toContain('Tu carrito está vacío');
  });

  it('debería precargar el formulario con el usuario logueado', async () => {
    usuarioActual.set(usuario);
    await crear();
    expect(component.form.getRawValue()).toEqual(
      expect.objectContaining({
        nombre: 'Ana',
        apellido: 'García',
        email: 'ana@mail.com',
        direccion: 'Calle 123',
      }),
    );
  });

  it('debería deshabilitar "Continuar al pago" con el formulario inválido', async () => {
    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    const el = await crear();
    const boton = el.querySelector('[data-test="continuar"]') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería validar el código postal (4 a 8 alfanuméricos)', async () => {
    await crear();
    const cp = component.form.controls.codigoPostal;
    cp.setValue('12');
    expect(cp.valid).toBe(false);
    cp.setValue('C1414ABC');
    expect(cp.valid).toBe(true);
    cp.setValue('14-14');
    expect(cp.valid).toBe(false);
  });

  it('debería rechazar campos de texto compuestos solo por espacios', async () => {
    await crear();
    for (const campo of ['nombre', 'apellido', 'direccion', 'ciudad'] as const) {
      const control = component.form.controls[campo];
      control.setValue('   ');
      expect(control.hasError('soloEspacios')).toBe(true);
    }
  });

  it('debería guardar los datos de envío y navegar al pago', async () => {
    TestBed.inject(CartService).agregar({ id: 1, nombre: 'Teclado', precio: 1000, imagen: 't.png' });
    await crear();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    component.form.setValue({
      nombre: ' Ana ',
      apellido: 'García',
      email: 'ana@mail.com',
      direccion: 'Calle 123',
      ciudad: 'CABA',
      codigoPostal: '1414',
    });
    component.continuar();
    expect(TestBed.inject(CheckoutService).datosEnvio()?.nombre).toBe('Ana');
    expect(navigate).toHaveBeenCalledWith(['/checkout/pago']);
  });
});
