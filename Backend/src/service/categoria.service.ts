import { CategoriaRepository } from '../repository/categoria.repository';
import { CategoriaDTO, CrearCategoriaDTO, SubcategoriaDTO, CrearSubcategoriaDTO } from '../models/categoria.dto';

export class CategoriaService {
    private categoriaRepo = new CategoriaRepository();

    async obtenerCategorias(): Promise<CategoriaDTO[]> {
        return this.categoriaRepo.obtenerCategorias();
    }

    async obtenerSubcategorias(): Promise<SubcategoriaDTO[]> {
        return this.categoriaRepo.obtenerSubcategorias();
    }

    async crearCategoria(data: CrearCategoriaDTO): Promise<CategoriaDTO> {
        return this.categoriaRepo.crearCategoria(data);
    }

    async crearSubcategoria(data: CrearSubcategoriaDTO): Promise<SubcategoriaDTO> {
        return this.categoriaRepo.crearSubcategoria(data);
    }
}