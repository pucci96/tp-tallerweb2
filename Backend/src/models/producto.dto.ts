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