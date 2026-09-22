import autoTable from 'jspdf-autotable';
import { NACIONALIDAD } from '../constants';

export const generateReceipt = (doc, employee, data, startY = 15) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // Title
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('RECIBO DE PAGO', pageWidth / 2, startY, { align: 'center' });
  
  // Top Section (Employee Info)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const yInfo = startY + 8;
  const leftColX = 14;
  const rightColX = pageWidth / 2 + 10;
  
  const empName = employee.nombresApellidos || '';
  const empId = `${NACIONALIDAD[employee.nacionalidad] || 'V'}-${employee.cedula || ''}`;
  const empCargo = employee.cargo || '';
  const empIngreso = employee.fechaIngreso || '';
  const empDpto = employee.oficina || '';
  const salMensual = parseFloat(employee.salario || 0);
  const salDiario = salMensual / 30;

  doc.text(`Empleado: ${empName}`, leftColX, yInfo);
  doc.text(`Cedula de Identidad: ${empId}`, rightColX, yInfo);
  
  doc.text(`Cargo: ${empCargo}`, leftColX, yInfo + 6);
  doc.text(`Fecha de Ingreso: ${empIngreso}`, rightColX, yInfo + 6);
  
  doc.text(`Departamento: ${empDpto}`, rightColX, yInfo + 12);
  
  doc.text(`Salario Mensual: ${salMensual.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, rightColX, yInfo + 18);
  
  doc.text(`Periodo a cancelar ${data.periodoDesde || ''} Al ${data.periodoHasta || ''}`, leftColX, yInfo + 24);
  doc.text(`Diario: ${salDiario.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`, rightColX, yInfo + 24);

  // Divider Line
  doc.line(14, yInfo + 26, pageWidth - 14, yInfo + 26);

  // Table Body (Asignaciones)
  const parseNum = (val) => parseFloat(val || 0);
  
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

  const formatMoney = (val) => val === 0 ? '0,00' : val.toLocaleString('es-VE', { minimumFractionDigits: 2 });

  const tableData = [
    ['Dias laborados', data.diasLaborados || '0', formatMoney(mLaborados), '0,00'],
    ['Dias de descanso', data.diasDescanso || '0', formatMoney(mDescanso), '0,00'],
    ['Dias feriados', data.diasFeriados || '0', formatMoney(mFeriados), '0,00'],
    ['Domingos Trabajados', data.domingosTrabajados || '0', formatMoney(mDomingos), '0,00'],
    ['Horas extras', data.horasExtras || '0', formatMoney(mHorasExtras), '0,00'],
    ['Bono nocturno', data.bonoNocturno || '0', formatMoney(mBonoNocturno), '0,00'],
  ];

  // Draw Main Table
  autoTable(doc, {
    startY: yInfo + 28,
    head: [['DESCRIPCION', '', 'ASIGNACION', 'DEDUCCION']],
    body: tableData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    headStyles: { fontStyle: 'bold', textColor: 0 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  let currentY = doc.lastAutoTable.finalY + 2;

  // Total Asignaciones Row
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL ASIGNACIONES', leftColX + 40, currentY + 4);
  doc.text(formatMoney(totalAsignaciones), leftColX + 116, currentY + 4, { align: 'right' });
  
  doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);
  currentY += 8;

  // Deducciones
  doc.setFont('helvetica', 'normal');
  const deduccionesData = [
    ['SSO', '4%', '', formatMoney(mSso)],
    ['FAOV', '1%', '', formatMoney(mFaov)],
    ['SPF', '0,50%', '', formatMoney(mSpf)]
  ];
  
  if (mOtrosDescuentos > 0) {
    deduccionesData.push(['Otros Descuentos', '', '', formatMoney(mOtrosDescuentos)]);
  }

  autoTable(doc, {
    startY: currentY,
    body: deduccionesData,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1 },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: 'right' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 2;

  // Total Deducciones
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL DEDUCCIONES', leftColX + 40, currentY + 4);
  doc.text(formatMoney(totalDeducciones), leftColX + 156, currentY + 4, { align: 'right' });
  
  doc.line(14, currentY + 6, pageWidth - 14, currentY + 6);
  currentY += 8;

  // Neto a Cobrar
  doc.setFontSize(11);
  doc.text('NETO A COBRAR', leftColX + 90, currentY + 4);
  doc.text(formatMoney(neto), leftColX + 156, currentY + 4, { align: 'right' });

  // Signatures
  currentY += 25;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('FIRMA DEL TRABAJADOR', pageWidth / 2, currentY, { align: 'center' });
  doc.text('C.I.', pageWidth / 2, currentY + 5, { align: 'center' });

  return doc;
};
