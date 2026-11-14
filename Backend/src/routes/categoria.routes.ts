import { Router } from 'express';
import { CategoriaController } from '../controller/categoria.controller';
import { soloAdmin } from '../middleware/auth.middleware';

// Se monta en /api  →  /api/categorias y /api/subcategorias
const router = Router();
const controller = new CategoriaController();

router.get('/categorias', controller.obtenerCategorias);
router.get('/subcategorias', controller.obtenerSubcategorias);
router.post('/categorias', ...soloAdmin, controller.crearCategoria);
router.post('/subcategorias', ...soloAdmin, controller.crearSubcategoria);

export default router;
