import { cleanNumber } from './formatters';

export function parseCSVData(csvText) {
  const lines = csvText.split(/\r?\n/);
  const rows = [];
  let recording = false;

  for (let line of lines) {
    if (line.includes('Nombres y Apellidos')) {
      recording = true;
    }
    if (recording && line.trim()) {
      // Regex CSV parse taking quotes into account
      const matches = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const cleanCols = matches.map(m => m.replace(/^"|"$/g, '').trim());
      if (cleanCols.length > 2) {
        rows.push(cleanCols);
      }
    }
  }

  if (rows.length < 2) return [];

  const employees = [];
  let id = 1;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const name = row[2] || '';
    if (!name || name.includes('TOTAL') || name.includes('NOTAS') || name.includes('Nombres y Apellidos')) {
      continue;
    }

    const cargo = row[3] || '';
    const cedula = (row[4] || '').replace(/,/g, '.');
    const fechaIngreso = row[5] || '';
    const antiguedad = row[6] || '';
    const sueldoMensual = row[7] || '';
    const salarioDiario = row[8] || '';
    const diasCalcular = parseInt(row[9] || '45', 10) || 45;
    const utilidadesBruto = row[10] || '';
    const dctoInces = row[11] || '';
    const descuentos = row[12] || 'Bs. 0,00';
    const totalCancelar = row[13] || '';
    const tasaCambio = row[14] || '1.006,00';
    const usdEquiv = row[15] || '';

    // Department helper
    let dept = 'GENERAL';
    const cu = cargo.toUpperCase();
    if (cargo.includes('/')) {
      dept = cargo.split('/')[1].trim();
    } else if (cu.includes('HOSP')) dept = 'HOSPITALIZACION';
    else if (cu.includes('EMERG')) dept = 'EMERGENCIA';
    else if (cu.includes('LAB')) dept = 'LABORATORIO';
    else if (cu.includes('RX') || cu.includes('RADIO')) dept = 'IMAGENOLOGIA Y RX';
    else if (cu.includes('QUIROFANO') || cu.includes('PABELLON')) dept = 'QUIROFANO';
    else if (cu.includes('CARDIO')) dept = 'CARDIOLOGIA';
    else if (cu.includes('ECOG')) dept = 'ECOGRAFIA';
    else if (cu.includes('ADMIN') || cu.includes('COMPRAS') || cu.includes('RRHH') || cu.includes('PLANIF')) dept = 'ADMINISTRACION';
    else if (cu.includes('SEGURIDAD')) dept = 'SEGURIDAD';
    else if (cu.includes('MANT') || cu.includes('LIMPIEZA') || cu.includes('CAMARERA')) dept = 'MANTENIMIENTO Y SERVICIOS';
    else if (cu.includes('ODONT')) dept = 'ODONTOLOGIA';

    employees.push({
      id: id++,
      nombre: name,
      cargo: cargo.split('/')[0].trim(),
      departamento: dept,
      cedula,
      fechaIngreso,
      antiguedad,
      sueldoMensual,
      sueldoMensualNum: cleanNumber(sueldoMensual),
      salarioDiario,
      salarioDiarioNum: cleanNumber(salarioDiario),
      diasCalcular,
      utilidadesBruto,
      utilidadesBrutoNum: cleanNumber(utilidadesBruto),
      dctoInces,
      dctoIncesNum: cleanNumber(dctoInces),
      descuentos,
      descuentosNum: cleanNumber(descuentos),
      totalCancelar,
      totalCancelarNum: cleanNumber(totalCancelar),
      tasaCambio,
      tasaCambioNum: cleanNumber(tasaCambio),
      usdEquiv
    });
  }

  return employees;
}
