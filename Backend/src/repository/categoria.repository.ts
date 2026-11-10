import { prisma } from '../config/prisma';
import { CrearCategoriaDTO } from '../models/categoria.dto';
import { CrearSubcategoriaDTO } from '../models/categoria.dto';

export class CategoriaRepository {
    async obtenerCategorias(){
        //TODO: Implementar la lógica para obtener todas las categorías
    }
    async obtenerSubcategorias(){
        //TODO: Implementar la lógica para obtener todas las categorías
    }

    async crearCategoria(data: CrearCategoriaDTO) {
        //TODO: Implementar la lógica para crear una nueva categoría
    }
    async crearSubcategoria(data: CrearSubcategoriaDTO) {
        //TODO: Implementar la lógica para crear una nueva subcategoría
    }
}