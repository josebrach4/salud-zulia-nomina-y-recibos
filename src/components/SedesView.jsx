import React, { useState } from 'react';
import { Building, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  NACIONALIDAD, CONDICION_LABORAL, PROFESION 
} from '../constants';

export default function SedesView({ employees }) {
  const [selectedSede, setSelectedSede] = useState('');

  // Get unique sedes (oficinas)
  const sedes = [...new Set(employees.map(emp => emp.oficina).filter(Boolean))].sort();

  const printReceiptsForSede = () => {
    if (!selectedSede) return;
    
    const sedeEmployees = employees.filter(emp => emp.oficina === selectedSede && emp.tipoMovimiento === "160");
    
    if (sedeEmployees.length === 0) {
      alert("No hay empleados activos en esta sede.");
      return;
    }

    const doc = new jsPDF();
    
    sedeEmployees.forEach((emp, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Header
      doc.setFontSize(18);
      doc.text('Salud Zulia', 14, 22);
      doc.setFontSize(12);
      doc.text('Recibo de Pago de Nómina', 14, 30);
      doc.setFontSize(10);
      doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, 38);
      doc.text(`Sede / Oficina: ${emp.oficina}`, 14, 44);
      
      // Employee Data
      doc.setFontSize(12);
      doc.text('Datos del Trabajador', 14, 55);
      doc.setFontSize(10);
      
      const empData = [
        ['Nombres y Apellidos:', emp.nombresApellidos, 'Cédula:', `${NACIONALIDAD[emp.nacionalidad]}-${emp.cedula}`],
        ['Cargo:', emp.cargo, 'Fecha Ingreso:', emp.fechaIngreso],
        ['Condición Laboral:', CONDICION_LABORAL[emp.condicionLaboral], 'Profesión:', PROFESION[emp.profesion]]
      ];

      autoTable(doc, {
        startY: 60,
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

      const finalY = doc.lastAutoTable.finalY || 60;

      // Financial Details
      doc.setFontSize(12);
      doc.text('Detalles de Pago', 14, finalY + 15);
      
      const salarioBase = parseFloat(emp.salario || 0);
      const ivss = salarioBase * 0.04;
      const faov = salarioBase * 0.01;
      
      const extraDiscountAmount = parseFloat(emp.montoDescuento || 0);
      const totalDeducciones = ivss + faov + extraDiscountAmount;
      const netoPagar = salarioBase - totalDeducciones;

      const receiptBody = [
        ['Sueldo Básico', salarioBase.toLocaleString('es-VE', { minimumFractionDigits: 2 }), ''],
        ['Seguro Social (IVSS 4%)', '', ivss.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
        ['Fondo de Ahorro Obligatorio (FAOV 1%)', '', faov.toLocaleString('es-VE', { minimumFractionDigits: 2 })]
      ];

      if (extraDiscountAmount > 0) {
        receiptBody.push([
          `Descuento: ${emp.motivoDescuento || 'Otros'}`, 
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
    });

    doc.save(`Recibos_Sede_${selectedSede.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="table-container" style={{ padding: '2rem' }}>
      <div className="table-header" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Impresión de Recibos por Sede</h2>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Selecciona una sede para generar un único archivo PDF con los recibos de todos sus empleados activos.</p>
      </div>
      
      <div className="form-grid" style={{ maxWidth: '600px' }}>
        <div className="form-group">
          <label>Seleccionar Sede (Oficina)</label>
          <select 
            className="form-control" 
            value={selectedSede} 
            onChange={(e) => setSelectedSede(e.target.value)}
          >
            <option value="">-- Elige una sede --</option>
            {sedes.map(sede => (
              <option key={sede} value={sede}>{sede}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className="btn btn-primary" 
            onClick={printReceiptsForSede}
            disabled={!selectedSede}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'center' }}
          >
            <Printer size={18} /> Imprimir Todos los Recibos
          </button>
        </div>
      </div>

      {selectedSede && (
        <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={20} color="var(--primary-color)" /> Resumen de {selectedSede}
          </h3>
          <p>Se generarán los recibos para <strong>{employees.filter(emp => emp.oficina === selectedSede && emp.tipoMovimiento === "160").length}</strong> empleados activos en esta sede.</p>
        </div>
      )}
    </div>
  );
}
