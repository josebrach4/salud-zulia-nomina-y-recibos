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

    const hExtras = qty('horasExtras');
    const montoExtras = hExtras * horaBs * 1.5;

    const hNocturno = qty('bonoNocturno');
    const montoNocturno = hNocturno * horaBs * 1.3;

    const dFeriados = qty('diasFeriados');
    const montoFeriados = dFeriados * diarioBs * 1.5;

    const dDomingos = qty('domingosTrabajados');
    const montoDomingos = dDomingos * diarioBs * 2;

    const guardiasAdicionales = qty('guardiasAdicionales'); // Info only, no sum

    const dDescanso = qty('diasDescanso');
    let sDiarioDescanso = 0;
    if (dLaborados > 0) {
      sDiarioDescanso = (montoLaborados + montoExtras + montoNocturno + montoFeriados + montoDomingos) / dLaborados;
    }
    const montoDescanso = dDescanso * sDiarioDescanso;

    const totalQuincena = montoLaborados + montoDescanso;
    const totalAsignaciones = totalQuincena + montoExtras + montoNocturno + montoFeriados + montoDomingos;

    const sso = parseFloat(emp.sso || "6.00");
    const faov = parseFloat(emp.faov || "6.50");
    const spf = parseFloat(emp.spf || "1.50");

    const totalDeducciones = sso + faov + spf;

    const totalCancelarBs = totalAsignaciones - totalDeducciones;
    const totalCancelarDolares = tasaNum > 0 ? totalCancelarBs / tasaNum : 0;

    const bonoQuincenal = parseFloat(emp.bonoQuincenal || 0);
    const difDolares = bonoQuincenal - totalCancelarDolares;

    return {
      salBs,
      diarioBs,
      horaBs,
      montoLaborados,
      sDiarioDescanso,
      montoDescanso,
      totalQuincena,
      montoExtras,
      montoNocturno,
      montoFeriados,
      montoDomingos,
      guardiasAdicionales,
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
      
      <div className="table-wrapper" style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '0.5rem', maxHeight: '75vh', width: '100%' }}>
        <table className="nomina-table" style={{ minWidth: 'max-content', fontSize: '0.75rem', whiteSpace: 'nowrap', borderCollapse: 'collapse' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <tr>
              <th rowSpan="2" style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>No.</th>
              <th rowSpan="2" style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>EMPLEADO</th>
              <th colSpan="5" style={{ textAlign: 'center', border: '1px solid #ccc', backgroundColor: '#e2e8f0' }}>DATOS BÁSICOS</th>
              <th colSpan="12" style={{ textAlign: 'center', border: '1px solid #ccc', backgroundColor: '#dbeafe' }}>ASIGNACIONES (Bs)</th>
              <th colSpan="4" style={{ textAlign: 'center', border: '1px solid #ccc', backgroundColor: '#fce7f3' }}>DEDUCCIONES (Bs)</th>
              <th colSpan="4" style={{ textAlign: 'center', border: '1px solid #ccc', backgroundColor: '#dcfce3' }}>TOTALES Y DÓLARES</th>
            </tr>
            <tr>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>FECHA INGRESO</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>CÉDULA</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>CARGO</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>SALARIO MENS. Bs</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>SALARIO DIARIO Bs</th>
              
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>S. HORA Bs</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>D. LAB</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>MONTO D. TRAB.</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>D. DESC</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>S. DIARIO DESC.</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>T. DESCANSO</th>
              <th style={{ backgroundColor: '#bfdbfe', border: '1px solid #ccc', fontWeight: 'bold' }}>TOTAL QUINCENA</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>H. EXTRAS</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>MONTO EXTRAS</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>GUARDIAS</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>H. NOCT.</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>MONTO NOCT.</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>D. FER.</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>MONTO FERIADOS</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>DOMINGOS</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>MONTO DOMINGOS</th>
              <th style={{ backgroundColor: '#93c5fd', border: '1px solid #ccc', fontWeight: 'bold' }}>TOTAL ASIGN.</th>

              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>SSO</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>FAOV</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>SPF</th>
              <th style={{ backgroundColor: '#fbcfe8', border: '1px solid #ccc', fontWeight: 'bold' }}>TOTAL DEDUC.</th>

              <th style={{ backgroundColor: '#bbf7d0', border: '1px solid #ccc', fontWeight: 'bold' }}>TOTAL CANCELAR Bs</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>DÓLAR (Quincena)</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>BONO QUINC. $</th>
              <th style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc' }}>DIF. EN $</th>
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
                  <td style={{ backgroundColor: '#fff', border: '1px solid #ccc' }}>{index + 1}</td>
                  <td style={{ backgroundColor: '#fff', border: '1px solid #ccc', fontWeight: 'bold' }}>{emp.nombresApellidos}</td>
                  <td style={{ border: '1px solid #ccc' }}>{emp.fechaIngreso}</td>
                  <td style={{ border: '1px solid #ccc' }}>{emp.cedula}</td>
                  <td style={{ border: '1px solid #ccc' }}>{emp.cargo}</td>
                  <td style={{ fontWeight: 'bold', border: '1px solid #ccc' }}>{fm(computed.salBs)}</td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.diarioBs)}</td>

                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.horaBs)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.diasLaborados || ''} onChange={e => handleInputChange(emp.id, 'diasLaborados', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoLaborados)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.diasDescanso || ''} onChange={e => handleInputChange(emp.id, 'diasDescanso', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc', backgroundColor: '#f8fafc' }}>{fm(computed.sDiarioDescanso)}</td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoDescanso)}</td>
                  <td style={{ backgroundColor: '#eff6ff', border: '1px solid #ccc', fontWeight: 'bold' }}>{fm(computed.totalQuincena)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.horasExtras || ''} onChange={e => handleInputChange(emp.id, 'horasExtras', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoExtras)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.guardiasAdicionales || ''} onChange={e => handleInputChange(emp.id, 'guardiasAdicionales', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.bonoNocturno || ''} onChange={e => handleInputChange(emp.id, 'bonoNocturno', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoNocturno)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.diasFeriados || ''} onChange={e => handleInputChange(emp.id, 'diasFeriados', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoFeriados)}</td>
                  <td style={{ border: '1px solid #ccc' }}><input type="number" style={{ width: '40px', padding: '2px' }} value={data.domingosTrabajados || ''} onChange={e => handleInputChange(emp.id, 'domingosTrabajados', e.target.value)} /></td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.montoDomingos)}</td>
                  <td style={{ backgroundColor: '#dbeafe', border: '1px solid #ccc', fontWeight: 'bold' }}>{fm(computed.totalAsignaciones)}</td>

                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.sso)}</td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.faov)}</td>
                  <td style={{ border: '1px solid #ccc' }}>{fm(computed.spf)}</td>
                  <td style={{ backgroundColor: '#fce7f3', border: '1px solid #ccc', fontWeight: 'bold' }}>{fm(computed.totalDeducciones)}</td>

                  <td style={{ backgroundColor: '#dcfce3', border: '1px solid #ccc', fontWeight: 'bold', fontSize: '0.85rem' }}>{fm(computed.totalCancelarBs)}</td>
                  <td style={{ backgroundColor: '#f8fafc', border: '1px solid #ccc', fontWeight: 'bold' }}>{fm(computed.totalCancelarDolares)}</td>
                  <td style={{ backgroundColor: '#fef9c3', border: '1px solid #ccc', fontWeight: 'bold' }}>{fm(computed.bonoQuincenal)}</td>
                  <td style={{ backgroundColor: '#fef08a', border: '1px solid #ccc', fontWeight: 'bold', color: computed.difDolares < 0 ? 'red' : 'black' }}>{fm(computed.difDolares)}</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot style={{ position: 'sticky', bottom: 0, backgroundColor: '#f1f5f9', fontWeight: 'bold', zIndex: 10 }}>
            <tr>
              <td colSpan="5" style={{ textAlign: 'right', padding: '0.5rem', border: '1px solid #ccc' }}>TOTALES ({activeEmployees.length} EMPLEADOS)</td>
              <td style={{ border: '1px solid #ccc' }}>{sumSalarioMensual.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td colSpan="17" style={{ border: '1px solid #ccc' }}></td>
              <td style={{ border: '1px solid #ccc', backgroundColor: '#dbeafe' }}>{sumTotalAsignaciones.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td colSpan="3" style={{ border: '1px solid #ccc' }}></td>
              <td style={{ border: '1px solid #ccc', backgroundColor: '#fce7f3' }}>{sumTotalDeducciones.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ border: '1px solid #ccc', backgroundColor: '#dcfce3', fontSize: '0.9rem' }}>{sumTotalCancelarBs.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ border: '1px solid #ccc' }}>{sumTotalCancelarDolares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ border: '1px solid #ccc', backgroundColor: '#fef9c3' }}>{sumBonoQuincenal.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td style={{ border: '1px solid #ccc', backgroundColor: '#fef08a' }}>{sumDifDolares.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
