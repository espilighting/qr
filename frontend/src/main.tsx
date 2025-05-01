import React from 'react';
import { createRoot } from 'react-dom/client';
import QRScanner from './App';  // Correcta importación del componente QRScanner

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QRScanner tipo="entrada" /> {/* Inicializamos con 'entrada', puedes cambiar a 'salida' si es necesario */}
  </React.StrictMode>,
);
