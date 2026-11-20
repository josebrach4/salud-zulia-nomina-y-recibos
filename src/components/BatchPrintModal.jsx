import React, { useState } from 'react';
import { Printer, X, CheckSquare, Square, FileText } from 'lucide-react';
import ReceiptView from './ReceiptView';

export default function BatchPrintModal({
  isOpen,
  onClose,
  employees,
  companyConfig
}) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(employees.map(e => e.id)));
  const [filterDept, setFilterDept] = useState('ALL');
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

  // Departments
  const departments = Array.from(new Set(employees.map(e => e.departamento))).sort();

  const handleToggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(employees.map(e => e.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const selectedList = employees.filter(e => selectedIds.has(e.id));

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="no-print bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Impresión Masiva de Recibos
              </h2>
              <p className="text-xs text-slate-500">
                Seleccione los empleados para generar sus recibos en lote
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Selection Controls */}
        <div className="p-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="text-blue-600 hover:underline font-semibold"
            >
              Seleccionar Todos ({employees.length})
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleDeselectAll}
              className="text-slate-500 hover:underline"
            >
              Deseleccionar
            </button>
          </div>

          <div className="font-semibold text-slate-700">
            {selectedList.length} seleccionados para imprimir
          </div>
        </div>

        {/* Employee Checkboxes */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 max-h-[450px]">
          {employees.map(emp => {
            const checked = selectedIds.has(emp.id);
            return (
              <label
                key={emp.id}
                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleToggle(emp.id)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-slate-900 truncate">
                    {emp.nombre}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {emp.cargo} • V-{emp.cedula}
                  </div>
                </div>
                <div className="text-xs font-bold text-slate-800 shrink-0">
                  {emp.totalCancelar || emp.utilidadesBruto}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
          <div className="text-xs text-slate-500">
            Cada recibo se imprimirá en una página separada lista para entregar.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancelar
            </button>
            <button
              disabled={selectedList.length === 0}
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir {selectedList.length} Recibos
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable container for all selected receipts */}
      <div className="hidden print:block print-container">
        {selectedList.map((emp, idx) => (
          <div key={emp.id} className={idx < selectedList.length - 1 ? 'page-break' : ''}>
            <ReceiptView employee={emp} companyConfig={companyConfig} />
          </div>
        ))}
      </div>
    </div>
  );
}
