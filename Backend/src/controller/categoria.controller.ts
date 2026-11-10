import { Request, Response } from 'express';
import { CategoriaService } from '../service/categoria.service';

export class CategoriaController {
    private categoriaService = new CategoriaService();

    obtenerCategorias = async (_req: Request, res: Response) => {
        try {
            const categorias = await this.categoriaService.obtenerCategorias();
            res.json(categorias);
        } catch (error) {
            console.error('Error al obtener categorías:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    obtenerSubcategorias = async (_req: Request, res: Response) => {
        try {
            const subcategorias = await this.categoriaService.obtenerSubcategorias();
            res.json(subcategorias);
        } catch (error) {
            console.error('Error al obtener subcategorías:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    crearCategoria = async (req: Request, res: Response) => {
        try {
            const nuevaCategoria = await this.categoriaService.crearCategoria(req.body);
            res.status(201).json(nuevaCategoria);
        } catch (error: any) {
            console.error('Error al crear categoría:', error);
            res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
        }
    };

    crearSubcategoria = async (req: Request, res: Response) => {
        try {
            const nuevaSubcategoria = await this.categoriaService.crearSubcategoria(req.body);
            res.status(201).json(nuevaSubcategoria);
        } catch (error: any) {
            console.error('Error al crear subcategoría:', error);
            res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
        }
    };
}