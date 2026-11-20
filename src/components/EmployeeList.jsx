import React, { useState, useMemo } from 'react';
import { Search, UserCheck, Filter, Award } from 'lucide-react';
import { formatBs } from '../utils/formatters';

export default function EmployeeList({
  employees,
  selectedId,
  onSelectEmployee
}) {
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Unique departments
  const departments = useMemo(() => {
    const set = new Set();
    employees.forEach(e => {
      if (e.departamento) set.add(e.departamento);
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return employees.filter(emp => {
      const matchText =
        !q ||
        emp.nombre.toLowerCase().includes(q) ||
        emp.cedula.includes(q) ||
        emp.cargo.toLowerCase().includes(q);

      const matchDept = selectedDept === 'ALL' || emp.departamento === selectedDept;

      return matchText && matchDept;
    });
  }, [employees, search, selectedDept]);

  return (
    <aside className="no-print w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-57px)]">
      {/* Search & Filter Header */}
      <div className="p-3 border-b border-slate-200 bg-slate-50/70 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cédula o cargo..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full text-xs py-1 px-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:border-emerald-500 truncate"
          >
            <option value="ALL">Todos los Departamentos ({employees.length})</option>
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="px-3 py-1.5 bg-slate-100 text-[11px] text-slate-500 flex justify-between items-center font-medium">
        <span>Mostrando {filtered.length} trabajadores</span>
        {search && <span>Filtro activo</span>}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No se encontraron trabajadores con ese criterio.
          </div>
        ) : (
          filtered.map((emp) => {
            const isSelected = emp.id === selectedId;
            return (
              <button
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className={`w-full text-left p-3 transition-colors flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50/80 border-l-4 border-emerald-600'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {emp.nombre.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-xs text-slate-900 truncate">
                      {emp.nombre}
                    </span>
                    <span className="text-[11px] font-bold text-slate-700 ml-1 shrink-0">
                      {formatBs(emp.totalCancelarNum || emp.sueldoMensualNum)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate pr-1">{emp.cargo}</span>
                    <span className="text-slate-400 shrink-0 font-mono">V-{emp.cedula}</span>
                  </div>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="inline-block text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded truncate max-w-[170px]">
                      {emp.departamento}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">
                      45 días
                    </span>
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
