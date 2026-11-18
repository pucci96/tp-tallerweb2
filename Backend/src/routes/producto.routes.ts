import { Router } from 'express';
import { ProductoController } from '../controller/producto.controller';
import { ComentarioController } from '../controller/comentario.controller';
import { soloAdmin, verificarToken } from '../middleware/auth.middleware';

const router = Router();
const controller = new ProductoController();
const comentarios = new ComentarioController();

// Públicas (catálogo)
router.get('/', controller.obtenerCatalogo);
router.get('/destacados', controller.obtenerDestacados);
router.get('/:id', controller.obtenerDetalle); // después de /destacados, para que no la tome como un id

// Comentarios del producto: leer es público, comentar requiere sesión
router.get('/:id/comentarios', comentarios.obtenerPorProducto);
router.post('/:id/comentarios', verificarToken, comentarios.crear);

// Administración: requieren token de un usuario ADMIN
router.get('/admin/listado', ...soloAdmin, controller.listarAdmin);
router.get('/admin/:id', ...soloAdmin, controller.obtenerPorId);
router.post('/admin', ...soloAdmin, controller.crear);
router.put('/admin/:id', ...soloAdmin, controller.actualizar);
router.delete('/admin/:id', ...soloAdmin, controller.eliminar);

export default router;
