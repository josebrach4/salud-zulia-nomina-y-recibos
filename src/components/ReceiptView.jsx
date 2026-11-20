import React from 'react';
import { formatBs } from '../utils/formatters';

export default function ReceiptView({ employee, companyConfig, isDuplicate = false }) {
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
    totalCancelarNum = 0,
    tasaCambio = '1.006,00',
    usdEquiv = ''
  } = employee;

  // Calculos exactos si vienen como números
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
    periodTo = '31/12/2025'
  } = companyConfig || {};

  return (
    <div className="receipt-page bg-white text-black p-8 max-w-[800px] mx-auto text-[13px] leading-tight font-sans selection:bg-none">
      {/* Header */}
      <div className="mb-4">
        <div className="font-bold text-[14px] uppercase tracking-wide">{companyName}</div>
        <div className="text-[13px] font-semibold">RIF {rif}</div>
        <div className="text-[12px] text-gray-800">{address}</div>
        
        <div className="text-center font-bold text-[15px] mt-3 mb-2 tracking-wider">
          RECIBO DE PAGO
          {isDuplicate && <span className="text-xs font-normal text-gray-500 ml-2">(COPIA ARCHIVO)</span>}
        </div>
      </div>

      {/* Employee Box with clean 1.5px border */}
      <div className="border-[1.5px] border-black p-2.5 mb-4 space-y-1 bg-white">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="font-bold">Empleado: </span>
            <span className="font-semibold uppercase">{nombre}</span>
          </div>
          <div className="w-[280px]">
            <span className="font-bold">Cedula de Identidad: </span>
            <span className="font-semibold">{cedula}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="font-bold">Cargo: </span>
            <span className="uppercase">{cargo}</span>
          </div>
          <div className="w-[280px]">
            <span className="font-bold">Departamento: </span>
            <span className="uppercase">{departamento}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="font-bold">Fecha de Ingreso: </span>
            <span>{fechaIngreso}</span>
          </div>
          <div className="w-[280px]">
            <span className="font-bold">Salario Mensual: </span>
            <span>{formatBs(sueldoMensualNum)}</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex-1">
            <span className="font-bold">Del </span>
            <span>{periodFrom}</span>
            <span className="font-bold"> Al </span>
            <span>{periodTo}</span>
          </div>
          <div className="w-[280px]">
            <span className="font-bold">Diario: </span>
            <span>{formatBs(sueldoDiario)}</span>
          </div>
        </div>
      </div>

      {/* Main Table: DESCRIPCION | ASIGNACION | DEDUCCION */}
      <div className="w-full mb-6">
        {/* Table Header */}
        <div className="border-t-[1.5px] border-b-[1.5px] border-black py-1.5 flex font-bold text-[12px] uppercase tracking-wider">
          <div className="flex-1">DESCRIPCION</div>
          <div className="w-44 text-right pr-6">ASIGNACION</div>
          <div className="w-36 text-right">DEDUCCION</div>
        </div>

        {/* Row 1: UTILIDADES */}
        <div className="py-2 flex items-center">
          <div className="flex-1 font-semibold">
            UTILIDADES {diasCalcular} DIAS
          </div>
          <div className="w-44 text-right pr-6 font-semibold">
            {formatBs(utilidades)}
          </div>
          <div className="w-36 text-right text-gray-400">
            —
          </div>
        </div>

        {/* TOTAL ASIGNACIONES Box */}
        <div className="border-[1.5px] border-black py-1 px-4 my-2 flex justify-between items-center font-bold">
          <div>TOTAL ASIGNACIONES</div>
          <div className="w-44 text-right pr-2">{formatBs(utilidades).replace('Bs. ', '')}</div>
        </div>

        {/* Deductions Items */}
        <div className="py-1 flex items-center text-[12.5px]">
          <div className="flex-1">
            INCES 0,5%
          </div>
          <div className="w-44 text-right pr-6 text-gray-400">
            —
          </div>
          <div className="w-36 text-right">
            {formatBs(inces).replace('Bs. ', '')}
          </div>
        </div>

        {descuentosNum > 0 && (
          <div className="py-1 flex items-center text-[12.5px]">
            <div className="flex-1">
              DESCUENTOS / ADELANTOS
            </div>
            <div className="w-44 text-right pr-6 text-gray-400">
              —
            </div>
            <div className="w-36 text-right">
              {formatBs(descuentosNum).replace('Bs. ', '')}
            </div>
          </div>
        )}

        {/* TOTAL DEDUCCIONES Line */}
        <div className="border-b-[1.5px] border-black py-1 flex justify-between items-center font-bold">
          <div className="pl-28">TOTAL DEDUCCIONES</div>
          <div className="w-36 text-right pr-1">{formatBs(totalDeducciones).replace('Bs. ', '')}</div>
        </div>

        {/* NETO A COBRAR Highlighted */}
        <div className="py-2 flex justify-end items-center font-bold text-[14px]">
          <span className="mr-3">NETO A COBRAR:</span>
          <span className="text-[15px] bg-slate-100 px-2 py-0.5 border border-black">{formatBs(neto)}</span>
        </div>

        {/* Informative USD Reference (Legal note in Venezuela) */}
        {usdEquiv && (
          <div className="text-right text-[11px] text-gray-500 italic mt-0.5">
            Ref. Ref. BCV ({tasaCambio} Bs./$): {usdEquiv} USD
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="mt-14 pt-4">
        <div className="text-[12px] font-bold mb-8">
          RECIBI CONFORME:
        </div>
        <div className="w-64 border-t border-black pt-1">
          <div className="font-bold text-[12px]">FIRMA DEL TRABAJADOR</div>
          <div className="text-[12px] font-semibold">C.I.: {cedula}</div>
        </div>
      </div>
    </div>
  );
}
