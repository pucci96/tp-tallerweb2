import { prisma } from '../config/prisma';
import { CrearUsuarioDTO , CrearRolDTO , CrearLoginDTO } from '../models/usuario.dto';

export class UsuarioRepository {
    async obtenerDatosUsuario(id_usuario: number) {
        //TODO: Implementar la lógica para obtener datos del usuario por su ID
    }

    async login(email: string, password: string) {
        //TODO: Implementar la lógica para el inicio de sesión
    }

    async obtenerRol(id_usuario: number) {
        //TODO: Implementar la lógica para obtener el rol del usuario por su ID
    }

    async crearUsuario(dataUsuario: CrearUsuarioDTO, dataLogin: CrearLoginDTO) {
        //TODO: Implementar la lógica para crear un nuevo usuario
    }

    async crearRol(data: CrearRolDTO) {
        //TODO: Implementar la lógica para crear un nuevo rol
    }

    async asignarRol(id_usuario: number, id_rol: number) {
        //TODO: Implementar la lógica para asignar un rol a un usuario
    }
}