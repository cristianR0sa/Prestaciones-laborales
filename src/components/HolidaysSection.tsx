import React from 'react';
import { Sun, CheckSquare, Square, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { EmployeeData, CalculationResult } from '../types';
import { OFFICIAL_HOLIDAYS } from '../constants/holidays';
import { formatCurrency } from '../utils/calculator';

interface HolidaysSectionProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const HolidaysSection: React.FC<HolidaysSectionProps> = ({ data, results, onChange }) => {
  const toggleHoliday = (holidayId: string) => {
    const isSelected = data.selectedHolidays.includes(holidayId);
    let newSelected: string[];
    if (isSelected) {
      newSelected = data.selectedHolidays.filter(id => id !== holidayId);
    } else {
      newSelected = [...data.selectedHolidays, holidayId];
    }
    onChange({ selectedHolidays: newSelected });
  };

  const selectAll = () => {
    onChange({ selectedHolidays: OFFICIAL_HOLIDAYS.map(h => h.id) });
  };

  const clearAll = () => {
    onChange({ selectedHolidays: [] });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">6. Días de Asueto Nacional / Fiestas Patronales</h2>
            <p className="text-xs text-slate-400">
              Art. 190 a 192 Código de Trabajo: Remuneración con recargo del 100% (pago doble)
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Días de Asueto ({results.holidaysWorkedCount})</span>
          <span className="text-xl font-extrabold text-rose-400">
            {formatCurrency(results.holidaysWorkedAmount)}
          </span>
        </div>
      </div>

      {/* Pregunta inicial: ¿Laboró en días de asueto? */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          ¿Laboró en días de asueto nacional o patronal no remunerados?
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => onChange({ workedHolidays: true })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
              data.workedHolidays
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SÍ, laboró asuetos</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ workedHolidays: false, selectedHolidays: [] })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
              !data.workedHolidays
                ? 'bg-slate-700 text-white shadow-md ring-2 ring-slate-500'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>NO laboró</span>
          </button>
        </div>
      </div>

      {/* Flujo SÍ: Desplegable / Listado oficial de Asuetos de El Salvador */}
      {data.workedHolidays && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Seleccione los días de asueto efectivamente trabajados
              </span>
              <span className="text-[11px] text-slate-400">
                Cada día se calcula al <strong>doble del salario diario ({formatCurrency(results.dailySalary * 2)})</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-semibold text-rose-400 hover:text-rose-300 underline"
              >
                Marcar Todos
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-300 underline"
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
            {OFFICIAL_HOLIDAYS.map((holiday) => {
              const isChecked = data.selectedHolidays.includes(holiday.id);
              return (
                <div
                  key={holiday.id}
                  onClick={() => toggleHoliday(holiday.id)}
                  className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition-all select-none ${
                    isChecked
                      ? 'bg-rose-500/15 border-rose-500/60 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="shrink-0 text-rose-400">
                      {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-600" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white truncate">{holiday.name}</span>
                        {holiday.isSanMiguel && (
                          <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[9px] font-bold">
                            San Miguel
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{holiday.description}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[11px] font-bold text-rose-400">
                      +{formatCurrency(results.dailySalary * 2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
