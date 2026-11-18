import { Request, Response } from 'express';
import { ComentarioService } from '../service/comentario.service';
import { usuarioDelToken } from '../middleware/auth.middleware';
import { parseId } from '../utils/http-error';

// Los errores lanzados acá (o en el service) los maneja error.middleware.ts.
export class ComentarioController {
  private comentarioService = new ComentarioService();

  /** Público: comentarios del producto + promedio y cantidad. */
  obtenerPorProducto = async (req: Request, res: Response) => {
    const id = parseId(req.params['id'], 'id de producto');
    res.json(await this.comentarioService.obtenerPorProducto(id));
  };

  /** Requiere sesión: el autor se toma del token, nunca del body. */
  crear = async (req: Request, res: Response) => {
    const id = parseId(req.params['id'], 'id de producto');
    const { id_usuario } = usuarioDelToken(req);
    res.status(201).json(await this.comentarioService.crear(id, id_usuario, req.body));
  };
}
