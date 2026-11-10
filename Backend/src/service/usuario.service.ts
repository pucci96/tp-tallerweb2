import { UsuarioRepository } from '../repository/usuario.repository';
import { UsuarioDTO, LoginDTO, RolDTO, CrearUsuarioDTO, CrearLoginDTO, CrearRolDTO } from '../models/usuario.dto';

export class UsuarioService {
    private usuarioRepo = new UsuarioRepository();

    async obtenerDatosUsuario(id_usuario: number): Promise<UsuarioDTO> {
        return this.usuarioRepo.obtenerDatosUsuario(id_usuario);
    }

    async login(email: string, password: string): Promise<LoginDTO> {
        return this.usuarioRepo.login(email, password);
    }

    async obtenerRol(id_usuario: number): Promise<RolDTO> {
        return this.usuarioRepo.obtenerRol(id_usuario);
    }

    async crearUsuario(dataUsuario: CrearUsuarioDTO, dataLogin: CrearLoginDTO): Promise<UsuarioDTO> {
        return this.usuarioRepo.crearUsuario(dataUsuario, dataLogin);
    }

    async crearRol(data: CrearRolDTO): Promise<RolDTO> {
        return this.usuarioRepo.crearRol(data);
    }

    async asignarRol(id_usuario: number, id_rol: number): Promise<void> {
        return this.usuarioRepo.asignarRol(id_usuario, id_rol);
    }
}   