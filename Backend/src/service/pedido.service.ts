import { PedidoRepository } from '../repository/pedido.repository';
import { PedidoDTO, CrearPedidoDTO, PedidoProductoDTO, CrearPedidoProductoDTO } from '../models/pedido.dto';

export class PedidoService {
    private pedidoRepo = new PedidoRepository();

    async obtenerPedidosDelUsuario(idUsuario: number): Promise<PedidoDTO[]> {
        return this.pedidoRepo.obtenerPedidosDelUsuario(idUsuario);
    }

    async obtenerProductosDelPedido(idPedido: number): Promise<PedidoProductoDTO[]> {
        return this.pedidoRepo.obtenerProductosDelPedido(idPedido);
    }

    async crearPedido(data: CrearPedidoDTO): Promise<PedidoDTO> {
        return this.pedidoRepo.crearPedido(data);
    }

    async crearPedidoProducto(data: CrearPedidoProductoDTO): Promise<PedidoProductoDTO> {
        return this.pedidoRepo.crearPedidoProducto(data);
    }
}