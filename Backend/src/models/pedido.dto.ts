export interface PedidoProductoDTO {
  id: number;
  id_pedido: number;
  producto: string;
  categoria: string;
  subcategoria: string;
  precio: number;   // precio unitario al momento de agregarlo
  cantidad: number;
  subtotal: number; // precio * cantidad
}

export interface PedidoDTO {
  id: number;
  id_usuario: number;
  fecha: Date;
  estado: string;
  total: number;
  productos: PedidoProductoDTO[];
}

export interface CrearPedidoDTO {
  estado?: string;
}

/** Lo que manda el cliente para agregar un producto: el precio lo pone el servidor. */
export interface AgregarProductoDTO {
  id_producto: number;
  cantidad?: number;
}
