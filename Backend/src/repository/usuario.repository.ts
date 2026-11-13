import { prisma } from '../config/prisma';
import { CrearUsuarioDTO , CrearRolDTO , CrearLoginDTO } from '../models/usuario.dto';
import { Usuario } from '../../../src/generated/prisma/browser';

export class UsuarioRepository {
    async login(email: string) {
        return prisma.login.findUnique({
            where: {email},
            include: {
                rol: true,
                usuario: true,
            },
        });
    }

    async existeEmail(email: string) : Promise<boolean> {
        const login = await prisma.login.findUnique({
          where: {email},
          select: {id: true},
        });
        return login !== null;
    }

    async buscarRolPorNombre(nombre: string) {
        return prisma.rol.findUnique({
            where: {nombre},
        });
    }

    async crearUsuario(dataUsuario: CrearUsuarioDTO, dataLogin: CrearLoginDTO, id_rol: number){
        return prisma.$transaction(async (tx) => {
          const login = await tx.login.create({
            data: {
              email: dataLogin.email,
              password: dataLogin.password,
              id_rol: id_rol,
            },
          });

          const usuario = await tx.usuario.create({
            data: {
              email: dataUsuario.email,
              nombre: dataUsuario.nombre,
              apellido: dataUsuario.apellido,
              direccion: dataUsuario.direccion,
            },
          });

          return {login, usuario};
        });
    }

    async obtenerDatosUsuario(id_usuario: number) {
      return prisma.usuario.findUnique({
        where: {id: id_usuario},
        include: {
          login: {
            include: {rol: true},
          },
        },
      });
    }

    async obtenerRol(id_usuario: number) {
      const usuario = await prisma.usuario.findUnique({
        where: {id: id_usuario},
        select: {
          login: {
            select: {rol: true},
          },
        },
      });

      return usuario?.login.rol ?? null;
    }

    async crearRol(data: CrearRolDTO){
      return prisma.rol.create({
        data: {nombre: data.nombre},
      });
    }

    async asignarRol(id_usuario: number, id_rol: number) {
      const usuario = await prisma.usuario.findUnique({
        where: {id: id_usuario},
        select: {email: true},
      });

      if(!usuario) {
        throw new Error('El usuario no fue encontrado');
      }

      return prisma.login.update({
        where: {email: usuario.email},
        data: {id_rol},
      });
    }
}
