import { prisma } from '../config/prisma';
import { CrearPedidoDTO , CrearPedidoProductoDTO } from '../models/pedido.dto';

export class PedidoRepository {
    async obtenerPedidosDelUsuario(idUsuario: number) {
        //TODO: Implementar la lógica para obtener los pedidos de un usuario
    }

    async obtenerProductosDelPedido(idPedido: number) {
        //TODO: Implementar la lógica para obtener los productos de un pedido
    }

    async crearPedido(data: CrearPedidoDTO) {
        //TODO: Implementar la lógica para crear un nuevo pedido
    }

    async crearPedidoProducto(data: CrearPedidoProductoDTO) {
        //TODO: Implementar la lógica para crear un nuevo producto en un pedido
    }
}
