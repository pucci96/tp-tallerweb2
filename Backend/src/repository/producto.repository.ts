import { prisma } from '../config/prisma';
import { CrearProductoDTO } from '../models/producto.dto';
import { GuardarProductoDTO } from '../models/producto.dto';

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

  async obtenerPorId(id: number) {
    return prisma.producto.findUnique({
      where: { id },
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      }
    });
  }

 async crear(data: CrearProductoDTO) {
    return prisma.producto.create({
      data: {
        nombre: data.nombre,
        precio: Number(data.precio),
        stock: Number(data.stock),
        id_categoria: Number(data.id_categoria),
        id_subcategoria: Number(data.id_subcategoria),
        imagen: data.imagen || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
        destacado: Boolean(data.destacado),
        detalle: {
          create: [
            {
              nombre: 'Detalle técnico',
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
    })}

  async actualizar(id: number, data: CrearProductoDTO) {
    const productoExistente = await prisma.producto.findUnique({
      where: { id },
      include: { detalle: true }
    });

    const detalleId = productoExistente?.detalle?.[0]?.id;

    return prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        precio: Number(data.precio),
        stock: Number(data.stock) || 0,
        id_categoria: Number(data.id_categoria),
        id_subcategoria: Number(data.id_subcategoria || 1),
        imagen: data.imagen,
        destacado: Boolean(data.destacado),
        detalle: detalleId ? {
          update: {
            where: { id: detalleId },
            data: {
              descripcion: data.descripcion || 'Sin descripción'
            }
          }
        } : {
          create: [
            {
              nombre: 'Descripción general',
              descripcion: data.descripcion || 'Sin descripción'
            }
          ]
        }
      },
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      }
    });
  }

  async eliminar(id: number) {
    // Si tu schema no tiene onDelete: Cascade, borramos los detalles vinculados
    await prisma.producto_detalles.deleteMany({
      where: { producto: { id } }
    });

    return prisma.producto.delete({
      where: { id }
    });
  }
}