import { prisma } from '../config/prisma';
import { CrearPedidoDTO, CrearPedidoProductoDTO } from '../models/pedido.dto';

export class PedidoRepository {

    async obtenerPedidosDelUsuario(idUsuario: number) {
        // Trae los pedidos con sus productos asociados según el schema original
        return prisma.pedido.findMany({
            include: {
                productos: true
            }
        });
    }

    async obtenerProductosDelPedido(idPedido: number) {
        return prisma.pedido_productos.findMany({
            where: { id_pedido: Number(idPedido) }
        });
    }

    async crearPedido(data: CrearPedidoDTO) {
        return prisma.pedido.create({
            data: {
                estado: data.estado || 'carrito',
                fecha: new Date()
            }
        });
    }

    async crearPedidoProducto(data: CrearPedidoProductoDTO) {
        return prisma.pedido_productos.create({
            data: {
                id_pedido: Number(data.id_pedido),
                producto: data.producto,
                categoria: data.categoria,
                subcategoria: data.subcategoria,
                precio: Number(data.precio)
            }
        });
    }
}