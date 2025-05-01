import React, { useState, useEffect } from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';
import { QRCodeCanvas } from 'qrcode.react'; // Ya está incluido

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [materialNombre, setMaterialNombre] = useState<string | null>(null);
  const [incidenciaTexto, setIncidenciaTexto] = useState('');
  const [descripcionTexto, setDescripcionTexto] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Nuevos estados
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoCantidad, setNuevoCantidad] = useState(1);
  const [registroExitoso, setRegistroExitoso] = useState(false);
  const [incidencias, setIncidencias] = useState<any[]>([]);
  const [entradasSalidas, setEntradasSalidas] = useState<any[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));

    const storedRole = localStorage.getItem('role');
    if (storedRole === 'admin') {
      setIsAdmin(true);
      setLoggedIn(true);
    } else if (storedRole === 'user') {
      setIsAdmin(false);
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('role', 'admin');
      setIsAdmin(true);
      setLoggedIn(true);
    } else if (username === 'user' && password === 'user123') {
      localStorage.setItem('role', 'user');
      setIsAdmin(false);
      setLoggedIn(true);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  const handleScan = (data: string) => {
    if (data && data !== qrResult) {
      setQrResult(data);
      setScanError(null);
      fetchMaterial(data);
    }
  };

  const handleError = (err: any) => {
    console.error('Error al leer el QR:', err);
    setScanError('❌ Error al leer el código QR. Intenta de nuevo.');
  };

  const fetchMaterial = async (codigo_qr: string) => {
    try {
      const res = await fetch(`http://localhost:5050/api/inventory`);
      const data = await res.json();
      const material = data.find((item: any) => item.codigo_qr === codigo_qr);
      setMaterialNombre(material ? material.nombre : null);
    } catch (error) {
      console.error('❌ Error al buscar material:', error);
    }
  };

  const handleRegister = async (type: 'entrada' | 'salida' | 'incidencia') => {
    if (!qrResult) {
      alert('Escanea un código QR primero');
      return;
    }

    let payload: any = {};

    if (type === 'incidencia') {
      if (!incidenciaTexto || !descripcionTexto || !registradoPor) {
        alert('Debes completar todos los campos de la incidencia');
        return;
      }

      payload = {
        incidencia: incidenciaTexto,
        descripcion: descripcionTexto,
        registrado_por: registradoPor,
        codigo_qr: qrResult,
      };
    } else {
      payload = { codigo_qr: qrResult };
    }

    try {
      const res = await fetch(`http://localhost:5050/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) throw new Error(result.error || 'Error desconocido');

      alert(result.mensaje || 'Acción registrada');
    } catch (error) {
      console.error('❌ Error al registrar acción:', error);
      alert('Error al comunicar con el servidor');
    }
  };

  const handleNuevoMaterial = async () => {
    if (!nuevoNombre || !nuevoCodigo || nuevoCantidad <= 0) {
      alert('Completa todos los campos para registrar material');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5050/api/materiales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoNombre,
          codigo_qr: nuevoCodigo,
          cantidad: nuevoCantidad,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error desconocido');

      setRegistroExitoso(true);
      setNuevoNombre('');
      setNuevoCodigo('');
      setNuevoCantidad(1);
      setTimeout(() => setRegistroExitoso(false), 3000);
    } catch (err: any) {
      console.error('❌ Error al registrar nuevo material:', err);
      alert('Error al registrar material: ' + err.message);
    }
  };

  const generarCodigoQR = () => {
    const randomCode = `MAT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    setNuevoCodigo(randomCode);
  };

  const handleLogout = () => {
    localStorage.removeItem('role');
    setIsAdmin(false);
    setLoggedIn(false);
  };

  const fetchIncidencias = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/incidencias`);
      const data = await res.json();
      setIncidencias(data);
    } catch (error) {
      console.error('❌ Error al obtener incidencias:', error);
    }
  };

  const fetchEntradasSalidas = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/entradas-salidas`);
      const data = await res.json();
      setEntradasSalidas(data);
    } catch (error) {
      console.error('❌ Error al obtener entradas/salidas:', error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchIncidencias();
      fetchEntradasSalidas();
    }
  }, [isAdmin]);

  if (!loggedIn) {
    return (
      <div className="login-container">
        <h2>🔐 Iniciar sesión</h2>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        /><br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        <button onClick={handleLogin} className="login-button">Iniciar sesión</button>
      </div>
    );
  }

  if (!hasPermission) {
    return <p>❌ Por favor, permite el acceso a la cámara para escanear el QR.</p>;
  }

  return (
    <div className="scanner-container">
      <h2>📷 Escanea un código QR</h2>

      <QrReader
        onResult={(result, error) => {
          if (result) handleScan(result.getText());
          if (error) handleError(error);
        }}
        constraints={{ facingMode: 'environment' }}
        containerStyle={{ width: '100%' }}
        videoStyle={{ borderRadius: '10px' }}
      />

      {qrResult && (
        <div className="qr-result">
          <p><strong>QR detectado:</strong> {qrResult}</p>
          {materialNombre && <p><strong>Material:</strong> {materialNombre}</p>}
        </div>
      )}

      {scanError && <p className="error">{scanError}</p>}

      <div className="actions">
        <button className="btn" onClick={() => handleRegister('entrada')}>📥 Registrar Entrada</button>
        <button className="btn" onClick={() => handleRegister('salida')}>📤 Registrar Salida</button>
      </div>

      <div className="incidencia-form">
        <h3>🛠️ Registrar Incidencia</h3>
        <input
          type="text"
          placeholder="Título de la incidencia"
          value={incidenciaTexto}
          onChange={(e) => setIncidenciaTexto(e.target.value)}
        /><br />
        <textarea
          placeholder="Descripción"
          value={descripcionTexto}
          onChange={(e) => setDescripcionTexto(e.target.value)}
          rows={3}
        /><br />
        <input
          type="text"
          placeholder="Registrado por"
          value={registradoPor}
          onChange={(e) => setRegistradoPor(e.target.value)}
        /><br />
        <button className="btn" onClick={() => handleRegister('incidencia')}>🚨 Enviar Incidencia</button>
      </div>

      {/* Panel de administración */}
      {isAdmin && (
        <div className="admin-panel">
          <h3>🔧 Panel de Administración</h3>

          <div className="admin-form">
            <h4>➕ Registrar Nuevo Material</h4>
            <input
              type="text"
              placeholder="Nombre del material"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            /><br />
            <input
              type="text"
              placeholder="Código QR (pegar o generar)"
              value={nuevoCodigo}
              onChange={(e) => setNuevoCodigo(e.target.value)}
            />
            <button className="btn" onClick={generarCodigoQR}>🎲 Generar Código</button><br />
            {nuevoCodigo && (
              <div style={{ margin: '10px auto' }}>
                <QRCodeCanvas value={nuevoCodigo} size={128} />
              </div>
            )}
            <input
              type="number"
              placeholder="Cantidad"
              value={nuevoCantidad}
              min={1}
              onChange={(e) => setNuevoCantidad(parseInt(e.target.value))}
            /><br />
            <button className="btn" onClick={handleNuevoMaterial}>✅ Registrar Material</button>
            {registroExitoso && (
              <p className="success">✅ Material registrado correctamente</p>
            )}
          </div>

          <div className="incidencias-list">
            <h4>⚠️ Incidencias</h4>
            {incidencias.length > 0 ? (
              incidencias.map((incidencia, index) => (
                <div key={index} className="incidencia-item">
                  <p>{incidencia.incidencia}</p>
                  <p>{incidencia.descripcion}</p>
                </div>
              ))
            ) : (
              <p>No hay incidencias registradas.</p>
            )}
          </div>

          <div className="entradas-salidas-list">
            <h4>📦 Entradas y Salidas</h4>
            {entradasSalidas.length > 0 ? (
              entradasSalidas.map((entry, index) => (
                <div key={index} className="entry-item">
                  <p>{entry.codigo_qr} - {entry.tipo}</p>
                  <p>{entry.fecha}</p>
                </div>
              ))
            ) : (
              <p>No hay registros de entradas o salidas.</p>
            )}
          </div>
        </div>
      )}

      <button className="btn" onClick={handleLogout}>🚪 Cerrar sesión</button>
    </div>
  );
};

export default QRScanner;
