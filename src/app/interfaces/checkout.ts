export interface DatosEnvio {
  nombre: string;
  apellido: string;
  email: string;
  direccion: string;
  ciudad: string;
  codigoPostal: string;
}

export interface LineaCheckout {
  nombre: string;
  precio: number;
  cantidad: number;
  subtotal: number;
  /** Imagen del catálogo; vacía si no se pudo resolver. */
  imagen: string;
}

/** Totales y líneas que muestran el resumen de compra y el comprobante. */
export interface ResumenCompra {
  lineas: LineaCheckout[];
  cantidadTotal: number;
  total: number;
}

/** Vista resumida del pedido en estado "carrito" para las pantallas de checkout. */
export interface CarritoCheckout extends ResumenCompra {
  idPedido: number;
}

export interface MedioPago {
  marca: string;
  ultimos4: string;
}

export interface PedidoConfirmado extends ResumenCompra {
  numeroPedido: string;
  envio: DatosEnvio;
  fecha: Date;
  pago: MedioPago;
}

