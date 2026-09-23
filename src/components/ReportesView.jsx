import React, { useState, useMemo } from 'react';
import { Calendar, Search } from 'lucide-react';
import { CONDICION_LABORAL, PROFESION } from '../constants';

const ReportesView = ({ employees }) => {
  const [mes, setMes] = useState('');
  const [anio, setAnio] = useState(new Date().getFullYear().toString());
  const [searchTerm, setSearchTerm] = useState('');

  // Extraer años únicos de los ingresos
  const aniosDisponibles = useMemo(() => {
    const anios = new Set();
    employees.forEach(emp => {
      if (emp.fechaIngreso) {
        // Formato esperado: DD-MM-YYYY o YYYY-MM-DD
        const parts = emp.fechaIngreso.split('-');
        if (parts.length === 3) {
          const y = parts[0].length === 4 ? parts[0] : parts[2];
          anios.add(y);
        }
      }
    });
    const aniosArr = Array.from(anios).sort().reverse();
    if (aniosArr.length === 0) aniosArr.push(new Date().getFullYear().toString());
    return aniosArr;
  }, [employees]);

  const filtrados = useMemo(() => {
    return employees.filter(emp => {
      if (!emp.fechaIngreso) return false;
      const parts = emp.fechaIngreso.split('-');
      if (parts.length !== 3) return false;
      
      let m, y;
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        y = parts[0]; m = parts[1];
      } else {
        // DD-MM-YYYY
        y = parts[2]; m = parts[1];
      }

      const matchMes = mes === '' || m === mes;
      const matchAnio = anio === '' || y === anio;
      const matchSearch = searchTerm === '' || 
        emp.nombresApellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cedula?.includes(searchTerm) ||
        emp.cargo?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchMes && matchAnio && matchSearch;
    });
  }, [employees, mes, anio, searchTerm]);

  const meses = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];

  return (
    <div className="reportes-container" style={{ padding: '2rem' }}>
      <div className="header-actions" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <Calendar size={18} color="var(--text-muted)" />
          <select value={mes} onChange={(e) => setMes(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent' }}>
            <option value="">Todos los meses</option>
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <select value={anio} onChange={(e) => setAnio(e.target.value)} style={{ border: 'none', outline: 'none', background: 'transparent' }}>
            <option value="">Todos los años</option>
            {aniosDisponibles.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', flex: '1 1 200px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, cédula o cargo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', width: '100%' }}
          />
        </div>
      </div>

      <div className="stat-card" style={{ marginBottom: '2rem', maxWidth: '300px' }}>
        <div className="stat-info">
          <h3>Total Ingresos en el periodo</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>{filtrados.length}</p>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Nombre</th>
              <th>Fecha Ingreso</th>
              <th>Cargo</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length > 0 ? (
              filtrados.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.cedula}</td>
                  <td>{emp.nombresApellidos}</td>
                  <td>{emp.fechaIngreso}</td>
                  <td>{emp.cargo}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No se encontraron ingresos para este periodo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportesView;
