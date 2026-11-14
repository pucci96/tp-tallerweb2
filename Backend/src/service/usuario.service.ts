import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { UsuarioRepository } from '../repository/usuario.repository';
import {
  UsuarioDTO,
  LoginDTO,
  RolDTO,
  CrearUsuarioDTO,
  CrearLoginDTO,
  CrearRolDTO,
  ActualizarUsuarioDTO,
} from '../models/usuario.dto';
import { JWT_SECRET, JWT_EXPIRES_IN_SECONDS } from '../config/jwt';
import { TokenPayload } from '../middleware/auth.middleware';
import { HttpError } from '../utils/http-error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Reglas de complejidad de contraseña (requisito del TP).
 * Deben coincidir con las del formulario de registro del frontend.
 */
export function validarPassword(password: unknown): void {
  if (typeof password !== 'string' || password.length < 8) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres');
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new HttpError(400, 'La contraseña debe contener letras y números');
  }
}

function textoRequerido(valor: unknown, campo: string): string {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    throw new HttpError(400, `El campo "${campo}" es obligatorio`);
  }
  return valor.trim();
}

export class UsuarioService {
  private usuarioRepo = new UsuarioRepository();

  async login(email: unknown, password: unknown): Promise<LoginDTO> {
    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      throw new HttpError(400, 'Debe ingresar mail y contraseña');
    }

    const login = await this.usuarioRepo.login(email.trim().toLowerCase());

    // Mismo mensaje en ambos casos para no revelar qué emails existen.
    if (!login || !(await bcrypt.compare(password, login.password))) {
      throw new HttpError(401, 'El mail o la contraseña son incorrectos');
    }

    if (!login.usuario) {
      throw new HttpError(500, 'La cuenta no tiene datos de usuario asociados');
    }

    const payload: TokenPayload = {
      sub: login.id,
      id_usuario: login.usuario.id,
      email: login.email,
      rol: login.rol.nombre,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS });

    return {
      token,
      usuario: {
        id: login.usuario.id,
        email: login.email,
        nombre: login.usuario.nombre,
        apellido: login.usuario.apellido,
        direccion: login.usuario.direccion,
        rol: login.rol.nombre,
      },
    };
  }

  async crearUsuario(dataUsuario: CrearUsuarioDTO, dataLogin: CrearLoginDTO): Promise<UsuarioDTO> {
    const nombre = textoRequerido(dataUsuario?.nombre, 'nombre');
    const apellido = textoRequerido(dataUsuario?.apellido, 'apellido');
    const direccion = textoRequerido(dataUsuario?.direccion, 'direccion');
    const email = textoRequerido(dataUsuario?.email, 'email').toLowerCase();

    if (!EMAIL_REGEX.test(email)) {
      throw new HttpError(400, 'El email no tiene un formato válido');
    }
    validarPassword(dataLogin?.password);

    if (await this.usuarioRepo.existeEmail(email)) {
      throw new HttpError(409, 'El email ya está registrado');
    }

    const rol = await this.usuarioRepo.buscarRolPorNombre('CLIENTE');
    if (!rol) {
      throw new HttpError(500, 'No existe el rol CLIENTE. Corré "npm run db:seed".');
    }

    const passwordHash = await bcrypt.hash(dataLogin.password, 10);

    const creado = await this.usuarioRepo.crearUsuario(
      { nombre, apellido, direccion, email },
      { email, password: passwordHash },
      rol.id
    );

    return {
      id: creado.usuario.id,
      email: creado.usuario.email,
      nombre: creado.usuario.nombre,
      apellido: creado.usuario.apellido,
      direccion: creado.usuario.direccion,
      rol: rol.nombre,
    };
  }

  async obtenerDatosUsuario(id_usuario: number): Promise<UsuarioDTO> {
    const datos = await this.usuarioRepo.obtenerDatosUsuario(id_usuario);
    if (!datos) {
      throw new HttpError(404, 'Usuario no encontrado');
    }
    return {
      id: datos.id,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      direccion: datos.direccion,
      rol: datos.login.rol.nombre,
    };
  }

  /**
   * Actualiza los datos del usuario logueado (perfil).
   * - El email no se puede modificar: si viene en el body se ignora.
   * - Para cambiar la contraseña hay que mandar la actual y la nueva;
   *   la actual se verifica contra la guardada antes de reemplazarla.
   */
  async actualizarMisDatos(id_usuario: number, data: Partial<ActualizarUsuarioDTO> | undefined): Promise<UsuarioDTO> {
    const nombre = textoRequerido(data?.nombre, 'nombre');
    const apellido = textoRequerido(data?.apellido, 'apellido');
    const direccion = textoRequerido(data?.direccion, 'direccion');

    const actual = await this.usuarioRepo.obtenerConLogin(id_usuario);
    if (!actual) {
      throw new HttpError(404, 'Usuario no encontrado');
    }

    const passwordActual = typeof data?.passwordActual === 'string' ? data.passwordActual : '';
    const passwordNueva = typeof data?.passwordNueva === 'string' ? data.passwordNueva : '';
    let passwordHash: string | undefined;

    if (passwordActual || passwordNueva) {
      if (!passwordActual || !passwordNueva) {
        throw new HttpError(400, 'Para cambiar la contraseña ingresá la actual y la nueva');
      }
      // 400 y no 401: un 401 hace que el frontend cierre la sesión.
      if (!(await bcrypt.compare(passwordActual, actual.login.password))) {
        throw new HttpError(400, 'La contraseña actual es incorrecta');
      }
      validarPassword(passwordNueva);
      if (passwordNueva === passwordActual) {
        throw new HttpError(400, 'La contraseña nueva debe ser distinta de la actual');
      }
      passwordHash = await bcrypt.hash(passwordNueva, 10);
    }

    const usuario = await this.usuarioRepo.actualizarDatos(id_usuario, { nombre, apellido, direccion }, passwordHash);

    return {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      direccion: usuario.direccion,
      rol: usuario.login.rol.nombre,
    };
  }

  async obtenerRol(id_usuario: number): Promise<RolDTO> {
    const rol = await this.usuarioRepo.obtenerRol(id_usuario);
    if (!rol) {
      throw new HttpError(404, 'Usuario no encontrado');
    }
    return { id: rol.id, nombre: rol.nombre };
  }

  async crearRol(data: CrearRolDTO): Promise<RolDTO> {
    const nombre = textoRequerido(data?.nombre, 'nombre').toUpperCase();
    const rol = await this.usuarioRepo.crearRol({ nombre });
    return { id: rol.id, nombre: rol.nombre };
  }

  async asignarRol(id_usuario: number, id_rol: unknown): Promise<void> {
    const idRol = Number(id_rol);
    if (!Number.isInteger(idRol) || !(await this.usuarioRepo.buscarRolPorId(idRol))) {
      throw new HttpError(400, 'El rol indicado no existe');
    }
    const resultado = await this.usuarioRepo.asignarRol(id_usuario, idRol);
    if (!resultado) {
      throw new HttpError(404, 'Usuario no encontrado');
    }
  }
}
