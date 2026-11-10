import { Router } from 'express';
import { CategoriaController } from '../controller/categoria.controller';

const router = Router();
const controller = new CategoriaController();

router.get('/', controller.obtenerCategorias);
router.get('/subcategorias', controller.obtenerSubcategorias);
router.post('/', controller.crearCategoria);
router.post('/subcategoria', controller.crearSubcategoria);

export default router;