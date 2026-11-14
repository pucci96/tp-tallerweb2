import { ProductoRepository, ProductoConRelaciones } from '../repository/producto.repository';
import { ProductoCardDTO, GuardarProductoDTO, ProductoAdminDTO } from '../models/producto.dto';
import { HttpError } from '../utils/http-error';

export const IMAGEN_POR_DEFECTO =
  'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80';

export class ProductoService {
  private productoRepo = new ProductoRepository();

  private mapearACardDTO(producto: ProductoConRelaciones): ProductoCardDTO {
    return {
      id: producto.id,
      categoryId: producto.id_categoria,
      category: producto.subcategoria?.nombre || producto.categoria?.nombre || 'General',
      title: producto.nombre,
      description: producto.detalle?.[0]?.descripcion || 'Sin descripción',
      price: Number(producto.precio),
      imageUrl: producto.imagen || IMAGEN_POR_DEFECTO,
      stock: producto.stock,
      destacado: producto.destacado,
    };
  }

  private formatearAdminDTO(p: ProductoConRelaciones): ProductoAdminDTO {
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
      descripcion: p.detalle?.[0]?.descripcion || '',
    };
  }

  /**
   * Valida y normaliza lo que llega del formulario de admin.
   * Rechaza valores no numéricos (antes llegaban como NaN a la base).
   */
  private validar(dto: Partial<GuardarProductoDTO> | undefined): GuardarProductoDTO {
    if (!dto || typeof dto !== 'object') {
      throw new HttpError(400, 'Faltan los datos del producto');
    }
    const nombre = typeof dto.nombre === 'string' ? dto.nombre.trim() : '';
    if (nombre.length === 0) throw new HttpError(400, 'El nombre es obligatorio');

    const precio = Number(dto.precio);
    if (!Number.isFinite(precio) || precio <= 0) throw new HttpError(400, 'El precio debe ser un número mayor a 0');

    const stock = Number(dto.stock ?? 0);
    if (!Number.isInteger(stock) || stock < 0) throw new HttpError(400, 'El stock debe ser un número entero mayor o igual a 0');

    const id_categoria = Number(dto.id_categoria);
    if (!Number.isInteger(id_categoria) || id_categoria <= 0) throw new HttpError(400, 'Debe seleccionar una categoría');

    const id_subcategoria = Number(dto.id_subcategoria);
    if (!Number.isInteger(id_subcategoria) || id_subcategoria <= 0) throw new HttpError(400, 'Debe seleccionar una subcategoría');

    return {
      nombre,
      precio,
      stock,
      id_categoria,
      id_subcategoria,
      imagen: typeof dto.imagen === 'string' && dto.imagen.trim() ? dto.imagen.trim() : IMAGEN_POR_DEFECTO,
      descripcion: typeof dto.descripcion === 'string' && dto.descripcion.trim() ? dto.descripcion.trim() : 'Sin descripción',
      destacado: Boolean(dto.destacado),
    };
  }

  /** La subcategoría elegida tiene que pertenecer a la categoría elegida. */
  private async validarClasificacion(dto: GuardarProductoDTO): Promise<void> {
    const subcategoria = await this.productoRepo.obtenerSubcategoria(dto.id_subcategoria);
    if (!subcategoria) throw new HttpError(400, 'La subcategoría no existe');
    if (subcategoria.id_categoria !== dto.id_categoria) {
      throw new HttpError(400, 'La subcategoría no pertenece a la categoría seleccionada');
    }
  }

  async obtenerDestacados(): Promise<ProductoCardDTO[]> {
    const productos = await this.productoRepo.obtenerDestacados();
    return productos.map((p) => this.mapearACardDTO(p));
  }

  async obtenerCatalogo(): Promise<ProductoCardDTO[]> {
    const productos = await this.productoRepo.obtenerTodos();
    return productos.map((p) => this.mapearACardDTO(p));
  }

  async listarAdmin(): Promise<ProductoAdminDTO[]> {
    const lista = await this.productoRepo.obtenerTodos();
    return lista.map((p) => this.formatearAdminDTO(p));
  }

  async obtenerPorId(id: number): Promise<ProductoAdminDTO> {
    const p = await this.productoRepo.obtenerPorId(id);
    if (!p) throw new HttpError(404, 'Producto no encontrado');
    return this.formatearAdminDTO(p);
  }

  async crear(body: Partial<GuardarProductoDTO>): Promise<ProductoAdminDTO> {
    const dto = this.validar(body);
    await this.validarClasificacion(dto);
    return this.formatearAdminDTO(await this.productoRepo.crear(dto));
  }

  async actualizar(id: number, body: Partial<GuardarProductoDTO>): Promise<ProductoAdminDTO> {
    if (!(await this.productoRepo.obtenerPorId(id))) throw new HttpError(404, 'Producto no encontrado');
    const dto = this.validar(body);
    await this.validarClasificacion(dto);
    return this.formatearAdminDTO(await this.productoRepo.actualizar(id, dto));
  }

  async eliminar(id: number): Promise<void> {
    if (!(await this.productoRepo.obtenerPorId(id))) throw new HttpError(404, 'Producto no encontrado');
    await this.productoRepo.eliminar(id);
  }
}
