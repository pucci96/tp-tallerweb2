export interface Subcategoria {
  id: number;
  nombre: string;
  id_categoria?: number;
}

export interface Categoria {
  id: number;
  nombre: string;
  subcategorias?: Subcategoria[];
}

