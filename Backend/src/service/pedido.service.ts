import { PedidoRepository } from '../repository/pedido.repository';
import { PedidoDTO, PedidoProductoDTO, CrearPedidoDTO, AgregarProductoDTO } from '../models/pedido.dto';
import { HttpError } from '../utils/http-error';

type PedidoConProductos = NonNullable<Awaited<ReturnType<PedidoRepository['obtenerPedido']>>>;
type FilaProducto = PedidoConProductos['productos'][number];

export class PedidoService {
  private pedidoRepo = new PedidoRepository();

  private mapearProducto(p: FilaProducto): PedidoProductoDTO {
    const precio = Number(p.precio);
    return {
      id: p.id,
      id_pedido: p.id_pedido,
      producto: p.producto,
      categoria: p.categoria,
      subcategoria: p.subcategoria,
      precio,
      cantidad: p.cantidad,
      subtotal: precio * p.cantidad,
    };
  }

  private mapearPedido(pedido: PedidoConProductos): PedidoDTO {
    const productos = pedido.productos.map((p) => this.mapearProducto(p));
    return {
      id: pedido.id,
      id_usuario: pedido.id_usuario,
      fecha: pedido.fecha,
      estado: pedido.estado,
      total: productos.reduce((acc, p) => acc + p.subtotal, 0),
      productos,
    };
  }

  /** Busca el pedido y verifica que sea del usuario (o que quien pide sea ADMIN). */
  private async pedidoPropio(idPedido: number, idUsuario: number, esAdmin: boolean) {
    const pedido = await this.pedidoRepo.obtenerPedido(idPedido);
    if (!pedido) throw new HttpError(404, 'Pedido no encontrado');
    if (pedido.id_usuario !== idUsuario && !esAdmin) {
      throw new HttpError(403, 'No tenés permisos sobre este pedido');
    }
    return pedido;
  }

  async obtenerPedidosDelUsuario(idUsuario: number): Promise<PedidoDTO[]> {
    const pedidos = await this.pedidoRepo.obtenerPedidosDelUsuario(idUsuario);
    return pedidos.map((p) => this.mapearPedido(p));
  }

  async obtenerPedido(idPedido: number, idUsuario: number, esAdmin: boolean): Promise<PedidoDTO> {
    return this.mapearPedido(await this.pedidoPropio(idPedido, idUsuario, esAdmin));
  }

  async crearPedido(idUsuario: number, data: CrearPedidoDTO | undefined): Promise<PedidoDTO> {
    const estado = typeof data?.estado === 'string' && data.estado.trim() ? data.estado.trim() : 'carrito';
    return this.mapearPedido(await this.pedidoRepo.crearPedido(idUsuario, estado));
  }

  async agregarProducto(
    idPedido: number,
    idUsuario: number,
    data: Partial<AgregarProductoDTO> | undefined
  ): Promise<PedidoProductoDTO> {
    const pedido = await this.pedidoPropio(idPedido, idUsuario, false);
    if (pedido.estado !== 'carrito') {
      throw new HttpError(400, 'Solo se pueden agregar productos a un pedido en estado "carrito"');
    }

    const idProducto = Number(data?.id_producto);
    if (!Number.isInteger(idProducto) || idProducto <= 0) {
      throw new HttpError(400, 'Debe indicar un id_producto válido');
    }
    const cantidad = Number(data?.cantidad ?? 1);
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new HttpError(400, 'La cantidad debe ser un número entero mayor a 0');
    }

    const producto = await this.pedidoRepo.obtenerProductoParaPedido(idProducto);
    if (!producto) throw new HttpError(404, 'Producto no encontrado');
    if (cantidad > producto.stock) {
      throw new HttpError(400, `No hay stock suficiente (disponible: ${producto.stock})`);
    }

    // Nombre, clasificación y precio se toman de la base, nunca del cliente.
    const fila = await this.pedidoRepo.agregarProducto({
      id_pedido: pedido.id,
      producto: producto.nombre,
      categoria: producto.categoria.nombre,
      subcategoria: producto.subcategoria.nombre,
      precio: Number(producto.precio),
      cantidad,
    });
    return this.mapearProducto(fila);
  }
}
