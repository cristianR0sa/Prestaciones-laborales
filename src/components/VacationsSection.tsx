import React from 'react';
import { Palmtree, Calendar, Percent, Info, CheckCircle2 } from 'lucide-react';
import { EmployeeData, CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';

interface VacationsSectionProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const VacationsSection: React.FC<VacationsSectionProps> = ({ data, results, onChange }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg">
            <Palmtree className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">5. Vacación Anual y Prima Vacacional (+30%)</h2>
            <p className="text-xs text-slate-400">
              Art. 177 y 182 Código de Trabajo: 15 días de descanso remunerado + 30% de recargo de ley
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Vacaciones + Prima</span>
          <span className="text-xl font-extrabold text-teal-400">
            {formatCurrency(results.vacationTotalAmount)}
          </span>
        </div>
      </div>

      {/* Selector: ¿Cuándo fueron las últimas vacaciones? */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
            Modalidad de Liquidación de Vacaciones
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onChange({ vacationCalculationType: 'proporcional' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.vacationCalculationType === 'proporcional'
                  ? 'bg-teal-600/15 border-teal-500 text-white ring-1 ring-teal-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Vacación Proporcional</span>
                {data.vacationCalculationType === 'proporcional' && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Para periodos fraccionados desde la fecha de las últimas vacaciones disfrutadas.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange({ vacationCalculationType: 'completo' })}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                data.vacationCalculationType === 'completo'
                  ? 'bg-teal-600/15 border-teal-500 text-white ring-1 ring-teal-500/50 shadow-md'
                  : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">Vacación Completa (15 días)</span>
                {data.vacationCalculationType === 'completo' && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Aplica cuando el año completo no fue gozado (15 días + 30% prima vacacional).
              </p>
            </button>
          </div>
        </div>

        {/* Calendario de Últimas Vacaciones */}
        {data.vacationCalculationType === 'proporcional' && (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/70 animate-in fade-in">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              ¿Cuándo fue el último periodo de vacaciones disfrutado? (Hasta 15 días)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha Inicio Última Vacación</label>
                <input
                  type="date"
                  value={data.vacationStartDate}
                  onChange={(e) => onChange({ vacationStartDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Fecha Fin Última Vacación</label>
                <input
                  type="date"
                  value={data.vacationEndDate}
                  onChange={(e) => onChange({ vacationEndDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Se computarán los días devengados desde el fin de sus últimas vacaciones hasta la fecha de terminación laboral.
            </p>
          </div>
        )}

        {/* Desglose de Vacación Básica + Prima del 30% */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Días de Vacación:</span>
            <strong className="text-white text-sm">{results.vacationDaysToPay.toFixed(2)} días</strong>
            <span className="block text-[11px] text-teal-400 mt-0.5">
              Monto Base: {formatCurrency(results.vacationBaseAmount)}
            </span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl">
            <span className="text-slate-400 block text-[11px]">Prima Vacacional (+30%):</span>
            <strong className="text-teal-300 text-sm">30% sobre base</strong>
            <span className="block text-[11px] text-teal-400 mt-0.5">
              Recargo: {formatCurrency(results.vacationPremiumAmount)}
            </span>
          </div>

          <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl">
            <span className="text-teal-200 block text-[11px]">Total a Percibir:</span>
            <strong className="text-teal-300 text-sm">{formatCurrency(results.vacationTotalAmount)}</strong>
            <span className="block text-[11px] text-teal-400/80 mt-0.5">
              15 días × 1.30 = 19.5d eq.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
