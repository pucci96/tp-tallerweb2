import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { UsuarioRepository } from '../repository/usuario.repository';
import { UsuarioDTO, LoginDTO, RolDTO, CrearUsuarioDTO, CrearLoginDTO, CrearRolDTO } from '../models/usuario.dto';

import { JWT_SECRET, JWT_EXPIRES_IN_SECONDS } from '../config/jwt';

export class UsuarioService {
  private usuarioRepo = new UsuarioRepository();

  async login(email: string, password: string): Promise<LoginDTO> {
    const login = await this.usuarioRepo.login(email);

    if (!login) {
      throw new Error('El mail o la contraseña son incorrectos');
    }

    const passwordValida = await bcrypt.compare(password, login.password);
    if (!passwordValida) {
      throw new Error('El mail o la contraseña son incorrectos');
    }

    const token = jwt.sign(
      { sub: login.id, email: login.email, rol: login.rol.nombre },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN_SECONDS }
    );

    return {
      token,
      usuario: {
        id: login.usuario?.id ?? 0,
        email: login.email,
        nombre: login.usuario?.nombre ?? '',
        apellido: login.usuario?.apellido ?? '',
        direccion: login.usuario?.direccion ?? '',
        rol: login.rol.nombre,
      },
    };
  }

  async crearUsuario(dataUsuario: CrearUsuarioDTO, dataLogin: CrearLoginDTO): Promise<UsuarioDTO> {
    const email = dataUsuario.email.trim().toLowerCase();

    if (dataLogin.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }
    if (!/[A-Za-z]/.test(dataLogin.password) || !/[0-9]/.test(dataLogin.password)) {
      throw new Error('La contraseña debe contener letras y números');
    }

    if (await this.usuarioRepo.existeEmail(email)) {
      throw new Error('El email ya está registrado');
    }

    const rol = await this.usuarioRepo.buscarRolPorNombre('CLIENTE');
    if (!rol) {
      throw new Error('No existe el rol CLIENTE');
    }

    const passwordHash = await bcrypt.hash(dataLogin.password, 10);

    const creado = await this.usuarioRepo.crearUsuario(
      { ...dataUsuario, email },
      { ...dataLogin, email, password: passwordHash },
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

  async obtenerDatosUsuario(id_usuario: number): Promise<UsuarioDTO | null> {
    const datos = await this.usuarioRepo.obtenerDatosUsuario(id_usuario);
    if (!datos) return null;
    return {
      id: datos.id,
      email: datos.email,
      nombre: datos.nombre,
      apellido: datos.apellido,
      direccion: datos.direccion,
      rol: datos.login.rol.nombre,
    };
  }

  async obtenerRol(id_usuario: number): Promise<RolDTO | null> {
    return this.usuarioRepo.obtenerRol(id_usuario);
  }

  async crearRol(data: CrearRolDTO): Promise<RolDTO> {
    const rol = await this.usuarioRepo.crearRol(data);
    return { id: rol.id, nombre: rol.nombre };
  }

  async asignarRol(id_usuario: number, id_rol: number): Promise<void> {
    await this.usuarioRepo.asignarRol(id_usuario, id_rol);
  }
}
