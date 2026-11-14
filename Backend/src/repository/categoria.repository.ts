import { prisma } from '../config/prisma';
import { CrearCategoriaDTO, CrearSubcategoriaDTO } from '../models/categoria.dto';

export class CategoriaRepository {
  async obtenerCategorias() {
    return prisma.categoria.findMany({ orderBy: { id: 'asc' } });
  }

  async obtenerCategoriaPorId(id: number) {
    return prisma.categoria.findUnique({ where: { id } });
  }

  async obtenerSubcategorias() {
    return prisma.subcategoria.findMany({ orderBy: { id: 'asc' } });
  }

  async crearCategoria(data: CrearCategoriaDTO) {
    return prisma.categoria.create({
      data: { nombre: data.nombre, imagen: data.imagen ?? '' },
    });
  }

  async crearSubcategoria(data: CrearSubcategoriaDTO) {
    return prisma.subcategoria.create({
      data: { nombre: data.nombre, id_categoria: data.id_categoria },
    });
  }
}
