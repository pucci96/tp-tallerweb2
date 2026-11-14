import { TestBed } from '@angular/core/testing';
import { CARRITO_STORAGE_KEY, CartService, ProductoCarrito } from './cart.service';

const teclado: ProductoCarrito = { id: 1, nombre: 'Teclado', precio: 1000, imagen: 'teclado.png' };
const mouse: ProductoCarrito = { id: 2, nombre: 'Mouse', precio: 500, imagen: 'mouse.png' };

describe('CartService', () => {
  let service: CartService;

  const crearServicio = () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    return TestBed.inject(CartService);
  };

  beforeEach(() => {
    localStorage.clear();
    service = crearServicio();
  });

  afterEach(() => localStorage.clear());

  it('debería iniciar vacío', () => {
    expect(service.items()).toEqual([]);
    expect(service.cantidadTotal()).toBe(0);
    expect(service.total()).toBe(0);
  });

  it('debería agregar un producto con cantidad 1 por defecto', () => {
    service.agregar(teclado);
    expect(service.items()).toEqual([{ ...teclado, cantidad: 1 }]);
  });

  it('debería sumar la cantidad cuando el producto ya existe', () => {
    service.agregar(teclado, 2);
    service.agregar(teclado, 3);
    expect(service.items().length).toBe(1);
    expect(service.items()[0].cantidad).toBe(5);
  });

  it('debería ignorar cantidades menores a 1 o no numéricas al agregar', () => {
    service.agregar(teclado, 0);
    service.agregar(teclado, -2);
    service.agregar(teclado, Number.NaN);
    expect(service.items()).toEqual([]);
  });

  it('debería redondear hacia abajo cantidades fraccionarias', () => {
    service.agregar(teclado, 2.7);
    expect(service.items()[0].cantidad).toBe(2);
  });

  it('debería calcular cantidad total y total', () => {
    service.agregar(teclado, 2);
    service.agregar(mouse, 3);
    expect(service.cantidadTotal()).toBe(5);
    expect(service.total()).toBe(2 * 1000 + 3 * 500);
  });

  it('debería cambiar la cantidad de un item', () => {
    service.agregar(teclado, 2);
    service.cambiarCantidad(1, 1);
    expect(service.items()[0].cantidad).toBe(1);
  });

  it('debería quitar el item cuando la cantidad es menor a 1', () => {
    service.agregar(teclado);
    service.agregar(mouse);
    service.cambiarCantidad(1, 0);
    service.cambiarCantidad(2, -1);
    expect(service.items()).toEqual([]);
  });

  it('debería quitar un item por id', () => {
    service.agregar(teclado);
    service.agregar(mouse);
    service.quitar(1);
    expect(service.items().map((i) => i.id)).toEqual([2]);
  });

  it('debería vaciar el carrito', () => {
    service.agregar(teclado);
    service.vaciar();
    expect(service.items()).toEqual([]);
    expect(JSON.parse(localStorage.getItem(CARRITO_STORAGE_KEY)!)).toEqual([]);
  });

  it('debería persistir y recuperar el carrito desde localStorage', () => {
    service.agregar(teclado, 2);
    const recuperado = crearServicio();
    expect(recuperado.items()).toEqual([{ ...teclado, cantidad: 2 }]);
  });

  it('debería iniciar vacío si el JSON guardado es inválido', () => {
    localStorage.setItem(CARRITO_STORAGE_KEY, '{no es json');
    expect(crearServicio().items()).toEqual([]);
  });

  it('debería descartar valores que no son una lista o items mal formados', () => {
    localStorage.setItem(CARRITO_STORAGE_KEY, '{"id":1}');
    expect(crearServicio().items()).toEqual([]);

    localStorage.setItem(
      CARRITO_STORAGE_KEY,
      JSON.stringify([{ ...teclado, cantidad: 2 }, { id: 'x' }, null, { ...mouse, cantidad: 0 }]),
    );
    expect(crearServicio().items()).toEqual([{ ...teclado, cantidad: 2 }]);
  });

  it('no debería fallar si localStorage lanza un error al escribir', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => service.agregar(teclado)).not.toThrow();
    expect(service.cantidadTotal()).toBe(1);
    spy.mockRestore();
  });
});
