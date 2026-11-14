import { CategoriaRepository } from '../repository/categoria.repository';
import { CategoriaDTO, CrearCategoriaDTO, SubcategoriaDTO, CrearSubcategoriaDTO } from '../models/categoria.dto';
import { HttpError } from '../utils/http-error';

export class CategoriaService {
  private categoriaRepo = new CategoriaRepository();

  async obtenerCategorias(): Promise<CategoriaDTO[]> {
    return this.categoriaRepo.obtenerCategorias();
  }

  async obtenerSubcategorias(): Promise<SubcategoriaDTO[]> {
    return this.categoriaRepo.obtenerSubcategorias();
  }

  async crearCategoria(data: Partial<CrearCategoriaDTO>): Promise<CategoriaDTO> {
    const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';
    if (!nombre) throw new HttpError(400, 'El nombre de la categoría es obligatorio');
    // Si el nombre ya existe, el middleware de errores responde 409 (P2002).
    return this.categoriaRepo.crearCategoria({ nombre, imagen: data.imagen });
  }

  async crearSubcategoria(data: Partial<CrearSubcategoriaDTO>): Promise<SubcategoriaDTO> {
    const nombre = typeof data?.nombre === 'string' ? data.nombre.trim() : '';
    if (!nombre) throw new HttpError(400, 'El nombre de la subcategoría es obligatorio');

    const id_categoria = Number(data?.id_categoria);
    if (!Number.isInteger(id_categoria) || !(await this.categoriaRepo.obtenerCategoriaPorId(id_categoria))) {
      throw new HttpError(400, 'La categoría indicada no existe');
    }
    return this.categoriaRepo.crearSubcategoria({ nombre, id_categoria });
  }
}
