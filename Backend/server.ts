import express from 'express';
import cors from 'cors';
import { prisma } from './src/config/prisma';
import productoRoutes from './src/routes/producto.routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use('/api/productos', productoRoutes);

app.get('/api/categorias', async (_req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});


app.get('/api/subcategorias', async (_req, res) => {
  try {
    const subcategorias = await prisma.subcategoria.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(subcategorias);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener subcategorías' });
  }
});
app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});