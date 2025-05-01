import { useState, useEffect } from 'react';
import { QrReader } from '@blackbox-vision/react-qr-reader';

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(true);
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [materialNombre, setMaterialNombre] = useState<string | null>(null);
  const [incidenciaTexto, setIncidenciaTexto] = useState('');
  const [descripcionTexto, setDescripcionTexto] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');
  const [isAdmin, setIsAdmin] = useState(false); // Para controlar si el usuario es admin
  const [loggedIn, setLoggedIn] = useState(false); // Estado de login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Para el nuevo material
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCodigo, setNuevoCodigo] = useState('');
  const [nuevoCantidad, setNuevoCantidad] = useState(1); // Campo de cantidad
  const [registroExitoso, setRegistroExitoso] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => setHasPermission(true))
      .catch(() => setHasPermission(false));

    // Verifica si el usuario está autenticado y qué rol tiene en el localStorage
    const storedRole = localStorage.getItem('role');
    if (storedRole === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // Función de login
  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('role', 'admin'); // Guardamos el rol en el localStorage
      setIsAdmin(true);
      setLoggedIn(true);
    } else if (username === 'user' && password === 'user123') {
      localStorage.setItem('role', 'user'); // Guardamos el rol en el localStorage
      setIsAdmin(false);
      setLoggedIn(true);
    } else {
      alert('Credenciales incorrectas');
    }
  };

  // Si el usuario está logueado, mostramos la funcionalidad de escaneo
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

  // Si el usuario está autenticado, mostramos la aplicación del QRScanner
  const handleScan = (data: any) => {
    if (data && data !== qrResult) {
      setQrResult(data);
      setScanError(null);
      fetchMaterial(data); // Buscar nombre del material
      setNuevoCodigo(data); // Rellenar automáticamente el código QR para nuevo material
    }
  };

  const handleError = (err: any) => {
    console.error('Error al leer el QR', err);
    setScanError('Error al leer el código QR, por favor inténtalo nuevamente.');
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

  const handleRegister = async (type: string) => {
    if (!qrResult) {
      alert('Escanea un código QR primero');
      return;
    }

    let payload: any = {};

    if (type === 'incidencia') {
      if (!incidenciaTexto || !descripcionTexto || !registradoPor) {
        alert('Debes rellenar todos los campos de incidencia');
        return;
      }

      payload = {
        incidencia: incidenciaTexto,
        descripcion: descripcionTexto,
        registrado_por: registradoPor,
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

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error desconocido');
      }

      const result = await res.json();
      if (result.mensaje) {
        alert(result.mensaje);
      } else {
        alert(result.error || 'Error al registrar la acción');
      }
    } catch (error) {
      console.error('❌ Error al llamar a la API:', error);
      alert('Ocurrió un error al comunicar con el servidor.');
    }
  };

  const handleNuevoMaterial = async () => {
    if (!nuevoNombre || !nuevoCodigo || nuevoCantidad <= 0) {
      alert('Rellena todos los campos correctamente');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5050/api/materiales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre, codigo_qr: nuevoCodigo, cantidad: nuevoCantidad }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si la respuesta del backend no es OK, lanzar error
        throw new Error(data.error || 'Error desconocido');
      }

      // Verificamos que la respuesta contenga la propiedad 'mensaje'
      if (data.mensaje) {
        setRegistroExitoso(true);
        setNuevoNombre('');
        setNuevoCodigo('');
        setNuevoCantidad(1); // Reiniciar la cantidad a 1
        setTimeout(() => setRegistroExitoso(false), 3000); // mensaje visible 3s
      } else {
        // Si no es exitoso, mostrar un mensaje de error
        alert(data.error || 'Error al registrar el material');
      }
    } catch (err) {
      console.error('❌ Error al registrar nuevo material:', err);
      alert('Error al conectar con el servidor: ' + err.message);
    }
  };

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

      {isAdmin && (
        <div className="admin-form">
          <h3>➕ Registrar Nuevo Material</h3>
          <input
            type="text"
            placeholder="Nombre del material"
            value={nuevoNombre}
            onChange={(e) => setNuevoNombre(e.target.value)}
          /><br />
          <input
            type="text"
            placeholder="Código QR (pegar o escanear)"
            value={nuevoCodigo}
            onChange={(e) => setNuevoCodigo(e.target.value)}
          /><br />
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
      )}
    </div>
  );
};

export default QRScanner;
