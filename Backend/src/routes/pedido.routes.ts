import { Router } from 'express';
import { PedidoController } from '../controller/pedido.controller';

const router = Router();
const controller = new PedidoController();

router.post('/crearPedido', controller.crearPedido);
router.post('/agregarProducto', controller.crearPedidoProducto);
router.get('/obtenerPedidos/:id_usuario', controller.obtenerPedidosDelUsuario);
router.get('/obtenerProductosPedido/:id_pedido', controller.obtenerProductosDelPedido);
export default router;