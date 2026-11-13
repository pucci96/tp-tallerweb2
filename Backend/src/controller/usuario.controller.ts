import { Request, Response } from 'express';
import { UsuarioService } from '../service/usuario.service';

export class UsuarioController {
  private usuarioService = new UsuarioService();

  //validacion pra no estar repitiendo codigo abajo
  private parseId(valor: string | string[]): number {
    const texto = Array.isArray(valor) ? valor[0] : valor;
    const id = parseInt(texto,10);
    if (isNaN(id)) {
      throw new Error('el id debe ser un número');
    }
    return id;
  }

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Debe ingresar mail y contraseña' });
      }

      const resultado = await this.usuarioService.login(email, password);
      res.json(resultado);
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error);
      res.status(401).json({ error: error.message || 'El mail o la contraseña son incorrectos' });
    }
  };

  obtenerDatosUsuario = async (req: Request, res: Response) => {
    try {
      const id_usuario = this.parseId(req.params.id_usuario);
      const usuario = await this.usuarioService.obtenerDatosUsuario(id_usuario);
      res.json(usuario);
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  obtenerRol = async (req: Request, res: Response) => {
    try {
      const id_usuario = this.parseId(req.params.id_usuario);
      const rol = await this.usuarioService.obtenerRol(id_usuario);
      res.json(rol);
    } catch (error) {
      console.error('Error al obtener rol del usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  asignarRol = async (req: Request, res: Response) => {
    try {
      const id_usuario = this.parseId(req.params.id_usuario);
      const { id_rol } = req.body;
      const resultado = await this.usuarioService.asignarRol(id_usuario, id_rol);
      res.json(resultado);
    } catch (error: any) {
      console.error('Error al asignar rol al usuario:', error);
      res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  };

  crearUsuario = async (req: Request, res: Response) => {
    try {
      const dataUsuario = req.body.usuario;   // Datos del usuario
      const dataLogin = req.body.login;       // Datos de login

      if (!dataUsuario || !dataLogin) {
        return res.status(400).json({ error: 'El body debe incluir "usuario" y "login"' });
      }

      const nuevoUsuario = await this.usuarioService.crearUsuario(dataUsuario, dataLogin);
      res.status(201).json(nuevoUsuario);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);

      if (error.message === 'El email ya está registrado') {
        return res.status(409).json({ error: error.message });
      }
      res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  };

  crearRol = async (req: Request, res: Response) => {
    try {
      const nuevoRol = await this.usuarioService.crearRol(req.body);
      res.status(201).json(nuevoRol);
    } catch (error: any) {
      console.error('Error al crear rol:', error);
      res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  };

}
