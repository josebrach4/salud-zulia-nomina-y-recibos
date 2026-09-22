import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import { generateReceipt } from '../utils/receiptGenerator';

const getInitialReceiptData = (employee) => {
  const sal = parseFloat(employee?.salario || 0);
  const diario = sal / 30;
  
  return {
    periodoDesde: "16/02/2026",
    periodoHasta: "28/02/2026",
    diasLaborados: "8",
    diasLaboradosMonto: (diario * 8).toFixed(2),
    diasDescanso: "6",
    diasDescansoMonto: (diario * 6).toFixed(2),
    diasFeriados: "1",
    diasFeriadosMonto: (diario * 1.5).toFixed(2),
    domingosTrabajados: "0",
    domingosTrabajadosMonto: "0.00",
    horasExtras: "0",
    horasExtrasMonto: "0.00",
    bonoNocturno: "20",
    bonoNocturnoMonto: "4875.00",
    sso: (sal * 0.04).toFixed(2),
    faov: (sal * 0.01).toFixed(2),
    spf: (sal * 0.005).toFixed(2),
    otrosDescuentos: "0.00"
  };
};

export default function ReceiptModal({ isOpen, onClose, employee }) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (isOpen && employee) {
      setData(getInitialReceiptData(employee));
    }
  }, [isOpen, employee]);

  if (!isOpen || !employee) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    const doc = new jsPDF();
    generateReceipt(doc, employee, data);
    doc.save(`Recibo_Pago_${employee.cedula}.pdf`);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '800px' }}>
        <div className="modal-header">
          <h2>Generar Recibo: {employee.nombresApellidos}</h2>
          <button onClick={onClose} className="close-btn"><X size={24} /></button>
        </div>
        
        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group">
              <label>Periodo Desde</label>
              <input type="text" name="periodoDesde" value={data.periodoDesde} onChange={handleChange} className="form-control" />
            </div>
            <div className="form-group">
              <label>Periodo Hasta</label>
              <input type="text" name="periodoHasta" value={data.periodoHasta} onChange={handleChange} className="form-control" />
            </div>
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Asignaciones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontWeight: 'bold' }}>Concepto</label>
            <label style={{ fontWeight: 'bold' }}>Cantidad (Días/Horas)</label>
            <label style={{ fontWeight: 'bold' }}>Monto Asignación</label>
            
            <label>Días Laborados</label>
            <input type="number" name="diasLaborados" value={data.diasLaborados} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="diasLaboradosMonto" value={data.diasLaboradosMonto} onChange={handleChange} className="form-control" />

            <label>Días de Descanso</label>
            <input type="number" name="diasDescanso" value={data.diasDescanso} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="diasDescansoMonto" value={data.diasDescansoMonto} onChange={handleChange} className="form-control" />

            <label>Días Feriados</label>
            <input type="number" name="diasFeriados" value={data.diasFeriados} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="diasFeriadosMonto" value={data.diasFeriadosMonto} onChange={handleChange} className="form-control" />

            <label>Domingos Trabajados</label>
            <input type="number" name="domingosTrabajados" value={data.domingosTrabajados} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="domingosTrabajadosMonto" value={data.domingosTrabajadosMonto} onChange={handleChange} className="form-control" />

            <label>Horas Extras</label>
            <input type="number" name="horasExtras" value={data.horasExtras} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="horasExtrasMonto" value={data.horasExtrasMonto} onChange={handleChange} className="form-control" />

            <label>Bono Nocturno</label>
            <input type="number" name="bonoNocturno" value={data.bonoNocturno} onChange={handleChange} className="form-control" />
            <input type="number" step="0.01" name="bonoNocturnoMonto" value={data.bonoNocturnoMonto} onChange={handleChange} className="form-control" />
          </div>

          <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Deducciones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'center' }}>
            <div>
              <label>SSO (Monto)</label>
              <input type="number" step="0.01" name="sso" value={data.sso} onChange={handleChange} className="form-control" />
            </div>
            <div>
              <label>FAOV (Monto)</label>
              <input type="number" step="0.01" name="faov" value={data.faov} onChange={handleChange} className="form-control" />
            </div>
            <div>
              <label>SPF (Monto)</label>
              <input type="number" step="0.01" name="spf" value={data.spf} onChange={handleChange} className="form-control" />
            </div>
            <div>
              <label>Otros Descuentos (Monto)</label>
              <input type="number" step="0.01" name="otrosDescuentos" value={data.otrosDescuentos} onChange={handleChange} className="form-control" />
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
          <button type="button" onClick={handlePrint} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Imprimir Recibo
          </button>
        </div>
      </div>
    </div>
  );
}
