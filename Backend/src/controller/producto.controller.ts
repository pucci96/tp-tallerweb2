import { Request, Response } from 'express';
import { ProductoService } from '../service/producto.service';

export class ProductoController {
  private productoService = new ProductoService();

  obtenerDestacados = async (_req: Request, res: Response) => {
    try {
      const productos = await this.productoService.obtenerDestacados();
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener productos destacados:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };

  obtenerCatalogo = async (_req: Request, res: Response) => {
    try {
      const productos = await this.productoService.obtenerCatalogo();
      res.json(productos);
    } catch (error) {
      console.error('Error al obtener catálogo:', error);
      res.status(500).json({ error: 'Error al obtener productos' });
    }
  };

  crearProducto = async (req: Request, res: Response) => {
    try {
      const nuevoProducto = await this.productoService.crearProducto(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error: any) {
      console.error('Error al crear producto:', error);
      res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
    }
  };
}