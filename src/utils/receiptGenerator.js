import autoTable from 'jspdf-autotable';
import { NACIONALIDAD, CONDICION_LABORAL, PROFESION } from '../constants';

export const generateReceipt = (doc, employee, data, startY = 15) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Salud Zulia', 14, startY + 7);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Recibo de Pago de Nómina', 14, startY + 15);
  doc.setFontSize(10);
  doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString('es-VE')}`, 14, startY + 23);
  doc.text(`Periodo: ${data.periodoDesde || ''} Al ${data.periodoHasta || ''}`, 14, startY + 29);
  
  // Employee Data
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Datos del Trabajador', 14, startY + 40);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const empName = employee.nombresApellidos || '';
  const empId = `${NACIONALIDAD[employee.nacionalidad] || 'V'}-${employee.cedula || ''}`;
  const empCargo = employee.cargo || '';
  const empIngreso = employee.fechaIngreso || '';
  const empDpto = employee.oficina || '';
  const salMensual = parseFloat(employee.salario || 0);

  const empData = [
    ['Nombres y Apellidos:', empName, 'Cédula:', empId],
    ['Cargo:', empCargo, 'Fecha Ingreso:', empIngreso],
    ['Condición Laboral:', CONDICION_LABORAL[employee.condicionLaboral] || '', 'Profesión:', PROFESION[employee.profesion] || ''],
    ['Sede / Oficina:', empDpto, 'Salario Mensual:', salMensual.toLocaleString('es-VE', { minimumFractionDigits: 2 })]
  ];

  autoTable(doc, {
    startY: startY + 45,
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

  const finalY = doc.lastAutoTable.finalY;

  // Financial Details Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalles de Pago', 14, finalY + 15);
  doc.setFont('helvetica', 'normal');
  
  const parseNum = (val) => parseFloat(val || 0);
  const formatMoney = (val) => val === 0 ? '' : val.toLocaleString('es-VE', { minimumFractionDigits: 2 });
  
  const mLaborados = parseNum(data.diasLaboradosMonto);
  const mDescanso = parseNum(data.diasDescansoMonto);
  const mFeriados = parseNum(data.diasFeriadosMonto);
  const mDomingos = parseNum(data.domingosTrabajadosMonto);
  const mHorasExtras = parseNum(data.horasExtrasMonto);
  const mBonoNocturno = parseNum(data.bonoNocturnoMonto);

  const totalAsignaciones = mLaborados + mDescanso + mFeriados + mDomingos + mHorasExtras + mBonoNocturno;

  const mSso = parseNum(data.sso);
  const mFaov = parseNum(data.faov);
  const mSpf = parseNum(data.spf);
  const mOtrosDescuentos = parseNum(data.otrosDescuentos);

  const totalDeducciones = mSso + mFaov + mSpf + mOtrosDescuentos;
  const neto = totalAsignaciones - totalDeducciones;

  const receiptBody = [];
  
  // Asignaciones (Only add if > 0 or if it's Dias Laborados)
  if (mLaborados > 0 || data.diasLaborados > 0) receiptBody.push([`Días laborados (${data.diasLaborados})`, formatMoney(mLaborados), '']);
  if (mDescanso > 0 || data.diasDescanso > 0) receiptBody.push([`Días de descanso (${data.diasDescanso})`, formatMoney(mDescanso), '']);
  if (mFeriados > 0 || data.diasFeriados > 0) receiptBody.push([`Días feriados (${data.diasFeriados})`, formatMoney(mFeriados), '']);
  if (mDomingos > 0 || data.domingosTrabajados > 0) receiptBody.push([`Domingos Trabajados (${data.domingosTrabajados})`, formatMoney(mDomingos), '']);
  if (mHorasExtras > 0 || data.horasExtras > 0) receiptBody.push([`Horas extras (${data.horasExtras})`, formatMoney(mHorasExtras), '']);
  if (mBonoNocturno > 0 || data.bonoNocturno > 0) receiptBody.push([`Bono nocturno (${data.bonoNocturno})`, formatMoney(mBonoNocturno), '']);

  // Deducciones
  if (mSso > 0) receiptBody.push(['Seguro Social (SSO 4%)', '', formatMoney(mSso)]);
  if (mFaov > 0) receiptBody.push(['Fondo de Ahorro Obligatorio (FAOV 1%)', '', formatMoney(mFaov)]);
  if (mSpf > 0) receiptBody.push(['SPF (0.50%)', '', formatMoney(mSpf)]);
  if (mOtrosDescuentos > 0) receiptBody.push(['Otros Descuentos', '', formatMoney(mOtrosDescuentos)]);

  autoTable(doc, {
    startY: finalY + 20,
    head: [['Concepto', 'Asignaciones', 'Deducciones']],
    body: receiptBody,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: {
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 }
    }
  });

  const finalY2 = doc.lastAutoTable.finalY;

  // Totals
  autoTable(doc, {
    startY: finalY2,
    body: [
      ['Totales', totalAsignaciones.toLocaleString('es-VE', { minimumFractionDigits: 2 }), totalDeducciones.toLocaleString('es-VE', { minimumFractionDigits: 2 })],
      ['NETO A COBRAR', '', neto.toLocaleString('es-VE', { minimumFractionDigits: 2 })]
    ],
    theme: 'grid',
    styles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
    columnStyles: {
      0: { halign: 'right' },
      1: { halign: 'right', cellWidth: 40 },
      2: { halign: 'right', cellWidth: 40 }
    }
  });

  const finalY3 = doc.lastAutoTable.finalY;

  // Signatures
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('_________________________________', 30, finalY3 + 40);
  doc.text('Firma del Empleador', 45, finalY3 + 46);

  doc.text('_________________________________', 120, finalY3 + 40);
  doc.text('Firma del Trabajador', 135, finalY3 + 46);

  return doc;
};
