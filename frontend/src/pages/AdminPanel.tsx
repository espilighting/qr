import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [codigo, setCodigo] = useState('');
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    axios.get('/api/incidencias')
      .then(res => setIncidencias(res.data))
      .catch(err => console.error(err));
  }, []);

  const crearMaterial = () => {
    axios.post('/api/materiales', { nombre, codigo_qr: codigo, cantidad })
      .then(() => alert('✅ Material creado'))
      .catch(err => console.error(err));
  };

  return (
    <div className="container">
      <h2>Panel de Administración</h2>

      <div className="form-section">
        <h3>➕ Crear nuevo material</h3>
        <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input placeholder="Código QR" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(parseInt(e.target.value))} />
        <button className="btn" onClick={crearMaterial}>Registrar</button>
      </div>

      <div className="form-section">
        <h3>🚨 Incidencias registradas</h3>
        {incidencias.length === 0 ? (
          <p>No hay incidencias registradas</p>
        ) : (
          incidencias.map((i, idx) => (
            <div key={idx} className="result-box">
              <p><strong>Material:</strong> {i.nombre_material}</p>
              <p><strong>Título:</strong> {i.titulo}</p>
              <p><strong>Descripción:</strong> {i.descripcion}</p>
              <p><strong>Registrado por:</strong> {i.registrado_por}</p>
              <p><strong>Fecha:</strong> {new Date(i.fecha).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
