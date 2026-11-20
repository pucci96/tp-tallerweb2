import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CheckoutService, DatosEnvio } from './checkout.service';
import { PedidoDTO, PedidoService } from './pedido.service';
import { ProductService } from './product.service';

const envio: DatosEnvio = {
  nombre: 'Ana',
  apellido: 'García',
  email: 'ana@mail.com',
  direccion: 'Calle 123',
  ciudad: 'CABA',
  codigoPostal: '1414',
};

const linea = (id: number, producto: string, precio: number, cantidad: number) => ({
  id,
  id_pedido: 5,
  producto,
  categoria: 'c',
  subcategoria: 's',
  precio,
  cantidad,
  subtotal: precio * cantidad,
});

const pedido = (estado: string, productos: PedidoDTO['productos']): PedidoDTO => ({
  id: 5,
  id_usuario: 1,
  fecha: '2026-11-19',
  estado,
  total: 0,
  productos,
});

describe('CheckoutService', () => {
  let service: CheckoutService;
  let catalogo: ReturnType<typeof vi.fn>;
  let pedidos: {
    obtenerMisPedidos: ReturnType<typeof vi.fn>;
    finalizarPedido: ReturnType<typeof vi.fn>;
    cantidadCarrito: { set: ReturnType<typeof vi.fn> };
  };

  beforeEach(() => {
    pedidos = {
      obtenerMisPedidos: vi.fn().mockReturnValue(of([])),
      finalizarPedido: vi.fn().mockReturnValue(of({})),
      cantidadCarrito: { set: vi.fn() },
    };
    catalogo = vi.fn().mockReturnValue(
      of([{ id: 1, title: 'Teclado', imageUrl: 'teclado.png' }, { id: 2, title: 'Mouse', imageUrl: 'mouse.png' }]),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: PedidoService, useValue: pedidos },
        { provide: ProductService, useValue: { obtenerProductos: catalogo } },
      ],
    });
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
    service.registrarPedido({
      numeroPedido: 'TC-123456',
      lineas: [],
      cantidadTotal: 0,
      total: 1000,
      envio,
      fecha: new Date(),
      pago: { marca: 'VISA', ultimos4: '1111' },
    });
    expect(service.ultimoPedido()?.numeroPedido).toBe('TC-123456');
  });

  it('debería armar el carrito agrupando filas del mismo producto', () => {
    pedidos.obtenerMisPedidos.mockReturnValue(
      of([
        pedido('completado', [linea(1, 'Viejo', 10, 1)]),
        pedido('carrito', [
          linea(2, 'Teclado', 1000, 1),
          linea(3, 'Mouse', 500, 1),
          linea(4, 'Teclado', 1000, 2),
        ]),
      ]),
    );
    let carrito: unknown;
    service.cargarCarrito().subscribe((c) => (carrito = c));
    expect(carrito).toEqual({
      idPedido: 5,
      lineas: [
        { nombre: 'Teclado', precio: 1000, cantidad: 3, subtotal: 3000, imagen: 'teclado.png' },
        { nombre: 'Mouse', precio: 500, cantidad: 1, subtotal: 500, imagen: 'mouse.png' },
      ],
      cantidadTotal: 4,
      total: 3500,
    });
  });

  it('debería seguir funcionando sin imágenes si falla el catálogo', () => {
    catalogo.mockReturnValue(throwError(() => new Error('500')));
    pedidos.obtenerMisPedidos.mockReturnValue(of([pedido('carrito', [linea(2, 'Teclado', 1000, 1)])]));
    let carrito: { lineas: { imagen: string }[] } | null = null;
    service.cargarCarrito().subscribe((c) => (carrito = c));
    expect(carrito!.lineas[0].imagen).toBe('');
  });

  it('debería devolver null si no hay carrito o está vacío', () => {
    let resultado: unknown = 'sin valor';
    service.cargarCarrito().subscribe((c) => (resultado = c));
    expect(resultado).toBeNull();

    resultado = 'sin valor';
    pedidos.obtenerMisPedidos.mockReturnValue(of([pedido('carrito', [])]));
    service.cargarCarrito().subscribe((c) => (resultado = c));
    expect(resultado).toBeNull();
  });

  it('debería finalizar el pedido en el backend y vaciar el contador', () => {
    service.finalizarCarrito(5).subscribe();
    expect(pedidos.finalizarPedido).toHaveBeenCalledWith(5);
    service.vaciarContadorCarrito();
    expect(pedidos.cantidadCarrito.set).toHaveBeenCalledWith(0);
  });

  it('debería formatear el número de pedido con 6 dígitos', () => {
    expect(service.numeroPedido(42)).toBe('TC-000042');
  });
});
