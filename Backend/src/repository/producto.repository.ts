import { prisma } from '../config/prisma';
import { CrearProductoDTO } from '../models/producto.dto';

export class ProductoRepository {
  async obtenerDestacados() {
    return prisma.producto.findMany({
      where: { destacado: true },
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      }
    });
  }

  async obtenerTodos() {
    return prisma.producto.findMany({
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      },
      orderBy: { id: 'asc' }
    });
  }

  async crear(data: CrearProductoDTO) {
  return prisma.producto.create({
    data: {
      nombre: data.nombre,
      precio: Number(data.precio),
      stock: Number(data.stock) || 0,
      id_categoria: Number(data.id_categoria),
      id_subcategoria: Number(data.id_subcategoria || 1),
      imagen: data.imagen || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
      destacado: Boolean(data.destacado),
      detalle: {
        create: [
          {
            nombre: 'Descripción general', // <-- Campo obligatorio según tu schema
            descripcion: data.descripcion || 'Sin descripción'
          }
        ]
      }
    },
    include: {
      detalle: true,
      categoria: true,
      subcategoria: true
    }
  });
}
}