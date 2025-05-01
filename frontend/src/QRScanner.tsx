import React, { useState, useEffect } from 'react';
import QRCodeReader from '@blackbox-vision/react-qr-reader';

interface QrScannerProps {
  tipo: 'salida' | 'entrada';
}

export const QrScanner: React.FC<QrScannerProps> = ({ tipo }) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [incidenciaTexto, setIncidenciaTexto] = useState('');
  const [descripcionTexto, setDescripcionTexto] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Se puede verificar si el usuario es admin
  useEffect(() => {
    const role = localStorage.getItem('role');
    setIsAdmin(role === 'admin');
  }, []);

  const handleScan = (result: string | null) => {
    if (result) {
      setScannedCode(result);
    }
  };

  const handleError = (error: any) => {
    console.error(error);
  };

  const handleRegister = async (tipo: string) => {
    if (!scannedCode) return;

    await fetch(`http://localhost:5050/api/${tipo}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ codigo_qr: scannedCode }),
    }).then((response) => response.json())
      .then((data) => {
        alert(data.mensaje);
      }).catch((error) => {
        console.error('Error:', error);
        alert('Hubo un problema al registrar.');
      });
  };

  const handleIncidencia = async () => {
    if (!incidenciaTexto || !descripcionTexto || !registradoPor) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    const response = await fetch('http://localhost:5050/api/incidencia', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ incidencia: incidenciaTexto, descripcion: descripcionTexto, registrado_por: registradoPor }),
    });

    const data = await response.json();
    alert(data.mensaje);
    setIncidenciaTexto('');
    setDescripcionTexto('');
    setRegistradoPor('');
  };

  const handleNuevoQr = async () => {
    const nombre = prompt('Nombre del nuevo material');
    const codigoBarra = prompt('Código de barra del material');
    const cantidad = parseInt(prompt('Cantidad del material') || '0');

    if (!nombre || !codigoBarra || cantidad <= 0) {
      alert('Por favor, complete todos los campos correctamente.');
      return;
    }

    await fetch('http://localhost:5050/api/materiales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, codigo_barra: codigoBarra, cantidad }),
    }).then((response) => response.json())
      .then((data) => {
        alert(data.mensaje);
      }).catch((error) => {
        console.error('Error:', error);
        alert('Hubo un problema al registrar el nuevo QR.');
      });
  };

  return (
    <div>
      <h2>Escanear Código QR para {tipo === 'salida' ? 'Salida' : 'Entrada'}</h2>
      <div>
        <button onClick={handleNuevoQr}>Registrar Nuevo QR</button>
      </div>
      <div>
        <input
          type="text"
          placeholder="Incidencia"
          value={incidenciaTexto}
          onChange={(e) => setIncidenciaTexto(e.target.value)}
        />
        <input
          type="text"
          placeholder="Descripción"
          value={descripcionTexto}
          onChange={(e) => setDescripcionTexto(e.target.value)}
        />
        <input
          type="text"
          placeholder="Registrado por"
          value={registradoPor}
          onChange={(e) => setRegistradoPor(e.target.value)}
        />
        <button onClick={handleIncidencia}>Registrar Incidencia</button>
      </div>
      <div id="scanner" style={{ width: '100%', height: '500px' }}>
        <QRCodeReader
          onScan={handleScan}
          onError={handleError}
          constraints={{ facingMode: 'environment' }} // Usa la cámara trasera
          videoStyle={{ width: '100%', height: '100%' }} // Asegura que ocupe todo el espacio
        />
      </div>
      {scannedCode && <p>Código escaneado: {scannedCode}</p>}
      {isAdmin ? (
        <div>
          <button onClick={() => handleRegister('entrada')}>Registrar Entrada</button>
          <button onClick={() => handleRegister('salida')}>Registrar Salida</button>
        </div>
      ) : (
        <p>Solo los administradores pueden registrar movimientos.</p>
      )}
    </div>
  );
};
