/** Card de producto: mismo contrato que ProductoCardDTO del backend (GET /productos). */
export interface Product {
  id: number;
  categoryId: number;
  category: string;
  imageUrl: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  destacado: boolean;
}

/** Producto con todos los campos, como lo devuelve /productos/admin/... */
export interface ProductoAdmin {
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

/** Par nombre/descripción (especificaciones y estilos del producto). */
export interface ProductoAtributo {
  nombre: string;
  descripcion: string;
}

/** Producto completo para la página de detalle, como lo devuelve /productos/:id */
export interface ProductoDetalle {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  categoria: { id: number; nombre: string };
  subcategoria: { id: number; nombre: string };
  especificaciones: ProductoAtributo[];
  estilos: ProductoAtributo[];
}

/** Un comentario de un producto, como lo devuelve /productos/:id/comentarios */
export interface Comentario {
  id: number;
  id_usuario: number;
  autor: string;        // "Juan P."
  calificacion: number; // 1 a 5
  texto: string;
  fecha: string;        // fecha ISO (JSON)
}

/** Comentarios de un producto con el resumen de su calificación. */
export interface ComentariosProducto {
  promedio: number; // 0 si no tiene comentarios
  cantidad: number;
  comentarios: Comentario[];
}

/** Lo que se manda para comentar. El autor lo toma el backend del token. */
export interface NuevoComentario {
  calificacion: number;
  texto: string;
}

export interface GuardarProductoAdminDTO {
  nombre: string;
  precio: number;
  stock: number;
  id_categoria: number;
  id_subcategoria: number;
  imagen: string;
  descripcion: string;
  destacado: boolean;
}

