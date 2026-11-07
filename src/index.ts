import express from 'express';
import { prisma } from './db';

const app = express();
app.use(express.json());

//Call de testing, para comprobar que el servidor funciona correctamente
app.get('/test', async (req, res) => {
    res.json({ message: 'Testeo -> Funcionando!' });
});

//GET - Login 
app.get('/login', async (req, res) => {
    // Lógica de login
});

//GET - Datos de usuario
app.get('/user/:id', async (req, res) => {
    // Logica para obtener datos de usuario
});

//POST - Crear usuario
app.post('/user', async (req, res) => {
    // Lógica para crear un nuevo usuario
});

//PUT - Actualizar usuario
app.put('/user/:id', async (req, res) => {
    // Lógica para actualizar un usuario existente
});

//POST - Crear Rol
app.post('/role', async (req, res) => {
    // Lógica para crear un nuevo rol
});

//GET - Categorias
app.get('/categoria', async (req, res) => {
    
});

//GET - Subcategorias de una categoria
app.get('/categoria/:id/subcategorias', async (req, res) => {

});

//GET - Productos
app.get('/productos', async (req, res) => {
});

//GET - Productos de una categoria
app.get('/categoria/:id/productos', async (req, res) => {});

//GET - Productos de una subcategoria
app.get('/subcategoria/:id/productos', async (req, res) => {});

//GET - Busqueda de productos por nombre
app.get('/productos/busqueda', async (req, res) => {
    // Lógica para buscar productos por nombre
});

//POST - Crear producto
app.post('/producto', async (req, res) => {
    // Lógica para crear un nuevo producto
});

//PUT - Actualizar producto
app.put('/producto/:id', async (req, res) => {
    // Lógica para actualizar un producto existente
});

//DELETE - Eliminar producto
app.delete('/producto/:id', async (req, res) => {
    // Lógica para eliminar un producto existente
});




const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor de Express activo en http://localhost:${PORT}`);
});