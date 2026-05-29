const express = require('express');
const cors = require('cors'); // Requerido para conectar la interfaz sin bloqueos
const pool = require('./db');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors()); 
app.use(express.json());

// ---> ESTAS LÍNEAS HACEN QUE EXPRESS LEA TU NUEVA ESTRUCTURA:
app.use(express.static(__dirname)); 
app.use('/wwwroot', express.static(__dirname + '/wwwroot'));

// Ruta para cargar tu index.html automáticamente al entrar a http://localhost:3000
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// 1. GET - Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM productos ORDER BY id ASC');
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. POST - Crear un producto
app.post('/productos', async (req, res) => {
  try {
    const { nombre, precio } = req.body;
    const nuevoProducto = await pool.query(
      'INSERT INTO productos (nombre, precio) VALUES ($1, $2) RETURNING *',
      [nombre, precio]
    );
    res.status(201).json(nuevoProducto.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. PUT - Actualizar producto completo
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio } = req.body;
  try {
    const resultado = await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2 WHERE id = $3 RETURNING *',
      [nombre, precio, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Actualizado con éxito', producto: resultado.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE - Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Esto nos dirá si el puerto está ocupado o qué lo apaga
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está ocupado por otra aplicación. Intenta cerrarla o cambia el puerto en tu .env`);
  } else {
    console.error('❌ Ocurrió un error al iniciar el servidor:', err);
  }
});