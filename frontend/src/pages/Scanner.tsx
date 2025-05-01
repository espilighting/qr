import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QrScannerProps {
  tipo: 'salida' | 'entrada';
}

export const QrScanner: React.FC<QrScannerProps> = ({ tipo }) => {
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const scannerId = 'qr-scanner'; // ID que usaremos para el div
  const scannerInstance = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (scannerInstance.current) {
      scannerInstance.current.clear().catch(err => console.error('Error al limpiar escáner anterior:', err));
    }

    const scanner = new Html5QrcodeScanner(
      scannerId,
      {
        fps: 10,
        qrbox: 250,
      },
      false
    );

    scanner.render(
      (decodedText) => {
        setScannedCode(decodedText);
        scanner.clear(); // Detiene el escáner al obtener un resultado

        fetch(`http://localhost:5050/api/${tipo}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ codigo_qr: decodedText }),
        })
          .then((response) => response.json())
          .then((data) => {
            alert(`Movimiento registrado: ${data.mensaje}`);
            setScannedCode(null); // Limpiar código escaneado
          })
          .catch((error) => {
            console.error('Error al registrar movimiento:', error);
            alert('Hubo un problema registrando el movimiento.');
          });
      },
      (errorMessage) => {
        console.warn('Error de escaneo:', errorMessage);
      }
    );

    scannerInstance.current = scanner;

    return () => {
      scanner.clear().catch((err) => console.error('Error al desmontar escáner:', err));
    };
  }, [tipo]);

  return (
    <div>
      <h2>Escanear Código QR para {tipo === 'salida' ? 'Salida' : 'Entrada'}</h2>
      <div id={scannerId} style={{ width: '100%', height: '500px' }}></div>
      {scannedCode && <p>Código escaneado: {scannedCode}</p>}
    </div>
  );
};
