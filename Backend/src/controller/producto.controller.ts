import { Request, Response } from 'express';
import { ProductoService } from '../service/producto.service';
import { parseId } from '../utils/http-error';

// Los errores lanzados acá (o en el service) los maneja error.middleware.ts.
export class ProductoController {
  private productoService = new ProductoService();

  obtenerDestacados = async (_req: Request, res: Response) => {
    res.json(await this.productoService.obtenerDestacados());
  };

  obtenerCatalogo = async (_req: Request, res: Response) => {
    res.json(await this.productoService.obtenerCatalogo());
  };

  listarAdmin = async (_req: Request, res: Response) => {
    res.json(await this.productoService.listarAdmin());
  };

  obtenerPorId = async (req: Request, res: Response) => {
    const id = parseId(req.params['id'], 'id de producto');
    res.json(await this.productoService.obtenerPorId(id));
  };

  crear = async (req: Request, res: Response) => {
    const nuevo = await this.productoService.crear(req.body);
    res.status(201).json(nuevo);
  };

  actualizar = async (req: Request, res: Response) => {
    const id = parseId(req.params['id'], 'id de producto');
    res.json(await this.productoService.actualizar(id, req.body));
  };

  eliminar = async (req: Request, res: Response) => {
    const id = parseId(req.params['id'], 'id de producto');
    await this.productoService.eliminar(id);
    res.json({ mensaje: 'Producto eliminado correctamente' });
  };
}
