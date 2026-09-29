import React from 'react';
import { Gift, Award, Calendar, Check, Info } from 'lucide-react';
import { EmployeeData, CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';

interface AguinaldoSectionProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const AguinaldoSection: React.FC<AguinaldoSectionProps> = ({ data, results, onChange }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">4. Aguinaldo Proporcional / Completo</h2>
            <p className="text-xs text-slate-400">
              Art. 196 a 202 Código de Trabajo según rangos de antigüedad y periodo laborado
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Monto de Aguinaldo</span>
          <span className="text-xl font-extrabold text-amber-400">
            {formatCurrency(results.aguinaldoAmount)}
          </span>
        </div>
      </div>

      {/* Rangos de Antigüedad - Tabla Visual */}
      <div className="mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2.5">
          Rangos de Antigüedad por Ley (Art. 198 C.T.)
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className={`p-3 rounded-xl border transition-all ${
            results.yearsWorked < 3
              ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">&lt; 3 Años</span>
              {results.yearsWorked < 3 && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-base font-extrabold text-white mt-1">15 Días</div>
            <span className="text-[11px] text-slate-400">De 1 a menos de 3 años</span>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            results.yearsWorked >= 3 && results.yearsWorked < 5
              ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">3 &lt; 5 Años</span>
              {results.yearsWorked >= 3 && results.yearsWorked < 5 && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-base font-extrabold text-white mt-1">19 Días</div>
            <span className="text-[11px] text-slate-400">De 3 a menos de 5 años</span>
          </div>

          <div className={`p-3 rounded-xl border transition-all ${
            results.yearsWorked >= 5
              ? 'bg-amber-500/15 border-amber-500 text-amber-200 ring-1 ring-amber-500/40'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase">&gt;= 5 Años</span>
              {results.yearsWorked >= 5 && <Check className="w-4 h-4 text-amber-400" />}
            </div>
            <div className="text-base font-extrabold text-white mt-1">21 Días</div>
            <span className="text-[11px] text-slate-400">5 años de servicio o más</span>
          </div>

        </div>
      </div>

      {/* Tipo de Aguinaldo: Automático, Proporcional o Completo */}
      <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>Modalidad de Cálculo de Aguinaldo</span>
            </div>
            <p className="text-xs text-slate-400">
              {results.aguinaldoIsProportional 
                ? `Cálculo Proporcional: ${results.aguinaldoDaysWorkedInPeriod} días computados en el periodo de aguinaldo actual.`
                : `Cálculo Completo: Aplica el 100% de los ${results.aguinaldoDaysEntitled} días correspondientes.`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => onChange({ aguinaldoType: 'auto' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                data.aguinaldoType === 'auto'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Automático (Por Fecha)
            </button>
            <button
              type="button"
              onClick={() => onChange({ aguinaldoType: 'proporcional' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                data.aguinaldoType === 'proporcional'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Proporcional
            </button>
            <button
              type="button"
              onClick={() => onChange({ aguinaldoType: 'completo' })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                data.aguinaldoType === 'completo'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completo
            </button>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Base de días asignados: <strong>{results.aguinaldoDaysEntitled} días</strong></span>
          <span>Fórmula: <strong>({results.aguinaldoDaysWorkedInPeriod} / 365) × {results.aguinaldoDaysEntitled}d × {formatCurrency(results.dailySalary)}</strong></span>
        </div>
      </div>
    </div>
  );
};
