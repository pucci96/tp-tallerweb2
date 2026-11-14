import { ComentarioRepository } from '../repository/comentario.repository';
import { ComentarioDTO, ComentariosProductoDTO, CrearComentarioDTO } from '../models/comentario.dto';
import { HttpError } from '../utils/http-error';

export const MAX_LARGO_COMENTARIO = 500;

type FilaComentario = Awaited<ReturnType<ComentarioRepository['crear']>>;

export class ComentarioService {
  private comentarioRepo = new ComentarioRepository();

  private mapear(c: FilaComentario): ComentarioDTO {
    const inicialApellido = c.usuario.apellido.trim().charAt(0).toUpperCase();
    return {
      id: c.id,
      id_usuario: c.id_usuario,
      // Solo nombre + inicial del apellido, para no exponer el nombre completo públicamente.
      autor: inicialApellido ? `${c.usuario.nombre} ${inicialApellido}.` : c.usuario.nombre,
      calificacion: c.calificacion,
      texto: c.texto,
      fecha: c.fecha,
    };
  }

  async obtenerPorProducto(id_producto: number): Promise<ComentariosProductoDTO> {
    if (!(await this.comentarioRepo.existeProducto(id_producto))) {
      throw new HttpError(404, 'Producto no encontrado');
    }

    const filas = await this.comentarioRepo.obtenerPorProducto(id_producto);
    const cantidad = filas.length;
    const suma = filas.reduce((acc, c) => acc + c.calificacion, 0);

    return {
      promedio: cantidad > 0 ? Math.round((suma / cantidad) * 10) / 10 : 0,
      cantidad,
      comentarios: filas.map((c) => this.mapear(c)),
    };
  }

  async crear(
    id_producto: number,
    id_usuario: number,
    data: Partial<CrearComentarioDTO> | undefined
  ): Promise<ComentarioDTO> {
    const calificacion = Number(data?.calificacion);
    if (!Number.isInteger(calificacion) || calificacion < 1 || calificacion > 5) {
      throw new HttpError(400, 'La calificación debe ser un número entero de 1 a 5');
    }

    const texto = typeof data?.texto === 'string' ? data.texto.trim() : '';
    if (!texto) {
      throw new HttpError(400, 'El comentario no puede estar vacío');
    }
    if (texto.length > MAX_LARGO_COMENTARIO) {
      throw new HttpError(400, `El comentario puede tener hasta ${MAX_LARGO_COMENTARIO} caracteres`);
    }

    if (!(await this.comentarioRepo.existeProducto(id_producto))) {
      throw new HttpError(404, 'Producto no encontrado');
    }
    if (await this.comentarioRepo.obtenerDelUsuario(id_producto, id_usuario)) {
      throw new HttpError(409, 'Ya comentaste este producto');
    }

    const creado = await this.comentarioRepo.crear({ id_producto, id_usuario, calificacion, texto });
    return this.mapear(creado);
  }
}
