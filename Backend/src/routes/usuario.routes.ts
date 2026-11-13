import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';
import { verificarToken, requireRole } from '../middleware/auth.middleware';

const router = Router();
const controller = new UsuarioController();

router.post('/login', controller.login);
router.post('/registrar', controller.crearUsuario);

router.get('/datos/:id_usuario', verificarToken, controller.obtenerDatosUsuario);
router.get('/rol/:id_usuario', verificarToken, controller.obtenerRol);

router.post('/rol/:id_usuario', verificarToken, requireRole('ADMIN'), controller.asignarRol);

export default router;
