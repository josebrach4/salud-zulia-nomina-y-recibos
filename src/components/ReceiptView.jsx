import React from 'react';
import { formatBs } from '../utils/formatters';

export function SingleReceiptSlip({ employee, companyConfig, copyLabel = '', compact = false }) {
  if (!employee) return null;

  const {
    nombre = '',
    cedula = '',
    cargo = '',
    departamento = '',
    fechaIngreso = '',
    sueldoMensualNum = 0,
    salarioDiarioNum = 0,
    diasCalcular = 45,
    utilidadesBrutoNum = 0,
    dctoIncesNum = 0,
    descuentosNum = 0,
    totalCancelarNum = 0
  } = employee;

  const sueldoDiario = salarioDiarioNum || (sueldoMensualNum / 30);
  const utilidades = utilidadesBrutoNum || (sueldoDiario * diasCalcular);
  const inces = dctoIncesNum || (utilidades * 0.005);
  const totalDeducciones = inces + (descuentosNum || 0);
  const neto = totalCancelarNum || (utilidades - totalDeducciones);

  const {
    companyName = 'PLAN MEDICO SALUD ZULIA, C.A',
    rif = 'J 29767801-8',
    address = 'Calle 100 Casa Nro. 19F-200 Urb. Urdaneta Sector Sabaneta, Maracaibo',
    periodFrom = '01/01/2025',
    periodTo = '31/12/2026'
  } = companyConfig || {};

  return (
    <div className={`receipt-slip text-black font-sans leading-tight bg-white ${compact ? 'text-[11.5px] p-4 sm:p-5' : 'text-[13px] p-6 sm:p-8'}`}>
      {/* Header */}
      <div className={compact ? 'mb-2' : 'mb-3'}>
        <div className="font-bold text-[13px] sm:text-[14px] uppercase tracking-wide">{companyName}</div>
        <div className="text-[12px] font-semibold">RIF {rif}</div>
        <div className="text-[11px] text-gray-700">{address}</div>

        <div className={`text-center font-bold tracking-wider ${compact ? 'text-[13px] mt-1.5 mb-1.5' : 'text-[15px] mt-2.5 mb-2'}`}>
          RECIBO DE PAGO
          {copyLabel && <span className="text-[11px] font-normal text-gray-600 ml-2">({copyLabel})</span>}
        </div>
      </div>

      {/* Employee Box */}
      <div className={`border-[1.5px] border-black space-y-0.5 bg-white ${compact ? 'p-2 mb-2 text-[11px]' : 'p-2.5 mb-3 text-[12px]'}`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <span className="font-bold">Empleado: </span>
            <span className="font-semibold uppercase">{nombre}</span>
          </div>
          <div className="w-[240px] sm:w-[270px]">
            <span className="font-bold">Cedula de Identidad: </span>
            <span className="font-semibold">{cedula}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <span className="font-bold">Cargo: </span>
            <span className="uppercase">{cargo}</span>
          </div>
          <div className="w-[240px] sm:w-[270px]">
            <span className="font-bold">Departamento: </span>
            <span className="uppercase">{departamento}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <span className="font-bold">Fecha de Ingreso: </span>
            <span>{fechaIngreso}</span>
          </div>
          <div className="w-[240px] sm:w-[270px]">
            <span className="font-bold">Salario Mensual: </span>
            <span>{formatBs(sueldoMensualNum)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1 pr-2">
            <span className="font-bold">Del </span>
            <span>{periodFrom}</span>
            <span className="font-bold"> Al </span>
            <span>{periodTo}</span>
          </div>
          <div className="w-[240px] sm:w-[270px]">
            <span className="font-bold">Diario: </span>
            <span>{formatBs(sueldoDiario)}</span>
          </div>
        </div>
      </div>

      {/* Main Table: DESCRIPCION | ASIGNACION | DEDUCCION */}
      <div className={`w-full ${compact ? 'mb-3' : 'mb-5'}`}>
        <div className="border-t-[1.5px] border-b-[1.5px] border-black py-1 flex font-bold text-[11px] sm:text-[12px] uppercase tracking-wider">
          <div className="flex-1">DESCRIPCION</div>
          <div className="w-36 sm:w-44 text-right pr-4 sm:pr-6">ASIGNACION</div>
          <div className="w-28 sm:w-36 text-right">DEDUCCION</div>
        </div>

        <div className="py-1 flex items-center">
          <div className="flex-1 font-semibold">
            UTILIDADES {diasCalcular} DIAS
          </div>
          <div className="w-36 sm:w-44 text-right pr-4 sm:pr-6 font-semibold">
            {formatBs(utilidades)}
          </div>
          <div className="w-28 sm:w-36 text-right text-gray-400">
            —
          </div>
        </div>

        <div className="border-[1.5px] border-black py-0.5 px-3 my-1 flex justify-between items-center font-bold">
          <div>TOTAL ASIGNACIONES</div>
          <div className="w-36 sm:w-44 text-right pr-1 sm:pr-2">{formatBs(utilidades).replace('Bs. ', '')}</div>
        </div>

        <div className="py-0.5 flex items-center">
          <div className="flex-1">
            INCES 0,5%
          </div>
          <div className="w-36 sm:w-44 text-right pr-4 sm:pr-6 text-gray-400">
            —
          </div>
          <div className="w-28 sm:w-36 text-right">
            {formatBs(inces).replace('Bs. ', '')}
          </div>
        </div>

        {descuentosNum > 0 && (
          <div className="py-0.5 flex items-center">
            <div className="flex-1">
              DESCUENTOS / ADELANTOS
            </div>
            <div className="w-36 sm:w-44 text-right pr-4 sm:pr-6 text-gray-400">
              —
            </div>
            <div className="w-28 sm:w-36 text-right">
              {formatBs(descuentosNum).replace('Bs. ', '')}
            </div>
          </div>
        )}

        <div className="border-b-[1.5px] border-black py-0.5 flex justify-between items-center font-bold">
          <div className="pl-16 sm:pl-28">TOTAL DEDUCCIONES</div>
          <div className="w-28 sm:w-36 text-right pr-1">{formatBs(totalDeducciones).replace('Bs. ', '')}</div>
        </div>

        <div className={`flex justify-end items-center font-bold ${compact ? 'py-1 text-[13px]' : 'py-2 text-[14px]'}`}>
          <span className="mr-3">NETO A COBRAR:</span>
          <span className="bg-slate-100 px-2 py-0.5 border border-black">{formatBs(neto)}</span>
        </div>
      </div>

      {/* Signature Section */}
      <div className={compact ? 'mt-4 pt-1' : 'mt-8 pt-3'}>
        <div className={`font-bold mb-5 ${compact ? 'text-[11px]' : 'text-[12px]'}`}>
          RECIBI CONFORME:
        </div>
        <div className="w-56 sm:w-64 border-t border-black pt-1">
          <div className={`font-bold ${compact ? 'text-[11px]' : 'text-[12px]'}`}>FIRMA DEL TRABAJADOR</div>
          <div className={`font-semibold ${compact ? 'text-[11px]' : 'text-[12px]'}`}>C.I.: {cedula}</div>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptView({ employee, companyConfig, printMode = 'two_per_page' }) {
  if (!employee) return null;

  if (printMode === 'two_per_page') {
    return (
      <div className="receipt-page bg-white text-black max-w-[800px] mx-auto selection:bg-none">
        {/* Recibo Superior: Original Trabajador */}
        <SingleReceiptSlip
          employee={employee}
          companyConfig={companyConfig}
          copyLabel="ORIGINAL - TRABAJADOR"
          compact={true}
        />

        {/* Línea de corte para tijeras */}
        <div className="relative py-2 select-none">
          <div className="border-b-2 border-dashed border-gray-400 w-full"></div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-gray-500 font-semibold tracking-wider flex items-center gap-1.5 border border-dashed border-gray-300 rounded-full">
            <span>✂</span>
            <span>CORTAR AQUÍ</span>
            <span>✂</span>
          </div>
        </div>

        {/* Recibo Inferior: Copia Empresa / Archivo */}
        <SingleReceiptSlip
          employee={employee}
          companyConfig={companyConfig}
          copyLabel="COPIA - ARCHIVO EMPRESA"
          compact={true}
        />
      </div>
    );
  }

  // Formato individual 1 por hoja
  return (
    <div className="receipt-page bg-white text-black max-w-[800px] mx-auto selection:bg-none">
      <SingleReceiptSlip
        employee={employee}
        companyConfig={companyConfig}
        compact={false}
      />
    </div>
  );
}
