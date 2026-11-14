import { Router } from 'express';
import { PedidoController } from '../controller/pedido.controller';
import { verificarToken } from '../middleware/auth.middleware';

// Se monta en /api/pedidos. Todas las rutas requieren estar logueado.
const router = Router();
const controller = new PedidoController();

router.use(verificarToken);

router.get('/', controller.obtenerMisPedidos);                        // pedidos del usuario logueado
router.post('/', controller.crearPedido);                             // crea un pedido (estado "carrito")
router.get('/:id_pedido', controller.obtenerPedido);                  // detalle con productos y total
router.post('/:id_pedido/productos', controller.agregarProducto);     // { id_producto, cantidad }

export default router;
