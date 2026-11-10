import { Router } from 'express';
import { ProductoController } from '../controller/producto.controller';

const router = Router();
const controller = new ProductoController();

router.get('/destacados', controller.obtenerDestacados);
router.get('/', controller.obtenerCatalogo);
router.post('/admin', controller.crearProducto);

export default router;