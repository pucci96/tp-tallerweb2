import { prisma } from '../config/prisma';

const incluirProductos = { productos: { orderBy: { id: 'asc' as const } } };

export class PedidoRepository {
  async obtenerPedidosDelUsuario(idUsuario: number) {
    return prisma.pedido.findMany({
      where: { id_usuario: idUsuario },
      include: incluirProductos,
      orderBy: { fecha: 'desc' },
    });
  }

  async obtenerPedido(idPedido: number) {
    return prisma.pedido.findUnique({
      where: { id: idPedido },
      include: incluirProductos,
    });
  }

  async crearPedido(idUsuario: number, estado: string) {
    return prisma.pedido.create({
      data: { id_usuario: idUsuario, estado },
      include: incluirProductos,
    });
  }

  async obtenerProductoParaPedido(idProducto: number) {
    return prisma.producto.findUnique({
      where: { id: idProducto },
      include: { categoria: true, subcategoria: true },
    });
  }

  async agregarProducto(data: {
    id_pedido: number;
    producto: string;
    categoria: string;
    subcategoria: string;
    precio: number;
    cantidad: number;
  }) {
    return prisma.pedido_productos.create({ data });
  }

  async decrementarStock(idProducto: number, cantidad: number) {
    return prisma.producto.update({
      where: { id: idProducto },
      data: { stock: { decrement: cantidad } },
    });
  }

  async eliminarProductoDelPedido(idItemPedido: number) {
    return prisma.pedido_productos.delete({
      where: { id: idItemPedido },
    });
  }

  async actualizarEstadoPedido(idPedido: number, estado: string) {
    return prisma.pedido.update({
      where: { id: idPedido },
      data: { estado },
      include: incluirProductos, // Para que devuelva el pedido con sus productos mapeados correctamente
    });
  }
}


