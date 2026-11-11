import { Router } from 'express';
import { ProductoController } from '../controller/producto.controller';

const router = Router();
const controller = new ProductoController();

router.get('/destacados', controller.obtenerDestacados);
router.get('/', controller.obtenerCatalogo);
router.post('/admin', controller.crearProducto);

router.get('/admin/listado', controller.listarAdmin);
router.get('/admin/:id', controller.obtenerPorId);
router.post('/admin', controller.crearProducto);
router.put('/admin/:id', controller.actualizar);
router.delete('/admin/:id', controller.eliminar);

export default router;