import React, { useState } from 'react';
import { Printer, X, CheckSquare, Square, FileText, Layers, Scissors } from 'lucide-react';
import ReceiptView, { SingleReceiptSlip } from './ReceiptView';

export default function BatchPrintModal({
  isOpen,
  onClose,
  employees,
  companyConfig
}) {
  const [selectedIds, setSelectedIds] = useState(() => new Set(employees.map(e => e.id)));
  const [batchMode, setBatchMode] = useState('two_per_worker'); // 'two_per_worker', 'two_different_workers', 'single'
  const [isPrinting, setIsPrinting] = useState(false);

  if (!isOpen) return null;

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

  // Group into pairs if two different workers per page
  const pairs = [];
  if (batchMode === 'two_different_workers') {
    for (let i = 0; i < selectedList.length; i += 2) {
      pairs.push([selectedList[i], selectedList[i + 1]]);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="no-print bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Impresión Masiva de Recibos
              </h2>
              <p className="text-xs text-slate-500">
                Imprima la nómina completa o empleados seleccionados
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

        {/* Print Layout Options */}
        <div className="p-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-blue-600" />
            Formato de Impresión:
          </span>
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setBatchMode('two_per_worker')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                batchMode === 'two_per_worker'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              2 por hoja (Original + Copia)
            </button>
            <button
              onClick={() => setBatchMode('two_different_workers')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                batchMode === 'two_different_workers'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Ahorro (2 empleados x hoja)
            </button>
            <button
              onClick={() => setBatchMode('single')}
              className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                batchMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              1 por hoja
            </button>
          </div>
        </div>

        {/* Selection Controls */}
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
            {selectedList.length} seleccionados
            {batchMode === 'two_different_workers' && (
              <span className="text-emerald-700 font-bold ml-1">
                (ocupará solo {Math.ceil(selectedList.length / 2)} hojas)
              </span>
            )}
            {batchMode === 'two_per_worker' && (
              <span className="text-blue-700 font-bold ml-1">
                ({selectedList.length} hojas: 2 recibos por empleado)
              </span>
            )}
          </div>
        </div>

        {/* Employee Checkboxes */}
        <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100 max-h-[380px]">
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
            {batchMode === 'two_per_worker' && 'Cada hoja carta contiene 2 copias con línea de corte.'}
            {batchMode === 'two_different_workers' && 'Se imprimen 2 empleados distintos por hoja para ahorrar papel.'}
            {batchMode === 'single' && 'Cada empleado se imprimirá en 1 hoja completa.'}
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

      {/* Hidden printable container for batch printing */}
      <div className="hidden print:block print-container">
        {batchMode === 'two_per_worker' && (
          selectedList.map((emp, idx) => (
            <div key={emp.id} className={idx < selectedList.length - 1 ? 'page-break' : ''}>
              <ReceiptView employee={emp} companyConfig={companyConfig} printMode="two_per_page" />
            </div>
          ))
        )}

        {batchMode === 'single' && (
          selectedList.map((emp, idx) => (
            <div key={emp.id} className={idx < selectedList.length - 1 ? 'page-break' : ''}>
              <ReceiptView employee={emp} companyConfig={companyConfig} printMode="single_page" />
            </div>
          ))
        )}

        {batchMode === 'two_different_workers' && (
          pairs.map((pair, idx) => (
            <div key={idx} className={idx < pairs.length - 1 ? 'page-break' : ''}>
              <div className="receipt-page bg-white text-black max-w-[800px] mx-auto">
                {pair[0] && (
                  <SingleReceiptSlip
                    employee={pair[0]}
                    companyConfig={companyConfig}
                    compact={true}
                  />
                )}
                {pair[1] && (
                  <>
                    <div className="relative py-2 select-none">
                      <div className="border-b-2 border-dashed border-gray-400 w-full"></div>
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-gray-500 font-semibold tracking-wider flex items-center gap-1.5 border border-dashed border-gray-300 rounded-full">
                        <span>✂</span>
                        <span>CORTAR AQUÍ</span>
                        <span>✂</span>
                      </div>
                    </div>
                    <SingleReceiptSlip
                      employee={pair[1]}
                      companyConfig={companyConfig}
                      compact={true}
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
