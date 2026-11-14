import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { GuardarProductoDTO } from '../models/producto.dto';

const incluirRelaciones = {
  categoria: true,
  subcategoria: true,
  detalle: { orderBy: { id: 'asc' } },
} satisfies Prisma.ProductoInclude;

export type ProductoConRelaciones = Prisma.ProductoGetPayload<{ include: typeof incluirRelaciones }>;

export class ProductoRepository {
  async obtenerDestacados() {
    return prisma.producto.findMany({
      where: { destacado: true },
      include: incluirRelaciones,
      orderBy: { id: 'asc' },
    });
  }

  async obtenerTodos() {
    return prisma.producto.findMany({
      include: incluirRelaciones,
      orderBy: { id: 'asc' },
    });
  }

  async obtenerPorId(id: number) {
    return prisma.producto.findUnique({
      where: { id },
      include: incluirRelaciones,
    });
  }

  async obtenerSubcategoria(id: number) {
    return prisma.subcategoria.findUnique({ where: { id } });
  }

  async crear(data: GuardarProductoDTO) {
    return prisma.producto.create({
      data: {
        nombre: data.nombre,
        precio: data.precio,
        stock: data.stock,
        id_categoria: data.id_categoria,
        id_subcategoria: data.id_subcategoria,
        imagen: data.imagen,
        destacado: Boolean(data.destacado),
        // La descripción se guarda como primer registro de Producto_detalles
        detalle: {
          create: [{ nombre: 'Descripción', descripcion: data.descripcion ?? 'Sin descripción' }],
        },
      },
      include: incluirRelaciones,
    });
  }

  async actualizar(id: number, data: GuardarProductoDTO) {
    const detalleExistente = await prisma.producto_detalles.findFirst({
      where: { id_producto: id },
      orderBy: { id: 'asc' },
    });

    return prisma.producto.update({
      where: { id },
      data: {
        nombre: data.nombre,
        precio: data.precio,
        stock: data.stock,
        id_categoria: data.id_categoria,
        id_subcategoria: data.id_subcategoria,
        imagen: data.imagen,
        destacado: Boolean(data.destacado),
        detalle: detalleExistente
          ? {
              update: {
                where: { id: detalleExistente.id },
                data: { descripcion: data.descripcion ?? 'Sin descripción' },
              },
            }
          : {
              create: [{ nombre: 'Descripción', descripcion: data.descripcion ?? 'Sin descripción' }],
            },
      },
      include: incluirRelaciones,
    });
  }

  async eliminar(id: number) {
    // Se borran primero los registros dependientes (el schema no tiene onDelete: Cascade).
    // Los pedidos guardan una copia del nombre/precio, así que no se ven afectados.
    return prisma.$transaction([
      prisma.producto_detalles.deleteMany({ where: { id_producto: id } }),
      prisma.producto_estilo.deleteMany({ where: { id_producto: id } }),
      prisma.producto.delete({ where: { id } }),
    ]);
  }
}
