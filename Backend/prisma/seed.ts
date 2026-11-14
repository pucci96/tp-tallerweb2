/**
 * Datos iniciales para desarrollo:  npm run db:seed
 * Es idempotente: se puede correr varias veces sin duplicar datos.
 */
import bcrypt from 'bcryptjs';
import { prisma } from '../src/config/prisma';

const IMG = {
  placaVideo: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
  monitor: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',
  pc: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
  teclado: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80',
  mouse: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw9swQTsx0q4Yw4WnYRXT14-j3p4dG7Bdm61452pWbEe6gCteO7AZUeeaGSeX_ftcVLSau2x8lsm5B359_-xdcNu5uM6iQzkYgnEA-Wg08hH4R2kH-5GbpdraWgL3zteT90YPx6FzkAdcQxVLFAP1smJnPxYdIxbKTi5HqnhB4TuW_-1zbP2TCth0XiID2cnwEEa9sghUME_rgi6zACuz8NLU794OhhKNGTLD3YsM',
  auriculares: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwfA84ZW77v0kLbaL8Gcu357ag-NHYQ1dX_dJVgM5d29VM_6aUHMIL32pjn1-9P_wzEJmWXZ0sTaPJ0uz4aG-kTO2YVCEkUZx5bUoMKhSPdqmjzUIhGjk6rJjwskCEDtdeJqAg9fv1Wr-YS0ejOTKLqx9PVbjVVk9LTjIzDGa5wjbglh7dxHFHUjJKBYfmmH2hX4Nzc1wvunw82c7slQCE6BxPmKw5l59rA-0ehrE',
};

const CATEGORIAS: Record<string, string[]> = {
  Componentes: ['Placas de video', 'Procesadores', 'Memorias RAM'],
  'Periféricos': ['Teclados', 'Mouses', 'Auriculares'],
  Monitores: ['Gaming', 'Oficina'],
};

const PRODUCTOS = [
  { nombre: 'Placa de Video RTX 4070 Super 12GB', sub: 'Placas de video', precio: 899999, stock: 8, imagen: IMG.placaVideo, destacado: true,
    descripcion: 'Arquitectura Ada Lovelace, DLSS 3 y ray tracing para jugar en 1440p a altos FPS.' },
  { nombre: 'Placa de Video RX 7600 8GB', sub: 'Placas de video', precio: 419999, stock: 12, imagen: IMG.placaVideo, destacado: false,
    descripcion: 'Rendimiento sólido en 1080p con bajo consumo energético.' },
  { nombre: 'Procesador Ryzen 7 7800X3D', sub: 'Procesadores', precio: 629999, stock: 5, imagen: IMG.pc, destacado: true,
    descripcion: '8 núcleos y 16 hilos con tecnología 3D V-Cache, ideal para gaming.' },
  { nombre: 'Memoria RAM DDR5 32GB (2x16) 6000MHz', sub: 'Memorias RAM', precio: 154999, stock: 20, imagen: IMG.pc, destacado: false,
    descripcion: 'Kit dual channel de baja latencia con disipador de aluminio.' },
  { nombre: 'Teclado Mecánico RGB Switch Red TKL', sub: 'Teclados', precio: 94500, stock: 14, imagen: IMG.teclado, destacado: true,
    descripcion: 'Formato TKL 80%, switches lineales hot-swap y keycaps PBT doble inyección.' },
  { nombre: 'Mouse Gamer Inalámbrico 26K DPI', sub: 'Mouses', precio: 48900, stock: 25, imagen: IMG.mouse, destacado: false,
    descripcion: 'Sensor óptico de 26.000 DPI, 63 g de peso y hasta 70 horas de batería.' },
  { nombre: 'Auriculares Pro 7.1 Wireless', sub: 'Auriculares', precio: 119999, stock: 2, imagen: IMG.auriculares, destacado: true,
    descripcion: 'Sonido envolvente 7.1, micrófono desmontable y conexión inalámbrica de baja latencia.' },
  { nombre: 'Monitor Gamer 27" 180Hz IPS', sub: 'Gaming', precio: 389999, stock: 7, imagen: IMG.monitor, destacado: false,
    descripcion: 'Panel IPS QHD con 1 ms de respuesta y compatibilidad G-Sync.' },
  { nombre: 'Monitor 24" Full HD Oficina', sub: 'Oficina', precio: 179999, stock: 15, imagen: IMG.monitor, destacado: false,
    descripcion: 'Panel IPS con filtro de luz azul y base regulable en altura.' },
];

const USUARIOS = [
  { email: 'admin@tecno.com', password: 'Admin1234', rol: 'ADMIN', nombre: 'Admin', apellido: 'TecnoCommerce', direccion: 'Av. Siempre Viva 742' },
  { email: 'cliente@tecno.com', password: 'Cliente1234', rol: 'CLIENTE', nombre: 'Juan', apellido: 'Pérez', direccion: 'Av. Corrientes 1234, CABA' },
];

async function main() {
  // Roles
  const roles: Record<string, number> = {};
  for (const nombre of ['ADMIN', 'CLIENTE']) {
    const rol = await prisma.rol.upsert({ where: { nombre }, update: {}, create: { nombre } });
    roles[nombre] = rol.id;
  }

  // Usuarios (Login + Usuario)
  for (const u of USUARIOS) {
    const existe = await prisma.login.findUnique({ where: { email: u.email } });
    if (!existe) {
      await prisma.login.create({
        data: {
          email: u.email,
          password: await bcrypt.hash(u.password, 10),
          id_rol: roles[u.rol]!,
          usuario: { create: { nombre: u.nombre, apellido: u.apellido, direccion: u.direccion } },
        },
      });
    }
  }

  // Categorías y subcategorías
  const subcategorias: Record<string, { id: number; id_categoria: number }> = {};
  for (const [nombreCat, subs] of Object.entries(CATEGORIAS)) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre: nombreCat },
      update: {},
      create: { nombre: nombreCat, imagen: '' },
    });
    for (const nombreSub of subs) {
      const sub =
        (await prisma.subcategoria.findFirst({ where: { nombre: nombreSub, id_categoria: categoria.id } })) ??
        (await prisma.subcategoria.create({ data: { nombre: nombreSub, id_categoria: categoria.id } }));
      subcategorias[nombreSub] = { id: sub.id, id_categoria: categoria.id };
    }
  }

  // Productos
  for (const p of PRODUCTOS) {
    if (await prisma.producto.findFirst({ where: { nombre: p.nombre } })) continue;
    const sub = subcategorias[p.sub]!;
    await prisma.producto.create({
      data: {
        nombre: p.nombre,
        precio: p.precio,
        stock: p.stock,
        imagen: p.imagen,
        destacado: p.destacado,
        id_categoria: sub.id_categoria,
        id_subcategoria: sub.id,
        detalle: { create: [{ nombre: 'Descripción', descripcion: p.descripcion }] },
      },
    });
  }

  console.log('Seed completado:');
  console.log(`  ${Object.keys(roles).length} roles, ${USUARIOS.length} usuarios, ${Object.keys(subcategorias).length} subcategorías, ${PRODUCTOS.length} productos`);
  console.log('  Admin:   admin@tecno.com   / Admin1234');
  console.log('  Cliente: cliente@tecno.com / Cliente1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
