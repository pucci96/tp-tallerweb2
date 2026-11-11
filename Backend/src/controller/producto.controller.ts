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

  listarAdmin = async (_req: Request, res: Response) => {
    try {
      const data = await this.productoService.listarAdmin();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };

  obtenerPorId = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data = await this.productoService.obtenerPorId(id);
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };



  actualizar = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const actualizado = await this.productoService.actualizar(id, req.body);
      res.json(actualizado);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };

  eliminar = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      await this.productoService.eliminar(id);
      res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  };
}