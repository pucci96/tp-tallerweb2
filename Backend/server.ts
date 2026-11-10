import express from 'express';
import cors from 'cors';
import productoRoutes from './src/routes/producto.routes';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


app.use('/api/productos', productoRoutes);

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});