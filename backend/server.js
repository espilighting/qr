const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
const port = 5050;

app.use(cors());
app.use(express.json());

// Configurar conexión a MariaDB
const db = mysql.createPool({
  host: '5.240.190.243',
  user: 'usuario_remoto',
  password: 'espi-14105', // Cambia según tu configuración
  database: 'inventario',
});

// Obtener todos los materiales
app.get('/api/inventory', (req, res) => {
  db.query('SELECT * FROM materiales', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Registrar entrada
app.post('/api/entrada', (req, res) => {
  const { codigo_qr } = req.body;
  if (!codigo_qr) {
    return res.status(400).json({ error: 'El código QR es requerido' });
  }
  db.query(
    'INSERT INTO entradas_salidas (codigo_qr, tipo, fecha) VALUES (?, "entrada", NOW())',
    [codigo_qr],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Entrada registrada correctamente' });
    }
  );
});

// Registrar salida
app.post('/api/salida', (req, res) => {
  const { codigo_qr } = req.body;
  if (!codigo_qr) {
    return res.status(400).json({ error: 'El código QR es requerido' });
  }
  db.query(
    'INSERT INTO entradas_salidas (codigo_qr, tipo, fecha) VALUES (?, "salida", NOW())',
    [codigo_qr],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Salida registrada correctamente' });
    }
  );
});

// Registrar incidencia
app.post('/api/incidencia', (req, res) => {
  const { incidencia, descripcion, registrado_por, codigo_qr } = req.body;
  if (!incidencia || !descripcion || !registrado_por || !codigo_qr) {
    return res.status(400).json({ error: 'Faltan datos para registrar la incidencia' });
  }
  db.query(
    'INSERT INTO incidencias (incidencia, descripcion, registrado_por, codigo_qr, fecha) VALUES (?, ?, ?, ?, NOW())',
    [incidencia, descripcion, registrado_por, codigo_qr],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Incidencia registrada correctamente' });
    }
  );
});

// Registrar nuevo material
app.post('/api/materiales', (req, res) => {
  const { nombre, codigo_qr, cantidad } = req.body;
  if (!nombre || !codigo_qr || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos para registrar el material' });
  }
  db.query(
    'INSERT INTO materiales (nombre, codigo_qr, cantidad) VALUES (?, ?, ?)',
    [nombre, codigo_qr, cantidad],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Material registrado correctamente' });
    }
  );
});

// Obtener incidencias
app.get('/api/incidencias', (req, res) => {
  db.query('SELECT * FROM incidencias', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Obtener entradas y salidas
app.get('/api/entradas-salidas', (req, res) => {
  db.query('SELECT * FROM entradas_salidas', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
