/** Producto como lo muestran el catálogo y las cards del frontend. */
export interface ProductoCardDTO {
  id: number;
  categoryId: number;
  category: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  destacado: boolean;
}

/** Producto con todos los campos, para el panel de administración. */
export interface ProductoAdminDTO {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string | null;
  destacado: boolean;
  id_categoria: number;
  categoriaNombre: string;
  id_subcategoria: number;
  subcategoriaNombre: string;
  descripcion: string;
}

/** Par nombre/descripción (especificaciones del producto). */
export interface ProductoAtributoDTO {
  nombre: string;
  descripcion: string;
}

/** Producto completo para la página pública de detalle. */
export interface ProductoDetalleDTO {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  categoria: { id: number; nombre: string };
  subcategoria: { id: number; nombre: string };
  especificaciones: ProductoAtributoDTO[];
}

/** Datos para crear o actualizar un producto (formulario de admin). */
export interface GuardarProductoDTO {
  nombre: string;
  precio: number;
  stock: number;
  id_categoria: number;
  id_subcategoria: number;
  imagen?: string;
  destacado?: boolean;
  descripcion?: string;
}
