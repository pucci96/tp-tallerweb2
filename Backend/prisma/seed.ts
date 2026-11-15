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

/**
 * URL de una foto de Unsplash (licencia libre) a partir de su id, recortada a 600 px.
 * Para cambiar la imagen de un producto: buscá la foto en unsplash.com, copiá el id
 * que aparece en la URL de la imagen ("photo-XXXXXXXXXX-xxxxxxxx") y reemplazalo.
 */
function foto(id: string): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;
}

const CATEGORIAS: Record<string, string[]> = {
  Componentes: ['Placas de video', 'Procesadores', 'Memorias RAM'],
  'Periféricos': ['Teclados', 'Mouses', 'Auriculares'],
  Monitores: ['Gaming', 'Oficina'],
};

/**
 * Productos de prueba. `specs` son las especificaciones técnicas: se guardan en
 * Producto_detalles después de la descripción y se muestran en la tabla del detalle.
 * Los que tienen stock 0 sirven para probar el estado "Sin stock".
 */
const PRODUCTOS: {
  nombre: string;
  sub: string;
  precio: number;
  stock: number;
  imagen: string;
  destacado: boolean;
  descripcion: string;
  specs: Record<string, string>;
}[] = [
  // ---------- Placas de video ----------
  { nombre: 'Placa de Video RTX 4070 Super 12GB', sub: 'Placas de video', precio: 899999, stock: 8, imagen: foto('1555618254-84e2cf498b01'), destacado: true,
    descripcion: 'Arquitectura Ada Lovelace, DLSS 3 y ray tracing para jugar en 1440p a altos FPS.',
    specs: { 'Memoria': '12 GB GDDR6X', 'Interfaz de memoria': '192 bits', 'Salidas': '3x DisplayPort 1.4a, 1x HDMI 2.1', 'Consumo': '220 W', 'Fuente recomendada': '650 W' } },
  { nombre: 'Placa de Video RX 7600 8GB', sub: 'Placas de video', precio: 419999, stock: 12, imagen: foto('1762838362452-fea83ce9c34c'), destacado: false,
    descripcion: 'Rendimiento sólido en 1080p con bajo consumo energético.',
    specs: { 'Memoria': '8 GB GDDR6', 'Interfaz de memoria': '128 bits', 'Salidas': '3x DisplayPort 2.1, 1x HDMI 2.1', 'Consumo': '165 W', 'Fuente recomendada': '550 W' } },
  { nombre: 'Placa de Video RTX 4060 8GB', sub: 'Placas de video', precio: 489999, stock: 15, imagen: foto('1778621962156-f9b3d255fb5f'), destacado: false,
    descripcion: 'DLSS 3 y bajo consumo, ideal para jugar en 1080p con ray tracing.',
    specs: { 'Memoria': '8 GB GDDR6', 'Interfaz de memoria': '128 bits', 'Salidas': '3x DisplayPort 1.4a, 1x HDMI 2.1', 'Consumo': '115 W', 'Fuente recomendada': '550 W' } },
  { nombre: 'Placa de Video RX 7800 XT 16GB', sub: 'Placas de video', precio: 749999, stock: 0, imagen: foto('1780962178528-04bfe3b366d4'), destacado: false,
    descripcion: '16 GB de memoria para jugar en 1440p con texturas en ultra.',
    specs: { 'Memoria': '16 GB GDDR6', 'Interfaz de memoria': '256 bits', 'Salidas': '3x DisplayPort 2.1, 1x HDMI 2.1', 'Consumo': '263 W', 'Fuente recomendada': '700 W' } },

  // ---------- Procesadores ----------
  { nombre: 'Procesador Ryzen 7 7800X3D', sub: 'Procesadores', precio: 629999, stock: 5, imagen: foto('1591799264318-7e6ef8ddb7ea'), destacado: true,
    descripcion: '8 núcleos y 16 hilos con tecnología 3D V-Cache, ideal para gaming.',
    specs: { 'Núcleos / hilos': '8 / 16', 'Frecuencia': '4.2 GHz (boost hasta 5.0 GHz)', 'Caché L3': '96 MB', 'Socket': 'AM5', 'TDP': '120 W', 'Cooler incluido': 'No' } },
  { nombre: 'Procesador Ryzen 5 7600', sub: 'Procesadores', precio: 279999, stock: 18, imagen: foto('1682068548081-50aa8b92c8c1'), destacado: false,
    descripcion: 'Seis núcleos Zen 4 con gran rendimiento por precio y cooler incluido.',
    specs: { 'Núcleos / hilos': '6 / 12', 'Frecuencia': '3.8 GHz (boost hasta 5.1 GHz)', 'Caché L3': '32 MB', 'Socket': 'AM5', 'TDP': '65 W', 'Cooler incluido': 'Sí (Wraith Stealth)' } },
  { nombre: 'Procesador Intel Core i5-14600K', sub: 'Procesadores', precio: 399999, stock: 10, imagen: foto('1555616635-640b71bdb185'), destacado: false,
    descripcion: 'Arquitectura híbrida de 14 núcleos, ideal para gaming y streaming.',
    specs: { 'Núcleos / hilos': '14 (6P + 8E) / 20', 'Frecuencia': 'Boost hasta 5.3 GHz', 'Caché': '24 MB', 'Socket': 'LGA 1700', 'TDP': '125 W', 'Cooler incluido': 'No' } },
  { nombre: 'Procesador Intel Core i7-14700K', sub: 'Procesadores', precio: 579999, stock: 4, imagen: foto('1555617981-dac3880eac6e'), destacado: false,
    descripcion: '20 núcleos para gaming exigente, edición de video y renderizado.',
    specs: { 'Núcleos / hilos': '20 (8P + 12E) / 28', 'Frecuencia': 'Boost hasta 5.6 GHz', 'Caché': '33 MB', 'Socket': 'LGA 1700', 'TDP': '125 W', 'Cooler incluido': 'No' } },

  // ---------- Memorias RAM ----------
  { nombre: 'Memoria RAM DDR5 32GB (2x16) 6000MHz', sub: 'Memorias RAM', precio: 154999, stock: 20, imagen: foto('1541029071515-84cc54f84dc5'), destacado: false,
    descripcion: 'Kit dual channel de baja latencia con disipador de aluminio.',
    specs: { 'Capacidad': '32 GB (2 x 16 GB)', 'Tipo': 'DDR5', 'Frecuencia': '6000 MHz', 'Latencia': 'CL30', 'Perfiles': 'AMD EXPO / Intel XMP 3.0' } },
  { nombre: 'Memoria RAM DDR4 16GB (2x8) 3200MHz', sub: 'Memorias RAM', precio: 59999, stock: 30, imagen: foto('1676554565685-3aeb5d7ad1b7'), destacado: false,
    descripcion: 'Kit dual channel confiable para PCs de oficina y gaming de entrada.',
    specs: { 'Capacidad': '16 GB (2 x 8 GB)', 'Tipo': 'DDR4', 'Frecuencia': '3200 MHz', 'Latencia': 'CL16', 'Perfiles': 'Intel XMP 2.0' } },
  { nombre: 'Memoria RAM DDR4 32GB (2x16) 3600MHz RGB', sub: 'Memorias RAM', precio: 99999, stock: 0, imagen: foto('1654240253461-3f51c793b366'), destacado: false,
    descripcion: 'Alta frecuencia y disipadores con iluminación RGB para plataformas DDR4.',
    specs: { 'Capacidad': '32 GB (2 x 16 GB)', 'Tipo': 'DDR4', 'Frecuencia': '3600 MHz', 'Latencia': 'CL18', 'Iluminación': 'RGB direccionable' } },
  { nombre: 'Memoria RAM DDR5 64GB (2x32) 5600MHz', sub: 'Memorias RAM', precio: 289999, stock: 6, imagen: foto('1542978709-19c95dc3bc7e'), destacado: false,
    descripcion: 'Capacidad de sobra para edición de video, máquinas virtuales y multitarea.',
    specs: { 'Capacidad': '64 GB (2 x 32 GB)', 'Tipo': 'DDR5', 'Frecuencia': '5600 MHz', 'Latencia': 'CL36', 'Perfiles': 'Intel XMP 3.0' } },

  // ---------- Teclados ----------
  { nombre: 'Teclado Mecánico RGB Switch Red TKL', sub: 'Teclados', precio: 94500, stock: 14, imagen: foto('1618384887929-16ec33fab9ef'), destacado: true,
    descripcion: 'Formato TKL 80%, switches lineales hot-swap y keycaps PBT doble inyección.',
    specs: { 'Formato': 'TKL 80% (87 teclas)', 'Switches': 'Red lineales, hot-swap', 'Keycaps': 'PBT doble inyección', 'Conexión': 'Cable USB-C desmontable', 'Distribución': 'Español (Latinoamérica)' } },
  { nombre: 'Teclado Mecánico Full Size Switch Brown', sub: 'Teclados', precio: 119999, stock: 9, imagen: foto('1595225476474-87563907a212'), destacado: false,
    descripcion: 'Formato completo con teclado numérico y switches táctiles para escribir y jugar.',
    specs: { 'Formato': 'Completo 100% (104 teclas)', 'Switches': 'Brown táctiles', 'Iluminación': 'RGB por tecla', 'Reposamuñecas': 'Magnético, desmontable', 'Distribución': 'Español (Latinoamérica)' } },
  { nombre: 'Teclado Inalámbrico 60% Bluetooth', sub: 'Teclados', precio: 79999, stock: 11, imagen: foto('1760708551859-6559dc9640b8'), destacado: false,
    descripcion: 'Compacto y portátil, se conecta hasta a 3 dispositivos por Bluetooth.',
    specs: { 'Formato': '60% (61 teclas)', 'Conexión': 'Bluetooth 5.1 / cable USB-C', 'Batería': 'Hasta 200 horas (sin iluminación)', 'Dispositivos': 'Hasta 3 en simultáneo', 'Distribución': 'Inglés (US)' } },
  { nombre: 'Teclado de Oficina Silencioso USB', sub: 'Teclados', precio: 24999, stock: 40, imagen: foto('1589578228447-e1a4e481c6c8'), destacado: false,
    descripcion: 'Teclas de perfil bajo y silenciosas, resistente a salpicaduras.',
    specs: { 'Formato': 'Completo con teclado numérico', 'Tipo': 'Membrana, perfil bajo', 'Conexión': 'USB-A, cable de 1.5 m', 'Resistente a salpicaduras': 'Sí', 'Distribución': 'Español (Latinoamérica)' } },

  // ---------- Mouses ----------
  { nombre: 'Mouse Gamer Inalámbrico 26K DPI', sub: 'Mouses', precio: 48900, stock: 25, imagen: foto('1527814050087-3793815479db'), destacado: false,
    descripcion: 'Sensor óptico de 26.000 DPI, 63 g de peso y hasta 70 horas de batería.',
    specs: { 'Sensor': 'Óptico, 26.000 DPI', 'Peso': '63 g', 'Conexión': 'Inalámbrica 2.4 GHz / cable USB-C', 'Batería': 'Hasta 70 horas', 'Botones': '5 programables' } },
  { nombre: 'Mouse Gamer Cableado 12K DPI RGB', sub: 'Mouses', precio: 22999, stock: 35, imagen: foto('1605773527852-c546a8584ea3'), destacado: false,
    descripcion: 'Liviano y preciso, con iluminación RGB y cable paracord.',
    specs: { 'Sensor': 'Óptico, 12.000 DPI', 'Peso': '72 g', 'Conexión': 'USB, cable paracord de 1.8 m', 'Botones': '6 programables', 'Iluminación': 'RGB' } },
  { nombre: 'Mouse Ergonómico Vertical Inalámbrico', sub: 'Mouses', precio: 34999, stock: 0, imagen: foto('1653179767361-ff174011e37b'), destacado: false,
    descripcion: 'Diseño vertical que reduce la tensión en la muñeca durante largas jornadas.',
    specs: { 'Sensor': 'Óptico, hasta 4000 DPI ajustable', 'Conexión': 'Inalámbrica 2.4 GHz + Bluetooth', 'Batería': 'Recargable por USB-C', 'Orientación': 'Diestro' } },
  { nombre: 'Mouse Inalámbrico Silencioso de Oficina', sub: 'Mouses', precio: 14999, stock: 50, imagen: foto('1551515300-2d3b7bb80920'), destacado: false,
    descripcion: 'Clics silenciosos y receptor USB nano, listo para usar.',
    specs: { 'Sensor': 'Óptico, 1600 DPI', 'Conexión': 'Inalámbrica 2.4 GHz (receptor nano USB)', 'Batería': '1 pila AA (hasta 18 meses)', 'Clics silenciosos': 'Sí' } },

  // ---------- Auriculares ----------
  { nombre: 'Auriculares Pro 7.1 Wireless', sub: 'Auriculares', precio: 119999, stock: 2, imagen: foto('1618366712010-f4ae9c647dcb'), destacado: true,
    descripcion: 'Sonido envolvente 7.1, micrófono desmontable y conexión inalámbrica de baja latencia.',
    specs: { 'Sonido': 'Envolvente 7.1 virtual', 'Drivers': '50 mm', 'Conexión': 'Inalámbrica 2.4 GHz', 'Batería': 'Hasta 30 horas', 'Micrófono': 'Desmontable, con cancelación de ruido' } },
  { nombre: 'Auriculares Bluetooth con Cancelación de Ruido', sub: 'Auriculares', precio: 159999, stock: 7, imagen: foto('1505740420928-5e560c06d30e'), destacado: true,
    descripcion: 'Cancelación activa de ruido, gran autonomía y carga rápida.',
    specs: { 'Cancelación de ruido': 'Activa (ANC)', 'Conexión': 'Bluetooth 5.3, multipunto', 'Batería': 'Hasta 40 horas', 'Carga rápida': '10 minutos = 5 horas de uso', 'Peso': '250 g' } },
  { nombre: 'Headset Gamer Cableado 3.5mm', sub: 'Auriculares', precio: 39999, stock: 22, imagen: foto('1583394838336-acd977736f90'), destacado: false,
    descripcion: 'Compatible con PC, consolas y celulares mediante conector de 3.5 mm.',
    specs: { 'Drivers': '50 mm', 'Conexión': 'Jack 3.5 mm', 'Micrófono': 'Flexible, con botón de silencio', 'Compatibilidad': 'PC, PS5, Xbox, Switch y celulares' } },
  { nombre: 'Auriculares In-Ear Gamer con Micrófono', sub: 'Auriculares', precio: 17999, stock: 28, imagen: foto('1590658268037-6bf12165a8df'), destacado: false,
    descripcion: 'Livianos, con buena aislación y micrófono en el cable para jugar en el celular.',
    specs: { 'Tipo': 'In-ear', 'Conexión': 'Jack 3.5 mm', 'Micrófono': 'En el cable, con control de volumen', 'Almohadillas': '3 tamaños incluidos' } },

  // ---------- Monitores gaming ----------
  { nombre: 'Monitor Gamer 27" 180Hz IPS', sub: 'Gaming', precio: 389999, stock: 7, imagen: foto('1603481588273-2f908a9a7a1b'), destacado: false,
    descripcion: 'Panel IPS QHD con 1 ms de respuesta y compatibilidad G-Sync.',
    specs: { 'Tamaño': '27"', 'Resolución': '2560 x 1440 (QHD)', 'Panel': 'IPS', 'Tasa de refresco': '180 Hz', 'Tiempo de respuesta': '1 ms (GtG)', 'Conexiones': '2x HDMI 2.0, 1x DisplayPort 1.4' } },
  { nombre: 'Monitor Gamer 24" 165Hz Full HD', sub: 'Gaming', precio: 229999, stock: 14, imagen: foto('1593305841991-05c297ba4575'), destacado: true,
    descripcion: 'Alta tasa de refresco a precio accesible, ideal para shooters competitivos.',
    specs: { 'Tamaño': '24"', 'Resolución': '1920 x 1080 (Full HD)', 'Panel': 'IPS', 'Tasa de refresco': '165 Hz', 'Tiempo de respuesta': '1 ms (MPRT)', 'Sincronización': 'AMD FreeSync Premium' } },
  { nombre: 'Monitor Gamer Curvo 32" 4K 144Hz', sub: 'Gaming', precio: 699999, stock: 3, imagen: foto('1666771410140-0573b232426e'), destacado: false,
    descripcion: 'Panel curvo 4K con HDR para inmersión total en juegos y películas.',
    specs: { 'Tamaño': '32"', 'Resolución': '3840 x 2160 (4K UHD)', 'Panel': 'VA curvo 1500R', 'Tasa de refresco': '144 Hz', 'HDR': 'DisplayHDR 400', 'Conexiones': '2x HDMI 2.1, 1x DisplayPort 1.4' } },
  { nombre: 'Monitor Gamer OLED 27" 240Hz', sub: 'Gaming', precio: 1099999, stock: 0, imagen: foto('1696710257827-75e2e5954059'), destacado: false,
    descripcion: 'Negros perfectos y respuesta instantánea con panel OLED QHD.',
    specs: { 'Tamaño': '27"', 'Resolución': '2560 x 1440 (QHD)', 'Panel': 'OLED', 'Tasa de refresco': '240 Hz', 'Tiempo de respuesta': '0.03 ms (GtG)', 'HDR': 'DisplayHDR True Black 400' } },

  // ---------- Monitores de oficina ----------
  { nombre: 'Monitor 24" Full HD Oficina', sub: 'Oficina', precio: 179999, stock: 15, imagen: foto('1611648694931-1aeda329f9da'), destacado: false,
    descripcion: 'Panel IPS con filtro de luz azul y base regulable en altura.',
    specs: { 'Tamaño': '24"', 'Resolución': '1920 x 1080 (Full HD)', 'Panel': 'IPS', 'Tasa de refresco': '75 Hz', 'Cuidado de la vista': 'Filtro de luz azul y sin parpadeo', 'Base': 'Regulable en altura, giro y pivote' } },
  { nombre: 'Monitor 27" 4K USB-C para Oficina', sub: 'Oficina', precio: 449999, stock: 6, imagen: foto('1527443224154-c4a3942d3acf'), destacado: false,
    descripcion: 'Imagen 4K nítida y un solo cable USB-C para video, datos y carga de la notebook.',
    specs: { 'Tamaño': '27"', 'Resolución': '3840 x 2160 (4K UHD)', 'Panel': 'IPS', 'USB-C': 'Video, datos y carga de 65 W', 'Parlantes': '2 x 3 W' } },
  { nombre: 'Monitor 22" Full HD Básico', sub: 'Oficina', precio: 129999, stock: 25, imagen: foto('1585792180666-f7347c490ee2'), destacado: false,
    descripcion: 'Monitor económico y eficiente para tareas de oficina y estudio.',
    specs: { 'Tamaño': '21.5"', 'Resolución': '1920 x 1080 (Full HD)', 'Panel': 'VA', 'Tasa de refresco': '75 Hz', 'Conexiones': 'HDMI y VGA', 'Montaje VESA': '100 x 100 mm' } },
  { nombre: 'Monitor 24" Ultrafino con Parlantes', sub: 'Oficina', precio: 159999, stock: 12, imagen: foto('1614624532983-4ce03382d63d'), destacado: false,
    descripcion: 'Diseño sin bordes y parlantes integrados para tu escritorio.',
    specs: { 'Tamaño': '23.8"', 'Resolución': '1920 x 1080 (Full HD)', 'Panel': 'IPS', 'Tasa de refresco': '100 Hz', 'Parlantes': '2 x 2 W integrados', 'Conexiones': 'HDMI y DisplayPort' } },
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

  // Comentarios de los clientes extra (María, Lucas y Sofía)
  { producto: 'Placa de Video RTX 4070 Super 12GB', email: 'maria@tecno.com', calificacion: 5,
    texto: 'La compré para editar video y renderiza muchísimo más rápido que mi placa anterior.' },
  { producto: 'Placa de Video RTX 4070 Super 12GB', email: 'lucas@tecno.com', calificacion: 4,
    texto: 'Muy buena, aunque tuve que cambiar la fuente para usarla tranquilo.' },
  { producto: 'Placa de Video RX 7600 8GB', email: 'lucas@tecno.com', calificacion: 4,
    texto: 'Excelente relación precio/rendimiento para jugar en 1080p.' },
  { producto: 'Placa de Video RX 7600 8GB', email: 'sofia@tecno.com', calificacion: 3,
    texto: 'Anda bien, pero en algunos juegos nuevos hay que bajar la calidad.' },
  { producto: 'Placa de Video RTX 4060 8GB', email: 'sofia@tecno.com', calificacion: 5,
    texto: 'Silenciosa y consume poco. Perfecta para mi gabinete chico.' },
  { producto: 'Procesador Ryzen 7 7800X3D', email: 'maria@tecno.com', calificacion: 5,
    texto: 'Los FPS subieron un montón respecto a mi procesador anterior.' },
  { producto: 'Procesador Ryzen 5 7600', email: 'lucas@tecno.com', calificacion: 5,
    texto: 'Por el precio no hay nada mejor. El cooler que trae alcanza para jugar.' },
  { producto: 'Procesador Ryzen 5 7600', email: 'cliente@tecno.com', calificacion: 4,
    texto: 'Muy buen procesador, aunque con el cooler incluido calienta un poco.' },
  { producto: 'Procesador Intel Core i7-14700K', email: 'sofia@tecno.com', calificacion: 4,
    texto: 'Una bestia para renderizar, pero calienta: usen buena refrigeración.' },
  { producto: 'Memoria RAM DDR5 32GB (2x16) 6000MHz', email: 'maria@tecno.com', calificacion: 5,
    texto: 'Activé el perfil EXPO y funcionó a 6000 MHz sin ningún problema.' },
  { producto: 'Memoria RAM DDR4 16GB (2x8) 3200MHz', email: 'lucas@tecno.com', calificacion: 3,
    texto: 'Cumple, nada especial. Para una PC de oficina está bien.' },
  { producto: 'Teclado Mecánico RGB Switch Red TKL', email: 'sofia@tecno.com', calificacion: 5,
    texto: 'Me encanta el sonido de los switches y el tamaño compacto.' },
  { producto: 'Teclado Inalámbrico 60% Bluetooth', email: 'maria@tecno.com', calificacion: 4,
    texto: 'Ideal para llevar a todos lados, aunque extraño las flechas dedicadas.' },
  { producto: 'Mouse Gamer Inalámbrico 26K DPI', email: 'lucas@tecno.com', calificacion: 5,
    texto: 'Muy liviano y la batería dura muchísimo.' },
  { producto: 'Mouse Gamer Inalámbrico 26K DPI', email: 'cliente@tecno.com', calificacion: 4,
    texto: 'Excelente sensor. El software es un poco confuso al principio.' },
  { producto: 'Mouse Ergonómico Vertical Inalámbrico', email: 'sofia@tecno.com', calificacion: 4,
    texto: 'Me costó acostumbrarme, pero ya no me duele la muñeca al final del día.' },
  { producto: 'Auriculares Pro 7.1 Wireless', email: 'maria@tecno.com', calificacion: 4,
    texto: 'Muy cómodos y el sonido 7.1 se nota en los juegos.' },
  { producto: 'Auriculares Bluetooth con Cancelación de Ruido', email: 'lucas@tecno.com', calificacion: 5,
    texto: 'La cancelación de ruido es increíble para viajar en colectivo.' },
  { producto: 'Auriculares Bluetooth con Cancelación de Ruido', email: 'sofia@tecno.com', calificacion: 5,
    texto: 'Los uso todo el día para trabajar y la batería sobra.' },
  { producto: 'Monitor Gamer 27" 180Hz IPS', email: 'cliente@tecno.com', calificacion: 5,
    texto: 'Colores muy buenos y los 180 Hz se sienten muy fluidos.' },
  { producto: 'Monitor Gamer 27" 180Hz IPS', email: 'maria@tecno.com', calificacion: 4,
    texto: 'Excelente imagen, solo le falta una base regulable en altura.' },
  { producto: 'Monitor Gamer 24" 165Hz Full HD', email: 'lucas@tecno.com', calificacion: 4,
    texto: 'Para juegos competitivos es ideal. El brillo podría ser un poco mayor.' },
  { producto: 'Monitor Gamer Curvo 32" 4K 144Hz', email: 'sofia@tecno.com', calificacion: 5,
    texto: 'La curva y el 4K hacen que jugar sea otra experiencia.' },
  { producto: 'Monitor 24" Full HD Oficina', email: 'cliente@tecno.com', calificacion: 4,
    texto: 'Lo uso para trabajar 8 horas por día y no cansa la vista.' },
  { producto: 'Monitor 27" 4K USB-C para Oficina', email: 'maria@tecno.com', calificacion: 5,
    texto: 'Conecto la notebook con un solo cable y listo. Comodísimo.' },
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

    // Especificaciones técnicas como filas de Producto_detalles (en el orden del objeto)
    const specs = Object.entries(p.specs).map(([nombre, descripcion]) => ({ nombre, descripcion }));

    const existente = await prisma.producto.findFirst({ where: { nombre: p.nombre } });
    const producto = existente
      ? await prisma.producto.update({ where: { id: existente.id }, data: datos })
      : await prisma.producto.create({ data: datos });
    if (existente) productosActualizados++;
    else productosCreados++;

    // Producto_detalles: el PRIMER registro (menor id) es la descripción, así lo usa el resto
    // de la app; los siguientes son las especificaciones. Se reemplazan por las de este archivo.
    const detalles = await prisma.producto_detalles.findMany({
      where: { id_producto: producto.id },
      orderBy: { id: 'asc' },
    });
    const [descripcion, ...specsViejas] = detalles;
    await prisma.$transaction([
      descripcion
        ? prisma.producto_detalles.update({ where: { id: descripcion.id }, data: { descripcion: p.descripcion } })
        : prisma.producto_detalles.create({
            data: { id_producto: producto.id, nombre: 'Descripción', descripcion: p.descripcion },
          }),
      prisma.producto_detalles.deleteMany({ where: { id: { in: specsViejas.map((d) => d.id) } } }),
      prisma.producto_detalles.createMany({ data: specs.map((s) => ({ ...s, id_producto: producto.id })) }),
    ]);
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
