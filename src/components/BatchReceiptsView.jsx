import React, { useState, useEffect } from 'react';
import { Printer, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import { generateReceipt } from '../utils/receiptGenerator';

export default function BatchReceiptsView({ employees, searchTerm }) {
  const [selectedSede, setSelectedSede] = useState('ALL');
  const [periodo, setPeriodo] = useState('16/02/2026 Al 28/02/2026');
  const [tasa, setTasa] = useState('40.00'); // Default Tasa
  const [payrollData, setPayrollData] = useState({});

  // Unique sedes
  const sedes = [...new Set(employees.map(emp => emp.oficina).filter(Boolean))].sort();

  // Filter employees
  const activeEmployees = employees.filter(emp => emp.tipoMovimiento === "160");
  const filteredBySearch = activeEmployees.filter(emp => 
    !searchTerm || 
    emp.nombresApellidos?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cedula?.includes(searchTerm) ||
    emp.cargo?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const displayedEmployees = selectedSede === 'ALL' 
    ? filteredBySearch 
    : filteredBySearch.filter(emp => emp.oficina === selectedSede);

  // Initialize payroll data when employees change
  useEffect(() => {
    const newData = { ...payrollData };
    let changed = false;

    activeEmployees.forEach(emp => {
      if (!newData[emp.id]) {
        newData[emp.id] = {
          diasLaborados: "8",
          diasDescanso: "6",
          diasFeriados: "1",
          domingosTrabajados: "0",
          horasExtras: "0",
          bonoNocturno: "20"
        };
        changed = true;
      }
    });

    if (changed) {
      setPayrollData(newData);
    }
  }, [employees]);

  const handleInputChange = (empId, field, value) => {
    setPayrollData(prev => ({
      ...prev,
      [empId]: {
        ...prev[empId],
        [field]: value
      }
    }));
  };

  const getComputedData = (empId, empSalario) => {
    const raw = payrollData[empId] || {};
    const sal = parseFloat(empSalario || 0);
    const tasaNum = parseFloat(tasa || 1);
    const salBs = sal * tasaNum;
    const diario = salBs / 30;

    const qty = (field) => parseFloat(raw[field] || 0);

    return {
      periodo,
      salarioBs: salBs, // Used by the PDF generator instead of employee.salario
      diasLaborados: raw.diasLaborados,
      diasLaboradosMonto: (qty('diasLaborados') * diario).toFixed(2),
      diasDescanso: raw.diasDescanso,
      diasDescansoMonto: (qty('diasDescanso') * diario).toFixed(2),
      diasFeriados: raw.diasFeriados,
      diasFeriadosMonto: (qty('diasFeriados') * diario * 1.5).toFixed(2), // assuming 1.5x
      domingosTrabajados: raw.domingosTrabajados,
      domingosTrabajadosMonto: (qty('domingosTrabajados') * diario * 1.5).toFixed(2), // assuming 1.5x
      horasExtras: raw.horasExtras,
      horasExtrasMonto: (qty('horasExtras') * (diario / 8) * 1.5).toFixed(2), // assuming 1.5x
      bonoNocturno: raw.bonoNocturno,
      bonoNocturnoMonto: (qty('bonoNocturno') * (diario / 8) * 0.3).toFixed(2), // assuming 30% surcharge
      sso: (salBs * 0.04).toFixed(2),
      faov: (salBs * 0.01).toFixed(2),
      spf: (salBs * 0.005).toFixed(2),
      otrosDescuentos: "0.00"
    };
  };

  const handlePrintBatch = () => {
    if (displayedEmployees.length === 0) {
      alert("No hay empleados para imprimir.");
      return;
    }

    const doc = new jsPDF();
    
    displayedEmployees.forEach((emp, index) => {
      if (index > 0) doc.addPage();
      const computedData = getComputedData(emp.id, emp.salario);
      generateReceipt(doc, emp, computedData);
    });

    const filename = selectedSede === 'ALL' ? 'Recibos_General' : `Recibos_Sede_${selectedSede.replace(/[^a-zA-Z0-9]/g, '_')}`;
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="table-container" style={{ padding: '2rem' }}>
      <div className="table-header" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Carga de Nómina e Impresión de Recibos</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Ajusta las cantidades por empleado. Los montos se calcularán automáticamente según su salario en dólares multiplicado por la Tasa en Bs.</p>
      </div>
      
      <div className="form-grid" style={{ maxWidth: '800px', marginBottom: '2rem' }}>
        <div className="form-group">
          <label><Filter size={14} style={{ display: 'inline', marginRight: '4px' }}/> Filtrar por Sede</label>
          <select 
            className="form-control" 
            value={selectedSede} 
            onChange={(e) => setSelectedSede(e.target.value)}
          >
            <option value="ALL">Todas las Sedes (General)</option>
            {sedes.map(sede => (
              <option key={sede} value={sede}>{sede}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Tasa de Cambio (Bs)</label>
          <input type="number" step="0.01" className="form-control" value={tasa} onChange={e => setTasa(e.target.value)} />
        </div>
        <div className="form-group" style={{ gridColumn: 'span 2' }}>
          <label>Periodo (Se mostrará en el recibo)</label>
          <input type="text" className="form-control" value={periodo} onChange={e => setPeriodo(e.target.value)} />
        </div>
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gridColumn: 'span 2' }}>
          <button className="btn btn-primary" onClick={handlePrintBatch} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <Printer size={18} /> Imprimir Lote
          </button>
        </div>
      </div>

      <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
        <table style={{ minWidth: '1000px', fontSize: '0.85rem' }}>
          <thead style={{ backgroundColor: '#f8fafc' }}>
            <tr>
              <th style={{ position: 'sticky', left: 0, backgroundColor: '#f8fafc', zIndex: 1 }}>Empleado</th>
              <th>Salario M.</th>
              <th>Días Lab.</th>
              <th>Días Desc.</th>
              <th>Días Fer.</th>
              <th>Domingos</th>
              <th>Horas Ext.</th>
              <th>Bono Noct.</th>
            </tr>
          </thead>
          <tbody>
            {displayedEmployees.map(emp => {
              const data = payrollData[emp.id] || {};
              return (
                <tr key={emp.id}>
                  <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1, fontWeight: '500' }}>
                    {emp.nombresApellidos}
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>{emp.cedula} | {emp.oficina}</div>
                  </td>
                  <td>{parseFloat(emp.salario || 0).toLocaleString('es-VE')}</td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.diasLaborados || ''} onChange={e => handleInputChange(emp.id, 'diasLaborados', e.target.value)} /></td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.diasDescanso || ''} onChange={e => handleInputChange(emp.id, 'diasDescanso', e.target.value)} /></td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.diasFeriados || ''} onChange={e => handleInputChange(emp.id, 'diasFeriados', e.target.value)} /></td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.domingosTrabajados || ''} onChange={e => handleInputChange(emp.id, 'domingosTrabajados', e.target.value)} /></td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.horasExtras || ''} onChange={e => handleInputChange(emp.id, 'horasExtras', e.target.value)} /></td>
                  <td><input type="number" className="form-control" style={{ padding: '0.25rem', height: 'auto' }} value={data.bonoNocturno || ''} onChange={e => handleInputChange(emp.id, 'bonoNocturno', e.target.value)} /></td>
                </tr>
              )
            })}
            {displayedEmployees.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No hay empleados para mostrar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
