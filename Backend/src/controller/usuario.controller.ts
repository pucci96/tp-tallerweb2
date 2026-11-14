import { Request, Response } from 'express';
import { UsuarioService } from '../service/usuario.service';
import { usuarioDelToken } from '../middleware/auth.middleware';
import { HttpError, parseId } from '../utils/http-error';

// Los errores lanzados acá (o en el service) los maneja error.middleware.ts.
export class UsuarioController {
  private usuarioService = new UsuarioService();

  /** Un usuario solo puede ver sus propios datos, salvo que sea ADMIN. */
  private verificarAcceso(req: Request, id_usuario: number): void {
    const token = usuarioDelToken(req);
    if (token.id_usuario !== id_usuario && token.rol !== 'ADMIN') {
      throw new HttpError(403, 'No tenés permisos para ver los datos de otro usuario');
    }
  }

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    const resultado = await this.usuarioService.login(email, password);
    res.json(resultado);
  };

  crearUsuario = async (req: Request, res: Response) => {
    const dataUsuario = req.body?.usuario;
    const dataLogin = req.body?.login;
    if (!dataUsuario || !dataLogin) {
      throw new HttpError(400, 'El body debe incluir "usuario" y "login"');
    }
    const nuevoUsuario = await this.usuarioService.crearUsuario(dataUsuario, dataLogin);
    res.status(201).json(nuevoUsuario);
  };

  /** Datos del usuario logueado (según el token). */
  obtenerMisDatos = async (req: Request, res: Response) => {
    const { id_usuario } = usuarioDelToken(req);
    res.json(await this.usuarioService.obtenerDatosUsuario(id_usuario));
  };

  obtenerDatosUsuario = async (req: Request, res: Response) => {
    const id_usuario = parseId(req.params['id_usuario'], 'id de usuario');
    this.verificarAcceso(req, id_usuario);
    res.json(await this.usuarioService.obtenerDatosUsuario(id_usuario));
  };

  obtenerRol = async (req: Request, res: Response) => {
    const id_usuario = parseId(req.params['id_usuario'], 'id de usuario');
    this.verificarAcceso(req, id_usuario);
    res.json(await this.usuarioService.obtenerRol(id_usuario));
  };

  asignarRol = async (req: Request, res: Response) => {
    const id_usuario = parseId(req.params['id_usuario'], 'id de usuario');
    await this.usuarioService.asignarRol(id_usuario, req.body?.id_rol);
    res.json({ mensaje: 'Rol asignado correctamente' });
  };

  crearRol = async (req: Request, res: Response) => {
    const nuevoRol = await this.usuarioService.crearRol(req.body);
    res.status(201).json(nuevoRol);
  };
}
