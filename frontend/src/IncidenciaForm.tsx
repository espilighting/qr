import React, { useState } from 'react';

interface IncidenciaFormProps {
  onSubmit: (data: { incidencia: string; descripcion: string; registradoPor: string }) => void;
  onCancel: () => void;
}

export const IncidenciaForm: React.FC<IncidenciaFormProps> = ({ onSubmit, onCancel }) => {
  const [incidencia, setIncidencia] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [registradoPor, setRegistradoPor] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ incidencia, descripcion, registradoPor });
    setIncidencia('');
    setDescripcion('');
    setRegistradoPor('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
      <h3>Registrar Incidencia</h3>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="incidencia">Tipo de Incidencia</label>
        <input
          id="incidencia"
          name="incidencia"
          type="text"
          value={incidencia}
          onChange={(e) => setIncidencia(e.target.value)}
          placeholder="Ej. Cable roto, Aparato dañado, etc."
          required
          style={{ width: '100%' }}
          autoComplete="off"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="descripcion">Descripción</label>
        <textarea
          id="descripcion"
          name="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa el problema"
          required
          style={{ width: '100%' }}
          autoComplete="off"
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="registradoPor">Registrado por</label>
        <input
          id="registradoPor"
          name="registradoPor"
          type="text"
          value={registradoPor}
          onChange={(e) => setRegistradoPor(e.target.value)}
          placeholder="Tu nombre"
          required
          style={{ width: '100%' }}
          autoComplete="off"
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button type="submit">Registrar</button>
        <button
          type="button"
          onClick={onCancel}
          style={{ backgroundColor: '#eee', color: '#333', border: '1px solid #aaa' }}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
