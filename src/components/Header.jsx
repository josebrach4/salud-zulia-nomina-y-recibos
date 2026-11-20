import React from 'react';
import { Building2, Printer, RefreshCw, Sliders, FileSpreadsheet, Users, DollarSign } from 'lucide-react';

export default function Header({
  employeesCount,
  totalNetoBs,
  totalNetoUSD,
  onOpenSync,
  onOpenSettings,
  onOpenBatchPrint,
  onPrintCurrent,
  currentEmployee
}) {
  return (
    <header className="no-print bg-slate-900 text-white sticky top-0 z-30 shadow-md">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Plan Médico Salud Zulia
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                Utilidades 2025
              </span>
            </h1>
            <p className="text-xs text-slate-400">Sistema Generador de Recibos de Pago</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {currentEmployee && (
            <button
              onClick={onPrintCurrent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer"
              title="Imprimir el recibo del empleado actual"
            >
              <Printer className="w-4 h-4" />
              Imprimir Recibo
            </button>
          )}

          <button
            onClick={onOpenBatchPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow transition-all active:scale-95 cursor-pointer"
            title="Imprimir nómina completa o por lote"
          >
            <Users className="w-4 h-4" />
            Impresión Masiva ({employeesCount})
          </button>

          <button
            onClick={onOpenSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="Sincronizar con Google Sheets o cargar CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Google Sheets</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Configuración de empresa, período y tasas"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
