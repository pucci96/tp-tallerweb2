import { Request, Response } from 'express';
import { PedidoService } from '../service/pedido.service';
import { usuarioDelToken } from '../middleware/auth.middleware';
import { parseId } from '../utils/http-error';

// Todas las rutas de pedidos requieren token: el usuario se toma del token,
// nunca de la URL, para que nadie pueda ver o modificar pedidos ajenos.
export class PedidoController {
  private pedidoService = new PedidoService();

  obtenerMisPedidos = async (req: Request, res: Response) => {
    const { id_usuario } = usuarioDelToken(req);
    res.json(await this.pedidoService.obtenerPedidosDelUsuario(id_usuario));
  };

  obtenerPedido = async (req: Request, res: Response) => {
    const { id_usuario, rol } = usuarioDelToken(req);
    const idPedido = parseId(req.params['id_pedido'], 'id de pedido');
    res.json(await this.pedidoService.obtenerPedido(idPedido, id_usuario, rol === 'ADMIN'));
  };

  crearPedido = async (req: Request, res: Response) => {
    const { id_usuario } = usuarioDelToken(req);
    res.status(201).json(await this.pedidoService.crearPedido(id_usuario, req.body));
  };

  agregarProducto = async (req: Request, res: Response) => {
    const { id_usuario } = usuarioDelToken(req);
    const idPedido = parseId(req.params['id_pedido'], 'id de pedido');
    res.status(201).json(await this.pedidoService.agregarProducto(idPedido, id_usuario, req.body));
  };
}
