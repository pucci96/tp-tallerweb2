import { ProductoRepository } from '../repository/producto.repository';
import { ProductoCardDTO, CrearProductoDTO, GuardarProductoDTO,ProductoAdminDTO } from '../models/producto.dto';



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

  private formatearAdminDTO(p: any): ProductoAdminDTO {
    return {
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      stock: p.stock,
      imagen: p.imagen,
      destacado: p.destacado,
      id_categoria: p.id_categoria,
      categoriaNombre: p.categoria?.nombre || 'General',
      id_subcategoria: p.id_subcategoria,
      subcategoriaNombre: p.subcategoria?.nombre || 'General',
      descripcion: p.detalle?.[0]?.descripcion || ''
    };
  }

  async listarAdmin(): Promise<ProductoAdminDTO[]> {
    const lista = await this.productoRepo.obtenerTodos();
    return lista.map(p => this.formatearAdminDTO(p));
  }

  async obtenerPorId(id: number): Promise<ProductoAdminDTO> {
    const p = await this.productoRepo.obtenerPorId(id);
    if (!p) throw new Error('Producto no encontrado');
    return this.formatearAdminDTO(p);
  }

  async crear(dto: GuardarProductoDTO) {
    if (!dto.nombre || dto.nombre.trim().length === 0) throw new Error('El nombre es obligatorio');
    if (dto.precio <= 0) throw new Error('El precio debe ser mayor a 0');
    if (dto.stock < 0) throw new Error('El stock no puede ser negativo');
    if (!dto.id_categoria) throw new Error('Debe seleccionar una categoría');
    if (!dto.id_subcategoria) throw new Error('Debe seleccionar una subcategoría');

    return this.productoRepo.crear(dto);
  }

  async actualizar(id: number, dto: GuardarProductoDTO) {
    if (dto.precio <= 0) throw new Error('El precio debe ser mayor a 0');
    if (dto.stock < 0) throw new Error('El stock no puede ser negativo');

    return this.productoRepo.actualizar(id, dto);
  }

  async eliminar(id: number) {
    return this.productoRepo.eliminar(id);
  }
}