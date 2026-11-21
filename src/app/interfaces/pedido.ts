export interface ProductoParaCarrito {
  id: number;
  nombre: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  imageUrl: string;
}

export interface PedidoProductoDTO {
  id: number;
  id_pedido: number;
  id_producto?: number;
  producto: string;
  categoria: string;
  subcategoria: string;
  precio: number;
  cantidad: number;
  subtotal: number;
}

/** Item del carrito en la vista: el item del pedido más la imagen tomada del catálogo. */
export interface PedidoProductoConImagen extends PedidoProductoDTO {
  imageUrl?: string;
}

export interface PedidoDTO {
  id: number;
  id_usuario: number;
  fecha: Date | string;
  estado: string;
  total: number;
  productos: PedidoProductoDTO[];
}

/** Pedido con sus items enriquecidos con imagen (vista del carrito). */
export interface PedidoConImagenes extends Omit<PedidoDTO, 'productos'> {
  productos: PedidoProductoConImagen[];
}

export interface CrearPedidoDTO {
  estado?: string;
}

export interface AgregarProductoDTO {
  id_producto: number;
  cantidad?: number;
}

