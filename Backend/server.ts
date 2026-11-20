import { env } from './src/config/env'; // debe ser el primer import: carga el .env
import express from 'express';
import cors from 'cors';
import productoRoutes from './src/routes/producto.routes';
import usuarioRoutes from './src/routes/usuario.routes';
import categoriaRoutes from './src/routes/categoria.routes';
import pedidoRoutes from './src/routes/pedido.routes';
import { manejarErrores, rutaNoEncontrada } from './src/middleware/error.middleware';

const app = express();

// CORS con lista blanca: el navegador solo deja usar la API a los frontends
// configurados en CORS_ORIGINS (por defecto, Angular en http://localhost:4200).
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api', categoriaRoutes); // /api/categorias y /api/subcategorias

app.use('/api', rutaNoEncontrada);
app.use(manejarErrores);

app.listen(env.port, () => {
  console.log(`Backend escuchando en http://localhost:${env.port}`);
});
