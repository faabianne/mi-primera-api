const express = require('express');
const pool = require('./db');

const app = express();

// Le dice a Express que entienda JSON
app.use(express.json());

// Ruta de prueba - Hola Mundo
app.get('/hola-mundo', (req, res) => {
  res.send('Hello World!');
});

// 1. GET - Obtener todos los productos
app.get('/productos', async (req, res) => {
  try {
    const resultado = await pool.query('SELECT * FROM productos');
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

    res.json({
      mensaje: 'Actualizado con éxito',
      producto: resultado.rows[0]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. DELETE - Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM productos WHERE id = $1', [id]);

    res.json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Iniciar el servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});