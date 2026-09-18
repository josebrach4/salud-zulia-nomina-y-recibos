import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  TIPO_MOVIMIENTO, NACIONALIDAD, GENERO, CONDICION_LABORAL, 
  NIVEL_EDUCATIVO, PROFESION 
} from '../constants';

const initialState = {
  tipoMovimiento: "160",
  oficina: "1",
  nacionalidad: "57",
  cedula: "",
  nombresApellidos: "",
  fechaNacimiento: "",
  genero: "163",
  condicionLaboral: "94",
  cargo: "",
  nivelEducativo: "111",
  profesion: "264",
  fechaIngreso: "",
  salario: "",
  fechaEgreso: "",
  montoDescuento: "",
  motivoDescuento: ""
};

export default function EmployeeModal({ isOpen, onClose, onSave, employeeToEdit }) {
  const [formData, setFormData] = useState(initialState);

  useEffect(() => {
    if (employeeToEdit) {
      setFormData({
        ...initialState,
        ...employeeToEdit
      });
    } else {
      setFormData(initialState);
    }
  }, [employeeToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateReceiptPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Salud Zulia', 14, 22);
    doc.setFontSize(12);
    doc.text('Recibo de Pago de Nómina', 14, 30);
    doc.setFontSize(10);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 38);
    
    // Employee Data
    doc.setFontSize(12);
    doc.text('Datos del Trabajador', 14, 50);
    doc.setFontSize(10);
    
    const empData = [
      ['Nombres y Apellidos:', formData.nombresApellidos, 'Cédula:', `${NACIONALIDAD[formData.nacionalidad]}-${formData.cedula}`],
      ['Cargo:', formData.cargo, 'Fecha Ingreso:', formData.fechaIngreso],
      ['Condición Laboral:', CONDICION_LABORAL[formData.condicionLaboral], 'Profesión:', PROFESION[formData.profesion]]
    ];

    autoTable(doc, {
      startY: 55,
      body: empData,
      theme: 'plain',
      styles: { cellPadding: 2, fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 35 },
        3: { cellWidth: 45 }
      }
    });

    const finalY = doc.lastAutoTable.finalY || 55;

    // Financial Details
    doc.setFontSize(12);
    doc.text('Detalles de Pago', 14, finalY + 15);
    
    const salarioBase = parseFloat(formData.salario || 0);
    const ivss = salarioBase * 0.04;
    const faov = salarioBase * 0.01;
    
    const extraDiscountAmount = parseFloat(formData.montoDescuento || 0);
    const totalDeducciones = ivss + faov + extraDiscountAmount;
    const netoPagar = salarioBase - totalDeducciones;

    const receiptBody = [
      ['Sueldo Básico', salarioBase.toLocaleString('es-VE', { minimumFractionDigits: 2 }), ''],
      ['Seguro Social (IVSS 4%)', '', ivss.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
      ['Fondo de Ahorro Obligatorio (FAOV 1%)', '', faov.toLocaleString('es-VE', { minimumFractionDigits: 2 })]
    ];

    if (extraDiscountAmount > 0) {
      receiptBody.push([
        `Descuento: ${formData.motivoDescuento || 'Otros'}`, 
        '', 
        extraDiscountAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })
      ]);
    }

    autoTable(doc, {
      startY: finalY + 20,
      head: [['Concepto', 'Asignaciones', 'Deducciones']],
      body: receiptBody,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    const finalY2 = doc.lastAutoTable.finalY || finalY + 20;

    // Totals
    autoTable(doc, {
      startY: finalY2,
      body: [
        ['Totales', salarioBase.toLocaleString('es-VE', { minimumFractionDigits: 2 }), totalDeducciones.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        ['NETO A COBRAR', '', netoPagar.toLocaleString('es-VE', { minimumFractionDigits: 2 })]
      ],
      theme: 'grid',
      styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'right' },
      }
    });

    const finalY3 = doc.lastAutoTable.finalY || finalY2;

    // Signatures
    doc.text('_________________________________', 30, finalY3 + 40);
    doc.text('Firma del Empleador', 45, finalY3 + 46);

    doc.text('_________________________________', 120, finalY3 + 40);
    doc.text('Firma del Trabajador', 135, finalY3 + 46);

    doc.save(`Recibo_Pago_${formData.cedula}.pdf`);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{employeeToEdit ? 'Editar Empleado' : 'Registrar Nuevo Empleado'}</h2>
          <button onClick={onClose} className="close-btn">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              
              <div className="form-group">
                <label>Nombres y Apellidos</label>
                <input required type="text" name="nombresApellidos" value={formData.nombresApellidos} onChange={handleChange} className="form-control" placeholder="Ej. Juan Pérez" />
              </div>

              <div className="form-group">
                <label>Nacionalidad</label>
                <select name="nacionalidad" value={formData.nacionalidad} onChange={handleChange} className="form-control">
                  {Object.entries(NACIONALIDAD).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cédula de Identidad</label>
                <input required type="text" name="cedula" value={formData.cedula} onChange={handleChange} className="form-control" placeholder="Ej. 12345678" />
              </div>

              <div className="form-group">
                <label>Fecha de Nacimiento</label>
                <input required type="text" name="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
              </div>

              <div className="form-group">
                <label>Género</label>
                <select name="genero" value={formData.genero} onChange={handleChange} className="form-control">
                  {Object.entries(GENERO).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de Movimiento</label>
                <select name="tipoMovimiento" value={formData.tipoMovimiento} onChange={handleChange} className="form-control">
                  {Object.entries(TIPO_MOVIMIENTO).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condición Laboral</label>
                <select name="condicionLaboral" value={formData.condicionLaboral} onChange={handleChange} className="form-control">
                  {Object.entries(CONDICION_LABORAL).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Cargo</label>
                <input required type="text" name="cargo" value={formData.cargo} onChange={handleChange} className="form-control" placeholder="Ej. Analista" />
              </div>

              <div className="form-group">
                <label>Nivel Educativo</label>
                <select name="nivelEducativo" value={formData.nivelEducativo} onChange={handleChange} className="form-control">
                  {Object.entries(NIVEL_EDUCATIVO).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Profesión</label>
                <select name="profesion" value={formData.profesion} onChange={handleChange} className="form-control">
                  {Object.entries(PROFESION).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Fecha de Ingreso</label>
                <input required type="text" name="fechaIngreso" value={formData.fechaIngreso} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
              </div>

              <div className="form-group">
                <label>Salario *</label>
                <input 
                  type="number" 
                  name="salario" 
                  step="0.01"
                  value={formData.salario} 
                  onChange={handleChange} 
                  required
                  className="form-control"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Oficina</label>
                <input required type="text" name="oficina" value={formData.oficina} onChange={handleChange} className="form-control" />
              </div>

              <div className="form-group">
                <label>Fecha de Egreso</label>
                <input type="text" name="fechaEgreso" value={formData.fechaEgreso} onChange={handleChange} className="form-control" placeholder="DD-MM-YYYY" />
              </div>

              <div className="form-group">
                <label>Monto Descuento</label>
                <input 
                  type="number" 
                  name="montoDescuento" 
                  step="0.01"
                  value={formData.montoDescuento} 
                  onChange={handleChange} 
                  className="form-control"
                  placeholder="0.00"
                />
              </div>

              <div className="form-group">
                <label>Motivo Descuento</label>
                <input 
                  type="text" 
                  name="motivoDescuento" 
                  value={formData.motivoDescuento} 
                  onChange={handleChange} 
                  className="form-control" 
                  placeholder="Ej. Día libre, Adelanto..." 
                />
              </div>

            </div>
          </div>
          
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            {employeeToEdit ? (
              <button type="button" onClick={generateReceiptPDF} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--primary-color)', color: 'var(--primary-color)' }}>
                <FileText size={18} /> Generar Recibo PDF
              </button>
            ) : (
              <div></div> // Empty spacer if no employee to edit
            )}
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="button" onClick={onClose} className="btn btn-outline">Cancelar</button>
              <button type="submit" className="btn btn-primary">
                {employeeToEdit ? 'Guardar Cambios' : 'Registrar Empleado'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
