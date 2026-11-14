import { prisma } from '../config/prisma';

const incluirAutor = { usuario: { select: { nombre: true, apellido: true } } };

export class ComentarioRepository {
  /** Comentarios de un producto, del más nuevo al más viejo, con el nombre del autor. */
  async obtenerPorProducto(id_producto: number) {
    return prisma.comentario.findMany({
      where: { id_producto },
      include: incluirAutor,
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    });
  }

  async existeProducto(id_producto: number): Promise<boolean> {
    const producto = await prisma.producto.findUnique({ where: { id: id_producto }, select: { id: true } });
    return producto !== null;
  }

  async obtenerDelUsuario(id_producto: number, id_usuario: number) {
    return prisma.comentario.findUnique({
      where: { id_producto_id_usuario: { id_producto, id_usuario } },
    });
  }

  async crear(data: { id_producto: number; id_usuario: number; calificacion: number; texto: string }) {
    return prisma.comentario.create({ data, include: incluirAutor });
  }
}
