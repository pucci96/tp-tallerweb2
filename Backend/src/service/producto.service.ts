import { ProductoRepository } from '../repository/producto.repository';
import { ProductoCardDTO, CrearProductoDTO } from '../models/producto.dto';

export class ProductoService {
  private productoRepo = new ProductoRepository();

  private mapearACardDTO(producto: any): ProductoCardDTO {
    return {
      id: producto.id,
      categoryId: producto.categoria?.id || producto.categoriaId || producto.id_categoria,
      category: producto.subcategoria?.nombre || producto.categoria?.nombre || 'General',
      title: producto.nombre,
      description: producto.detalle?.[0]?.descripcion || 'Sin descripción',
      price: Number(producto.precio),
      imageUrl: producto.imagen || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'
    };
  }

  async obtenerDestacados(): Promise<ProductoCardDTO[]> {
    const productos = await this.productoRepo.obtenerDestacados();
    return productos.map(p => this.mapearACardDTO(p));
  }

  async obtenerCatalogo(): Promise<ProductoCardDTO[]> {
    const productos = await this.productoRepo.obtenerTodos();
    return productos.map(p => this.mapearACardDTO(p));
  }

  async crearProducto(dto: CrearProductoDTO) {
    if (dto.precio <= 0) {
      throw new Error('El precio debe ser mayor a 0');
    }
    if (dto.stock < 0) {
      throw new Error('El stock no puede ser negativo');
    }
    return this.productoRepo.crear(dto);
  }
}