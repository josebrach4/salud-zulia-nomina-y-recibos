import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import EmployeeList from './components/EmployeeList';
import ReceiptView from './components/ReceiptView';
import BatchPrintModal from './components/BatchPrintModal';
import SettingsModal from './components/SettingsModal';
import SheetSyncModal from './components/SheetSyncModal';
import defaultEmployees from './data/defaultEmployees.json';
import { Printer, Check, Copy, Share2, ExternalLink, Download } from 'lucide-react';
import { formatBs, formatUSD } from './utils/formatters';

const DEFAULT_CONFIG = {
  companyName: 'PLAN MEDICO SALUD ZULIA, C.A',
  rif: 'J 29767801-8',
  address: 'Calle 100 Casa Nro. 19F-200 Urb. Urdaneta Sector Sabaneta, Maracaibo',
  periodFrom: '01/01/2025',
  periodTo: '31/12/2025'
};

export default function App() {
  const [employees, setEmployees] = useState(() => {
    const saved = localStorage.getItem('sz_employees_v1');
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  const [selectedEmployee, setSelectedEmployee] = useState(() => employees[0] || null);

  const [companyConfig, setCompanyConfig] = useState(() => {
    const saved = localStorage.getItem('sz_config_v1');
    return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
  });

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

  // Totals calculations
  const totalNetoBs = employees.reduce((sum, e) => sum + (e.totalCancelarNum || 0), 0);
  const totalNetoUSD = employees.reduce((sum, e) => sum + (e.totalUsdNum || e.usdEquivNum || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <Header
        employeesCount={employees.length}
        totalNetoBs={totalNetoBs}
        totalNetoUSD={totalNetoUSD}
        currentEmployee={selectedEmployee}
        onOpenBatchPrint={() => setIsBatchPrintOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSync={() => setIsSyncOpen(true)}
        onPrintCurrent={handlePrintCurrent}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar: Employee Search & Selector */}
        <EmployeeList
          employees={employees}
          selectedId={selectedEmployee?.id}
          onSelectEmployee={(emp) => setSelectedEmployee(emp)}
        />

        {/* Right / Center: Interactive Preview & Print Action */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
          {/* Top Quick Bar for Current Receipt */}
          <div className="no-print w-full max-w-[800px] mb-4 flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Trabajador seleccionado:
              </span>
              <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                {selectedEmployee?.nombre} ({selectedEmployee?.cargo})
              </span>
            </div>

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
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition active:scale-95 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir / PDF
              </button>
            </div>
          </div>

          {/* Paper View Container with Card styling for screen, pure sheet for print */}
          <div className="receipt-container w-full max-w-[800px] bg-white rounded-xl shadow-lg border border-slate-200/80 print:shadow-none print:border-none print:w-full print:max-w-none print:m-0 print:p-0">
            {selectedEmployee ? (
              <ReceiptView
                employee={selectedEmployee}
                companyConfig={companyConfig}
              />
            ) : (
              <div className="p-12 text-center text-slate-400">
                Seleccione un empleado de la lista para ver su recibo.
              </div>
            )}
          </div>

          {/* Quick instructions footer */}
          <div className="no-print mt-6 text-center text-xs text-slate-500 max-w-md">
            💡 <strong>Consejo para imprimir:</strong> Al hacer clic en <em>Imprimir / PDF</em>, en el menú de impresión de tu navegador selecciona <strong>Guardar como PDF</strong> o tu impresora física. La página ya está optimizada para tamaño carta.
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
