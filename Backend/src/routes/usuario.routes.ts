import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';
import { verificarToken, soloAdmin } from '../middleware/auth.middleware';

const router = Router();
const controller = new UsuarioController();

// Públicas
router.post('/login', controller.login);
router.post('/registrar', controller.crearUsuario);

// Usuario logueado
router.get('/me', verificarToken, controller.obtenerMisDatos);
router.get('/datos/:id_usuario', verificarToken, controller.obtenerDatosUsuario);
router.get('/rol/:id_usuario', verificarToken, controller.obtenerRol);

// Solo ADMIN
router.post('/rol', ...soloAdmin, controller.crearRol);
router.post('/rol/:id_usuario', ...soloAdmin, controller.asignarRol);

export default router;
