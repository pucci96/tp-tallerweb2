import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService, UsuarioSesion } from '../services/auth.service';
import { CarritoCheckout, CheckoutService } from '../services/checkout.service';
import { CheckoutConfirmacionComponent } from './checkout-confirmacion.component';

const usuario: UsuarioSesion = {
  id: 7,
  email: 'ana@mail.com',
  nombre: 'Ana',
  apellido: 'García',
  direccion: 'Calle 123',
  rol: 'CLIENTE',
};

const carrito: CarritoCheckout = {
  idPedido: 5,
  lineas: [
    { nombre: 'Teclado', precio: 1000, cantidad: 2, subtotal: 2000, imagen: 't.png' },
    { nombre: 'Mouse', precio: 500, cantidad: 1, subtotal: 500, imagen: '' },
  ],
  cantidadTotal: 3,
  total: 2500,
};

describe('CheckoutConfirmacionComponent', () => {
  let fixture: ComponentFixture<CheckoutConfirmacionComponent>;
  let component: CheckoutConfirmacionComponent;
  let checkout: CheckoutService;
  const usuarioActual = signal<UsuarioSesion | null>(null);
  const cargarCarrito = vi.fn();

  const crear = async () => {
    fixture = TestBed.createComponent(CheckoutConfirmacionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  const llenarFormulario = () =>
    component.form.setValue({
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana@mail.com',
      direccion: 'Calle 123',
      ciudad: 'CABA',
      codigoPostal: '1414',
    });

  beforeEach(() => {
    usuarioActual.set(null);
    cargarCarrito.mockReset().mockReturnValue(of(carrito));
    TestBed.configureTestingModule({
      imports: [CheckoutConfirmacionComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { usuarioActual } },
        { provide: CheckoutService, useValue: buildCheckoutStub() },
      ],
    });
    checkout = TestBed.inject(CheckoutService);
  });

  function buildCheckoutStub() {
    const envio = signal<unknown>(null);
    return {
      datosEnvio: envio.asReadonly(),
      guardarEnvio: (d: unknown) => envio.set(d),
      cargarCarrito,
    };
  }

  it('debería mostrar el estado vacío cuando no hay carrito', async () => {
    cargarCarrito.mockReturnValue(of(null));
    const el = await crear();
    expect(el.textContent).toContain('Tu carrito está vacío');
    expect(el.querySelector('a[href="/productos"]')).not.toBeNull();
  });

  it('debería mostrar el estado vacío si falla la carga del carrito', async () => {
    cargarCarrito.mockReturnValue(throwError(() => new Error('fallo')));
    const el = await crear();
    expect(el.textContent).toContain('Tu carrito está vacío');
  });

  it('debería listar las líneas del pedido con cantidad y total', async () => {
    const el = await crear();
    expect(el.querySelectorAll('.cart-item').length).toBe(2);
    expect(el.textContent).toContain('Teclado');
    expect(el.textContent).toContain('Cantidad: 2');
    expect(el.querySelector('.summary-total')?.textContent).toContain('2,500');
    expect(el.querySelector('a[href="/carrito"]')).not.toBeNull();
  });

  it('debería precargar nombre, apellido, email y dirección desde la sesión', async () => {
    usuarioActual.set(usuario);
    await crear();
    expect(component.form.getRawValue()).toMatchObject({
      nombre: 'Ana',
      apellido: 'García',
      email: 'ana@mail.com',
      direccion: 'Calle 123',
      ciudad: '',
    });
  });

  it('debería deshabilitar continuar con el formulario inválido', async () => {
    const el = await crear();
    const boton = el.querySelector('[data-test="continuar"]') as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
  });

  it('debería rechazar campos con solo espacios y códigos postales inválidos', async () => {
    await crear();
    llenarFormulario();
    component.form.patchValue({ direccion: '   ' });
    expect(component.form.controls.direccion.invalid).toBe(true);
    component.form.patchValue({ direccion: 'Calle 123', codigoPostal: '12' });
    expect(component.form.controls.codigoPostal.invalid).toBe(true);
  });

  it('debería guardar el envío recortado y navegar al pago', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await crear();
    llenarFormulario();
    component.form.patchValue({ nombre: '  Ana  ' });
    component.continuar();
    expect(checkout.datosEnvio()).toMatchObject({ nombre: 'Ana', ciudad: 'CABA' });
    expect(navigate).toHaveBeenCalledWith(['/checkout/pago']);
  });

  it('no debería continuar si el formulario es inválido', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    await crear();
    component.continuar();
    expect(navigate).not.toHaveBeenCalled();
    expect(component.form.controls.nombre.touched).toBe(true);
  });
});
