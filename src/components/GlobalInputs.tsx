import React from 'react';
import { Calendar, DollarSign, User, Building2, Briefcase, FileText, Clock } from 'lucide-react';
import { EmployeeData, CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';

interface GlobalInputsProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const GlobalInputs: React.FC<GlobalInputsProps> = ({ data, results, onChange }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">1. Datos Contractuales y Periodo Laboral</h2>
            <p className="text-xs text-slate-400">Ingrese las fechas de inicio y fin de la relación laboral y el salario</p>
          </div>
        </div>

        {results.totalDaysWorked > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-950/60 border border-blue-500/30 rounded-lg text-xs text-blue-300">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>
              Antigüedad: <strong>{results.yearsWorked} años</strong>, <strong>{results.monthsWorked} meses</strong>, <strong>{results.daysWorked} días</strong> ({results.totalDaysWorked} días)
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Fecha de Inicio */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Fecha de Inicio de Labores <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.startDate}
              onChange={(e) => onChange({ startDate: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Primer día oficial de trabajo</span>
        </div>

        {/* Fecha de Fin */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Fecha de Fin / Terminación <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={data.endDate}
              onChange={(e) => onChange({ endDate: e.target.value })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">Último día efectivamente laborado</span>
        </div>

        {/* Salario Mensual Base */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
            Salario Mensual Nominal (USD) <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="365.00"
              value={data.salary || ''}
              onChange={(e) => onChange({ salary: parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-inner"
              required
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
            <span>Salario Diario: <strong>{formatCurrency(results.dailySalary)}</strong></span>
            <span>Salario Hora: <strong>{formatCurrency(results.hourlySalary)}</strong></span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Antigüedad en móviles */}
      {results.totalDaysWorked > 0 && (
        <div className="mt-4 sm:hidden p-3 bg-blue-950/40 border border-blue-500/30 rounded-xl flex items-center gap-2 text-xs text-blue-300">
          <Clock className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            Antigüedad computada: <strong>{results.yearsWorked} años</strong>, <strong>{results.monthsWorked} meses</strong>, <strong>{results.daysWorked} días</strong>
          </span>
        </div>
      )}

      {/* Datos opcionales para la liquidación formal / PDF */}
      <div className="mt-5 pt-4 border-t border-slate-700/50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">
          Datos Complementarios para el Finiquito y PDF (Opcional)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Nombre del Empleado"
                value={data.fullName}
                onChange={(e) => onChange({ fullName: e.target.value })}
                className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="DUI (ej. 01234567-8)"
                value={data.documentId}
                onChange={(e) => onChange({ documentId: e.target.value })}
                className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Puesto / Cargo"
                value={data.position}
                onChange={(e) => onChange({ position: e.target.value })}
                className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                placeholder="Nombre de la Empresa"
                value={data.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
                className="w-full bg-slate-900/60 border border-slate-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
