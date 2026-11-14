import { Request, Response } from 'express';
import { CategoriaService } from '../service/categoria.service';

// Los errores lanzados acá (o en el service) los maneja error.middleware.ts.
export class CategoriaController {
  private categoriaService = new CategoriaService();

  obtenerCategorias = async (_req: Request, res: Response) => {
    res.json(await this.categoriaService.obtenerCategorias());
  };

  obtenerSubcategorias = async (_req: Request, res: Response) => {
    res.json(await this.categoriaService.obtenerSubcategorias());
  };

  crearCategoria = async (req: Request, res: Response) => {
    res.status(201).json(await this.categoriaService.crearCategoria(req.body));
  };

  crearSubcategoria = async (req: Request, res: Response) => {
    res.status(201).json(await this.categoriaService.crearSubcategoria(req.body));
  };
}
