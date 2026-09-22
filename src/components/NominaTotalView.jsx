import React, { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';

export default function NominaTotalView({ employees }) {
  const [tasa, setTasa] = useState('980');
  const [payrollData, setPayrollData] = useState({});

  const activeEmployees = employees.filter(emp => emp.tipoMovimiento === "160");

  useEffect(() => {
    const newData = { ...payrollData };
    let changed = false;

    activeEmployees.forEach(emp => {
      if (!newData[emp.id]) {
        newData[emp.id] = {
          diasLaborados: "11",
          diasDescanso: "4",
          diasFeriados: "0",
          domingosTrabajados: "0",
          horasExtras: "0",
          bonoNocturno: "0"
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

  const getComputedData = (emp, data) => {
    const raw = data || {};
    const salDolares = parseFloat(emp.salario || 0);
    const tasaNum = parseFloat(tasa || 1);
    const salBs = salDolares * tasaNum;
    const diarioBs = salBs / 30;
    const horaBs = diarioBs / 8;

    const qty = (field) => parseFloat(raw[field] || 0);

    const dLaborados = qty('diasLaborados');
    const montoLaborados = dLaborados * diarioBs;

    const dDescanso = qty('diasDescanso');
    const montoDescanso = dDescanso * diarioBs;

    const totalQuincena = montoLaborados + montoDescanso;

    const hExtras = qty('horasExtras');
    const montoExtras = hExtras * horaBs * 1.5;

    const hNocturno = qty('bonoNocturno');
    const montoNocturno = hNocturno * horaBs * 0.3;

    const dFeriados = qty('diasFeriados');
    const montoFeriados = dFeriados * diarioBs * 1.5; // Example, adjust if needed

    const dDomingos = qty('domingosTrabajados');
    const montoDomingos = dDomingos * diarioBs * 1.5; // Example, adjust if needed

    const totalAsignaciones = totalQuincena + montoExtras + montoNocturno + montoFeriados + montoDomingos;

    const sso = parseFloat(emp.sso || "6.00");
    const faov = parseFloat(emp.faov || "6.50");
    const spf = parseFloat(emp.spf || "1.50");

    const totalDeducciones = sso + faov + spf;

    const totalCancelarBs = totalAsignaciones - totalDeducciones;
    const totalCancelarDolares = totalCancelarBs / tasaNum;

    const bonoQuincenal = parseFloat(emp.bonoQuincenal || 0);
    const difDolares = bonoQuincenal - totalCancelarDolares;

    return {
      salBs,
      diarioBs,
      horaBs,
      montoLaborados,
      montoDescanso,
      totalQuincena,
      montoExtras,
      montoNocturno,
      montoFeriados,
      montoDomingos,
      totalAsignaciones,
      sso, faov, spf,
      totalDeducciones,
      totalCancelarBs,
      totalCancelarDolares,
      bonoQuincenal,
      difDolares
    };
  };

  // Calculate grand totals
  let sumSalarioMensual = 0;
  let sumTotalAsignaciones = 0;
  let sumTotalDeducciones = 0;
  let sumTotalCancelarBs = 0;
  let sumTotalCancelarDolares = 0;
  let sumBonoQuincenal = 0;
  let sumDifDolares = 0;

  return (
    <div className="table-container" style={{ padding: '2rem' }}>
      <div className="table-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Nómina Total (Excel)</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Vista general de la nómina con cálculos automáticos basados en la tasa de cambio.</p>
        </div>
        <div style={{ backgroundColor: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #f59e0b', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ fontWeight: 'bold', color: '#b45309' }}>TASA (Bs/$):</label>
          <input 
            type="number" 
            step="0.01" 
            className="form-control" 
            value={tasa} 
            onChange={e => setTasa(e.target.value)} 
            style={{ width: '150px', fontSize: '1.1rem', fontWeight: 'bold' }}
          />
        </div>
      </div>
      
      <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', maxHeight: '70vh' }}>
        <table style={{ minWidth: '2500px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
          <thead style={{ backgroundColor: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th rowSpan="2" style={{ position: 'sticky', left: 0, backgroundColor: '#f8fafc', zIndex: 11, borderRight: '2px solid #ccc' }}>No.</th>
              <th rowSpan="2" style={{ position: 'sticky', left: '40px', backgroundColor: '#f8fafc', zIndex: 11, borderRight: '2px solid #ccc' }}>EMPLEADO</th>
              <th colSpan="5" style={{ textAlign: 'center', borderRight: '2px solid #ccc', backgroundColor: '#e2e8f0' }}>DATOS BÁSICOS</th>
              <th colSpan="10" style={{ textAlign: 'center', borderRight: '2px solid #ccc', backgroundColor: '#dbeafe' }}>ASIGNACIONES (Bs)</th>
              <th colSpan="4" style={{ textAlign: 'center', borderRight: '2px solid #ccc', backgroundColor: '#fce7f3' }}>DEDUCCIONES (Bs)</th>
              <th colSpan="4" style={{ textAlign: 'center', backgroundColor: '#dcfce3' }}>TOTALES Y DÓLARES</th>
            </tr>
            <tr>
              <th>FECHA INGRESO</th>
              <th>CÉDULA</th>
              <th>CARGO</th>
              <th>SALARIO MENSUAL Bs</th>
              <th style={{ borderRight: '2px solid #ccc' }}>SALARIO DIARIO Bs</th>
              
              <th>S. POR HORA Bs</th>
              <th>D. LABORADOS</th>
              <th>MONTO D. TRAB.</th>
              <th>D. DESC.</th>
              <th>MONTO D. DESC.</th>
              <th style={{ backgroundColor: '#bfdbfe', fontWeight: 'bold' }}>TOTAL QUINCENA</th>
              <th>HORAS EXTRAS</th>
              <th>MONTO EXTRAS</th>
              <th>HORAS NOCT.</th>
              <th>MONTO NOCT.</th>
              <th>D. FERIADOS</th>
              <th>MONTO FERIADOS</th>
              <th>DOMINGOS</th>
              <th>MONTO DOMINGOS</th>
              <th style={{ borderRight: '2px solid #ccc', backgroundColor: '#93c5fd', fontWeight: 'bold' }}>TOTAL ASIGN.</th>

              <th>SSO</th>
              <th>FAOV</th>
              <th>SPF</th>
              <th style={{ borderRight: '2px solid #ccc', backgroundColor: '#fbcfe8', fontWeight: 'bold' }}>TOTAL DEDUC.</th>

              <th style={{ backgroundColor: '#bbf7d0', fontWeight: 'bold' }}>TOTAL A CANCELAR Bs</th>
              <th>DÓLAR (Quincena)</th>
              <th>BONO QUINCENAL $</th>
              <th>DIF. EN $</th>
            </tr>
          </thead>
          <tbody>
            {activeEmployees.map((emp, index) => {
              const data = payrollData[emp.id] || {};
              const computed = getComputedData(emp, data);
              const fm = (val) => val.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
              
              // Add to grand totals
              sumSalarioMensual += computed.salBs;
              sumTotalAsignaciones += computed.totalAsignaciones;
              sumTotalDeducciones += computed.totalDeducciones;
              sumTotalCancelarBs += computed.totalCancelarBs;
              sumTotalCancelarDolares += computed.totalCancelarDolares;
              sumBonoQuincenal += computed.bonoQuincenal;
              sumDifDolares += computed.difDolares;

              return (
                <tr key={emp.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 1, borderRight: '2px solid #ccc' }}>{index + 1}</td>
                  <td style={{ position: 'sticky', left: '40px', backgroundColor: '#fff', zIndex: 1, borderRight: '2px solid #ccc', fontWeight: 'bold' }}>{emp.nombresApellidos}</td>
                  <td>{emp.fechaIngreso}</td>
                  <td>{emp.cedula}</td>
                  <td>{emp.cargo}</td>
                  <td style={{ fontWeight: 'bold' }}>{fm(computed.salBs)}</td>
                  <td style={{ borderRight: '2px solid #ccc' }}>{fm(computed.diarioBs)}</td>

                  <td>{fm(computed.horaBs)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.diasLaborados || ''} onChange={e => handleInputChange(emp.id, 'diasLaborados', e.target.value)} /></td>
                  <td>{fm(computed.montoLaborados)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.diasDescanso || ''} onChange={e => handleInputChange(emp.id, 'diasDescanso', e.target.value)} /></td>
                  <td>{fm(computed.montoDescanso)}</td>
                  <td style={{ backgroundColor: '#eff6ff', fontWeight: 'bold' }}>{fm(computed.totalQuincena)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.horasExtras || ''} onChange={e => handleInputChange(emp.id, 'horasExtras', e.target.value)} /></td>
                  <td>{fm(computed.montoExtras)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.bonoNocturno || ''} onChange={e => handleInputChange(emp.id, 'bonoNocturno', e.target.value)} /></td>
                  <td>{fm(computed.montoNocturno)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.diasFeriados || ''} onChange={e => handleInputChange(emp.id, 'diasFeriados', e.target.value)} /></td>
                  <td>{fm(computed.montoFeriados)}</td>
                  <td><input type="number" style={{ width: '50px', padding: '2px' }} value={data.domingosTrabajados || ''} onChange={e => handleInputChange(emp.id, 'domingosTrabajados', e.target.value)} /></td>
                  <td>{fm(computed.montoDomingos)}</td>
                  <td style={{ borderRight: '2px solid #ccc', backgroundColor: '#dbeafe', fontWeight: 'bold' }}>{fm(computed.totalAsignaciones)}</td>

                  <td>{fm(computed.sso)}</td>
                  <td>{fm(computed.faov)}</td>
                  <td>{fm(computed.spf)}</td>
                  <td style={{ borderRight: '2px solid #ccc', backgroundColor: '#fce7f3', fontWeight: 'bold' }}>{fm(computed.totalDeducciones)}</td>

                  <td style={{ backgroundColor: '#dcfce3', fontWeight: 'bold', fontSize: '0.85rem' }}>{fm(computed.totalCancelarBs)}</td>
                  <td style={{ backgroundColor: '#f8fafc', fontWeight: 'bold' }}>{fm(computed.totalCancelarDolares)}</td>
                  <td style={{ backgroundColor: '#fef9c3', fontWeight: 'bold' }}>{fm(computed.bonoQuincenal)}</td>
                  <td style={{ backgroundColor: '#fef08a', fontWeight: 'bold', color: computed.difDolares < 0 ? 'red' : 'black' }}>{fm(computed.difDolares)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: '#f1f5f9', fontWeight: 'bold', zIndex: 10 }}>
            <tr>
              <td colSpan="5" style={{ textAlign: 'right', padding: '0.5rem', borderRight: '2px solid #ccc' }}>TOTALES ({activeEmployees.length} EMPLEADOS)</td>
              <td>{sumSalarioMensual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td colSpan="14" style={{ borderRight: '2px solid #ccc' }}></td>
              <td style={{ borderRight: '2px solid #ccc', backgroundColor: '#dbeafe' }}>{sumTotalAsignaciones.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td colSpan="3"></td>
              <td style={{ borderRight: '2px solid #ccc', backgroundColor: '#fce7f3' }}>{sumTotalDeducciones.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ backgroundColor: '#dcfce3', fontSize: '0.9rem' }}>{sumTotalCancelarBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{sumTotalCancelarDolares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ backgroundColor: '#fef9c3' }}>{sumBonoQuincenal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ backgroundColor: '#fef08a' }}>{sumDifDolares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
