import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Endpoint: Productos Destacados
app.get('/api/productos/destacados', async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        destacado: true
      },
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      }
    });

    const respuesta = productos.map((p: any) => ({
      id: p.id,
      category: p.subcategoria?.nombre || p.categoria?.nombre || 'General',
      title: p.nombre,
      description: p.detalle?.[0]?.descripcion || 'Sin descripción',
      price: Number(p.precio),
      imageUrl: p.imagen || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'
    }));

    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. Endpoint: Categorías (el que te pedía el Home)
app.get('/api/categorias', async (_req: Request, res: Response) => {
  try {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});