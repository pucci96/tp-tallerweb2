/**
 * Datos iniciales para desarrollo:  npm run db:seed
 *
 * Es idempotente: se puede correr varias veces sin duplicar datos.
 * Además ACTUALIZA lo que ya existe: si cambiás un precio, stock, descripción,
 * comentario o dato de usuario acá y volvés a correr el seed, se actualiza en la base.
 * (Los productos se identifican por nombre, los usuarios por email y los comentarios
 * por producto + usuario.)
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
  // Clientes extra para tener más comentarios y promedios variados (misma contraseña: Cliente1234)
  { email: 'maria@tecno.com', password: 'Cliente1234', rol: 'CLIENTE', nombre: 'María', apellido: 'González', direccion: 'Bv. San Juan 850, Córdoba' },
  { email: 'lucas@tecno.com', password: 'Cliente1234', rol: 'CLIENTE', nombre: 'Lucas', apellido: 'Fernández', direccion: 'Calle 7 N° 1120, La Plata' },
  { email: 'sofia@tecno.com', password: 'Cliente1234', rol: 'CLIENTE', nombre: 'Sofía', apellido: 'Martínez', direccion: 'Av. Pellegrini 1500, Rosario' },
];

// Comentarios de ejemplo (un usuario comenta cada producto una sola vez)
const COMENTARIOS = [
  { producto: 'Placa de Video RTX 4070 Super 12GB', email: 'cliente@tecno.com', calificacion: 5,
    texto: 'Excelente placa, corre todo en 1440p sin problemas y no levanta mucha temperatura.' },
  { producto: 'Placa de Video RTX 4070 Super 12GB', email: 'admin@tecno.com', calificacion: 4,
    texto: 'Muy buen rendimiento. Le resto una estrella por el precio.' },
  { producto: 'Procesador Ryzen 7 7800X3D', email: 'cliente@tecno.com', calificacion: 5,
    texto: 'El mejor procesador para gaming que tuve. Llegó rápido y bien embalado.' },
  { producto: 'Teclado Mecánico RGB Switch Red TKL', email: 'cliente@tecno.com', calificacion: 4,
    texto: 'Los switches son suaves y silenciosos. El software de RGB podría ser mejor.' },
  { producto: 'Teclado Mecánico RGB Switch Red TKL', email: 'admin@tecno.com', calificacion: 3,
    texto: 'Cumple, pero el cable es un poco corto para mi escritorio.' },
  { producto: 'Auriculares Pro 7.1 Wireless', email: 'cliente@tecno.com', calificacion: 5,
    texto: 'Muy cómodos para usar muchas horas y el micrófono se escucha claro.' },
];

async function main() {
  // Roles
  const roles: Record<string, number> = {};
  for (const nombre of ['ADMIN', 'CLIENTE']) {
    const rol = await prisma.rol.upsert({ where: { nombre }, update: {}, create: { nombre } });
    roles[nombre] = rol.id;
  }

  // Usuarios (Login + Usuario). Si ya existen se actualizan sus datos, su rol y su
  // contraseña, así las credenciales de prueba de este archivo siempre funcionan.
  for (const u of USUARIOS) {
    const datosPersonales = { nombre: u.nombre, apellido: u.apellido, direccion: u.direccion };
    await prisma.login.upsert({
      where: { email: u.email },
      update: {
        password: await bcrypt.hash(u.password, 10),
        id_rol: roles[u.rol]!,
        usuario: { upsert: { create: datosPersonales, update: datosPersonales } },
      },
      create: {
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        id_rol: roles[u.rol]!,
        usuario: { create: datosPersonales },
      },
    });
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

  // Productos: se crean o, si ya existen (por nombre), se actualizan
  let productosCreados = 0;
  let productosActualizados = 0;
  for (const p of PRODUCTOS) {
    const sub = subcategorias[p.sub];
    if (!sub) throw new Error(`El producto "${p.nombre}" usa la subcategoría "${p.sub}", que no existe en CATEGORIAS`);

    const datos = {
      nombre: p.nombre,
      precio: p.precio,
      stock: p.stock,
      imagen: p.imagen,
      destacado: p.destacado,
      id_categoria: sub.id_categoria,
      id_subcategoria: sub.id,
    };

    const existente = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    if (!existente) {
      await prisma.producto.create({
        data: { ...datos, detalle: { create: [{ nombre: 'Descripción', descripcion: p.descripcion }] } },
      });
      productosCreados++;
      continue;
    }

    await prisma.producto.update({ where: { id: existente.id }, data: datos });
    // La descripción es el primer registro de Producto_detalles (así lo usa el resto de la app)
    const descripcion = await prisma.producto_detalles.findFirst({
      where: { id_producto: existente.id },
      orderBy: { id: 'asc' },
    });
    if (descripcion) {
      await prisma.producto_detalles.update({ where: { id: descripcion.id }, data: { descripcion: p.descripcion } });
    } else {
      await prisma.producto_detalles.create({
        data: { id_producto: existente.id, nombre: 'Descripción', descripcion: p.descripcion },
      });
    }
    productosActualizados++;
  }

  // Comentarios (upsert por producto + usuario): se crean o se actualizan calificación y texto
  for (const c of COMENTARIOS) {
    const producto = await prisma.producto.findFirst({ where: { nombre: c.producto } });
    const usuario = await prisma.usuario.findUnique({ where: { email: c.email } });
    if (!producto) throw new Error(`Comentario sobre un producto que no está en PRODUCTOS: "${c.producto}"`);
    if (!usuario) throw new Error(`Comentario de un usuario que no está en USUARIOS: "${c.email}"`);
    await prisma.comentario.upsert({
      where: { id_producto_id_usuario: { id_producto: producto.id, id_usuario: usuario.id } },
      update: { calificacion: c.calificacion, texto: c.texto },
      create: { id_producto: producto.id, id_usuario: usuario.id, calificacion: c.calificacion, texto: c.texto },
    });
  }

  console.log('Seed completado:');
  console.log(`  ${Object.keys(roles).length} roles, ${USUARIOS.length} usuarios, ${Object.keys(subcategorias).length} subcategorías`);
  console.log(`  ${PRODUCTOS.length} productos (${productosCreados} nuevos, ${productosActualizados} actualizados), ${COMENTARIOS.length} comentarios`);
  console.log('  Admin:    admin@tecno.com   / Admin1234');
  console.log('  Clientes: cliente@tecno.com, maria@tecno.com, lucas@tecno.com, sofia@tecno.com / Cliente1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
