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
}
