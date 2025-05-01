const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de tener la conexión a la base de datos configurada

// Endpoint para registrar una incidencia
router.post('/incidencias', (req, res) => {
  const { incidencia, descripcion, registradoPor } = req.body;

  // Validar que todos los campos estén presentes
  if (!incidencia || !descripcion || !registradoPor) {
    return res.status(400).send('Todos los campos son requeridos.');
  }

  // Consulta SQL para insertar la incidencia en la base de datos
  const query = 'INSERT INTO incidencias (incidencia, descripcion, registrado_por) VALUES (?, ?, ?)';
  
  db.query(query, [incidencia, descripcion, registradoPor], (error, results) => {
    if (error) {
      console.error('Error al guardar la incidencia:', error);
      return res.status(500).send('Error al registrar la incidencia');
    }

    res.status(200).json({ mensaje: 'Incidencia registrada correctamente' });
  });
});

module.exports = router;
