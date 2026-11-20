import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmployeeList from './components/EmployeeList';
import ReceiptView from './components/ReceiptView';
import BatchPrintModal from './components/BatchPrintModal';
import SettingsModal from './components/SettingsModal';
import SheetSyncModal from './components/SheetSyncModal';
import defaultEmployees from './data/defaultEmployees.json';
import { Printer, Check, Copy, FileText, Layers, Scissors } from 'lucide-react';
import { formatBs } from './utils/formatters';

const DEFAULT_CONFIG = {
  companyName: 'PLAN MEDICO SALUD ZULIA, C.A',
  rif: 'J 29767801-8',
  address: 'Calle 100 Casa Nro. 19F-200 Urb. Urdaneta Sector Sabaneta, Maracaibo',
  periodFrom: '01/01/2025',
  periodTo: '31/12/2026'
};

export default function App() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('sz_employees_v1');
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [selectedEmployee, setSelectedEmployee] = useState(() => employees[0] || null);

  const [companyConfig, setCompanyConfig] = useState(() => {
    const saved = localStorage.getItem('sz_config_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure periodTo is 31/12/2026 if was previously 2025
        if (parsed.periodTo === '31/12/2025') {
          parsed.periodTo = '31/12/2026';
        }
        return parsed;
      } catch (e) {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  // Print mode: 'two_per_page' (Original + Copia) or 'single_page' (1 recibo por hoja)
  const [printMode, setPrintMode] = useState('two_per_page');

  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('sz_employees_v1', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('sz_config_v1', JSON.stringify(companyConfig));
  }, [companyConfig]);

  // URL param selection e.g. ?ci=22174172 or ?id=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ciParam = params.get('ci');
    const idParam = params.get('id');

    if (ciParam) {
      const found = employees.find(e => e.cedula.replace(/\D/g, '') === ciParam.replace(/\D/g, ''));
      if (found) setSelectedEmployee(found);
    } else if (idParam) {
      const found = employees.find(e => String(e.id) === idParam);
      if (found) setSelectedEmployee(found);
    }
  }, [employees]);

  const handlePrintCurrent = () => {
    window.print();
  };

  const handleCopyDirectLink = () => {
    if (!selectedEmployee) return;
    const cleanCI = selectedEmployee.cedula.replace(/\D/g, '');
    const url = `${window.location.origin}${window.location.pathname}?ci=${cleanCI}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalNetoBs = employees.reduce((sum, e) => sum + (e.totalCancelarNum || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        employeesCount={employees.length}
        totalNetoBs={totalNetoBs}
        currentEmployee={selectedEmployee}
        onOpenBatchPrint={() => setIsBatchPrintOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onPrintCurrent={handlePrintCurrent}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar */}
        <EmployeeList
          employees={employees}
          selectedId={selectedEmployee?.id}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
        />

        {/* Right / Center: Receipt View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          {/* Quick Action Bar */}
          <div className="no-print w-full max-w-[800px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            {/* Format Toggle: 2 por hoja vs 1 por hoja */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Scissors className="w-3.5 h-3.5 text-emerald-600" />
                Formato de hoja:
              </span>
              <div className="bg-slate-100 p-0.5 rounded-lg flex gap-1 text-xs">
                <button
                  onClick={() => setPrintMode('two_per_page')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    printMode === 'two_per_page'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Imprime 2 recibos en una sola hoja carta: Original para el trabajador y Copia para archivo"
                >
                  2 en 1 hoja (Original + Copia)
                </button>
                <button
                  onClick={() => setPrintMode('single_page')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                    printMode === 'single_page'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Imprime 1 recibo en la hoja completa"
                >
                  1 por hoja
                </button>
              </div>
            </div>

            {/* Actions: Share & Print */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDirectLink}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition cursor-pointer"
                title="Copiar enlace directo a este recibo"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Compartir Enlace</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrintCurrent}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Paper View Container */}
          <div className="receipt-container w-full max-w-[800px] bg-white rounded-xl shadow-lg border border-slate-200/80 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 print:p-0">
            {selectedEmployee ? (
              <ReceiptView
                employee={selectedEmployee}
                companyConfig={companyConfig}
                printMode={printMode}
              />
            ) : (
              <div className="p-12 text-center text-slate-400">
                Seleccione un empleado de la lista para ver su recibo.
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="no-print mt-6 text-center text-xs text-slate-500 max-w-md">
            💡 <strong>Modo 2 en 1 hoja:</strong> Al imprimir, la hoja se dividirá automáticamente en dos recibos (uno para el empleado y otro para el archivo de la empresa) con una línea punteada central para cortar.
          </div>
        </main>
      </div>

      {/* Modals */}
      <BatchPrintModal
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        employees={employees}
        companyConfig={companyConfig}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        companyConfig={companyConfig}
        onSave={(cfg) => setCompanyConfig(cfg)}
      />

      <SheetSyncModal
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        currentCount={employees.length}
        onUpdateEmployees={(newEmps) => {
          setEmployees(newEmps);
          if (newEmps.length > 0) setSelectedEmployee(newEmps[0]);
        }}
      />
    </div>
  );
}
