import { Router } from 'express';
import { ProductoController } from '../controller/producto.controller';
import { soloAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProductoController();

// Públicas (catálogo)
router.get('/', controller.obtenerCatalogo);
router.get('/destacados', controller.obtenerDestacados);

// Administración: requieren token de un usuario ADMIN
router.get('/admin/listado', ...soloAdmin, controller.listarAdmin);
router.get('/admin/:id', ...soloAdmin, controller.obtenerPorId);
router.post('/admin', ...soloAdmin, controller.crear);
router.put('/admin/:id', ...soloAdmin, controller.actualizar);
router.delete('/admin/:id', ...soloAdmin, controller.eliminar);

export default router;
