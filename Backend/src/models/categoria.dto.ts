export interface CategoriaDTO {
  id: number;
  nombre: string;
  imagen: string;
}

export interface CrearCategoriaDTO {
  nombre: string;
  imagen?: string;
}

export interface SubcategoriaDTO {
  id: number;
  id_categoria: number;
  nombre: string;
}

export interface CrearSubcategoriaDTO {
  id_categoria: number;
  nombre: string;
}
