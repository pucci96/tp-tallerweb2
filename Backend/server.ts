import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/productos/destacados', async (_req: Request, res: Response) => {
  try {
    const productos = await prisma.producto.findMany({
      include: {
        categoria: true,
        subcategoria: true,
        detalle: true
      }
    });

    const respuesta = productos.map(p => ({
      id: p.id,
      category: p.subcategoria?.nombre || p.categoria?.nombre || 'General',
      title: p.nombre,
      description: p.detalle[0]?.descripcion || 'Sin descripción',
      price: Number(p.precio),
      imageUrl: p.imagen || 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=600&q=80'
    }));

    res.json(respuesta);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});



app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

