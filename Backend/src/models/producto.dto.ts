export interface ProductoCardDTO {
  id: number;
  categoryId: number;
  category: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface CrearProductoDTO {
  nombre: string;
  precio: number;
  stock: number;
  id_categoria: number;
  id_subcategoria?: number;
  imagen?: string;
  descripcion?: string;
  destacado?: boolean;
}

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