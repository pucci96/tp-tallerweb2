export interface PedidoDTO {
    id: number;
    fecha: Date;
    estado: string;
    productos?: PedidoProductoDTO[];
}

export interface PedidoProductoDTO {
    id: number;
    id_pedido: number;
    producto: string;
    categoria: string;
    subcategoria: string;
    precio: number;

}

export interface CrearPedidoDTO {
   estado?: string;

}

export interface CrearPedidoProductoDTO {
   id_pedido: number;
    producto: string;
    categoria: string;
    subcategoria: string;
    precio: number;
}