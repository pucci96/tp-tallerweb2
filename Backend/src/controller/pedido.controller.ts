import { Request, Response } from 'express';
import { PedidoService } from '../service/pedido.service';

export class PedidoController {
    private pedidoService = new PedidoService();

    obtenerPedidosDelUsuario = async (req: Request, res: Response) => {
        try {
            //  agregar el "as string" o el signo "!" para asegurar que es un string
            const idUsuario = parseInt(req.params.idUsuario as string, 10);
            const pedidos = await this.pedidoService.obtenerPedidosDelUsuario(idUsuario);
            res.json(pedidos);
        } catch (error) {
            console.error('Error al obtener pedidos del usuario:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    obtenerProductosDelPedido = async (req: Request, res: Response) => {
        try {
            // verificar que req.params.idPedido se trate como string
            const idPedido = parseInt(req.params.idPedido as string, 10);
            const productos = await this.pedidoService.obtenerProductosDelPedido(idPedido);
            res.json(productos);
        } catch (error) {
            console.error('Error al obtener productos del pedido:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    };

    crearPedido = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const nuevoPedido = await this.pedidoService.crearPedido(data);
            res.status(201).json(nuevoPedido);
        } catch (error: any) {
            console.error('Error al crear pedido:', error);
            res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
        }
    };

    crearPedidoProducto = async (req: Request, res: Response) => {
        try {
            const data = req.body;
            const nuevoPedidoProducto = await this.pedidoService.crearPedidoProducto(data);
            res.status(201).json(nuevoPedidoProducto);
        } catch (error: any) {
            console.error('Error al crear producto del pedido:', error);
            res.status(400).json({ error: error.message || 'Error al procesar la solicitud' });
        }
    };

}