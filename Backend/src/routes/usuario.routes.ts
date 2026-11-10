import { Router } from 'express';
import { UsuarioController } from '../controller/usuario.controller';

const router = Router();
const controller = new UsuarioController();

router.post('/login', controller.login);
router.post('/registrar', controller.crearUsuario);
router.get('/datos/:id_usuario', controller.obtenerDatosUsuario);
router.get('/rol/:id_usuario', controller.obtenerRol);
router.post('/rol/:id_usuario', controller.asignarRol);

export default router;