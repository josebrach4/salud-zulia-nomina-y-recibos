// Formateador de moneda venezolana: 160.920,00
export function formatBs(value) {
  if (value === undefined || value === null || value === '') return 'Bs. 0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/\./g, '').replace(',', '.'));
  if (isNaN(num)) return 'Bs. 0,00';
  
  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  return `Bs. ${integerPart},${decimalPart}`;
}

export function formatUSD(value) {
  if (value === undefined || value === null || value === '') return '$ 0,00';
  const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return '$ 0,00';

  const parts = num.toFixed(2).split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decimalPart = parts[1];
  return `$ ${integerPart},${decimalPart}`;
}

export function cleanNumber(str) {
  if (!str) return 0;
  if (typeof str === 'number') return str;
  const cleaned = String(str).replace(/[^0-9,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
