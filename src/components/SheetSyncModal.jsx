import React, { useState } from 'react';
import { RefreshCw, FileSpreadsheet, X, Check, Upload, AlertCircle } from 'lucide-react';
import { parseCSVData } from '../utils/csvParser';

export default function SheetSyncModal({
  isOpen,
  onClose,
  onUpdateEmployees,
  currentCount
}) {
  const [sheetUrl, setSheetUrl] = useState(
    'https://docs.google.com/spreadsheets/d/1kmjotX7NACq5ApTddK63xAc5s1WnbXfedXpdev5wsrk/export?format=csv'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSyncFromUrl = async () => {
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      // Direct fetch or via CORS proxy if needed
      let url = sheetUrl.trim();
      if (url.includes('/edit')) {
        url = url.replace(/\/edit.*$/, '/export?format=csv');
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('No se pudo acceder a la hoja de Google Sheets. Asegúrate de que tenga permisos públicos para lectura.');

      const text = await res.text();
      const parsed = parseCSVData(text);
      if (!parsed || parsed.length === 0) {
        throw new Error('No se detectaron empleados en el formato esperado.');
      }

      onUpdateEmployees(parsed);
      setSuccessMsg(`¡Sincronización exitosa! Se actualizaron ${parsed.length} empleados.`);
    } catch (err) {
      setError(err.message || 'Error al sincronizar con Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessMsg('');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result;
        const parsed = parseCSVData(text);
        if (!parsed || parsed.length === 0) {
          throw new Error('El archivo CSV no contiene registros válidos.');
        }
        onUpdateEmployees(parsed);
        setSuccessMsg(`¡Archivo cargado! Se procesaron ${parsed.length} empleados.`);
      } catch (err) {
        setError(err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="no-print bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                Sincronización de Datos
              </h2>
              <p className="text-xs text-slate-500">
                Base de datos actual: {currentCount} trabajadores
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

        <div className="p-4 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-start gap-2">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Enlace de Google Sheets
            </label>
            <input
              type="text"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-[11px]"
              placeholder="https://docs.google.com/spreadsheets/d/.../edit"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              La hoja debe estar compartida con permiso de lectura a &quot;Cualquier persona con el enlace&quot;.
            </p>
          </div>

          <button
            disabled={loading}
            onClick={handleSyncFromUrl}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Sincronizando...' : 'Sincronizar ahora con Google Sheets'}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-2 text-[10px] text-slate-400 uppercase font-semibold">O también</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Subir archivo CSV local
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-emerald-50/20">
              <Upload className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-slate-600 font-medium text-xs">Seleccionar archivo .csv</span>
              <span className="text-[10px] text-slate-400">Descargado de Excel o Google Sheets</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
