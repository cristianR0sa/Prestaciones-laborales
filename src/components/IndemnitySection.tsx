import React from 'react';
import { Landmark, ShieldAlert, CheckCircle, Calculator, Info } from 'lucide-react';
import { CalculationResult, EmployeeData } from '../types';
import { formatCurrency } from '../utils/calculator';
import { MAX_MONTHLY_INDEMNITY_BASE, MAX_DAILY_INDEMNITY_BASE, MINIMUM_WAGE_COMMERCE } from '../constants/holidays';

interface IndemnitySectionProps {
  data: EmployeeData;
  results: CalculationResult;
}

export const IndemnitySection: React.FC<IndemnitySectionProps> = ({ data, results }) => {
  const isDespido = data.terminationType === 'despido_injustificado';

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              3. Cálculo de Indemnización {isDespido ? '(Despido Injustificado)' : '(Compensación por Renuncia)'}
            </h2>
            <p className="text-xs text-slate-400">
              {isDespido 
                ? 'Art. 58 Código de Trabajo: 30 días de salario por año laborado y proporcional por fracción' 
                : 'Ley de Renuncia Voluntaria: 15 días de salario por año laborado tras 2 años de servicio'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Monto de Indemnización</span>
          <span className={`text-xl font-extrabold ${results.indemnityBlocked ? 'text-red-400' : 'text-emerald-400'}`}>
            {results.indemnityBlocked ? '$0.00' : formatCurrency(results.indemnityAmount)}
          </span>
        </div>
      </div>

      {/* Regla de tope legal */}
      {isDespido && (
        <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/70">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase text-slate-400">Salario Mínimo Sector Comercio</span>
              <span className="text-xs font-bold text-blue-400">{formatCurrency(MINIMUM_WAGE_COMMERCE)} / mes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400">Tope Legal Máximo (4 Salarios)</span>
              <span className="text-sm font-extrabold text-white">{formatCurrency(MAX_MONTHLY_INDEMNITY_BASE)} / mes</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Tope diario para indemnización: <strong>{formatCurrency(MAX_DAILY_INDEMNITY_BASE)} / día</strong>
            </div>
          </div>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            results.isCapped 
              ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' 
              : 'bg-blue-950/30 border-blue-500/30 text-blue-200'
          }`}>
            {results.isCapped ? (
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            )}
            <div>
              <span className="font-bold text-xs block uppercase">
                {results.isCapped ? 'Tope Legal Aplicado' : 'Dentro del Límite Legal'}
              </span>
              <p className="text-xs mt-1 text-slate-300">
                {results.isCapped
                  ? `El salario mensual (${formatCurrency(data.salary)}) supera el límite legal de 4 salarios mínimos ($1,460.00). Se computa con base en $48.67 diarios.`
                  : `El salario mensual (${formatCurrency(data.salary)}) no supera el tope legal ($1,460.00). Se computa con el salario real de ${formatCurrency(results.dailySalary)} diarios.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estado Bloqueado */}
      {results.indemnityBlocked ? (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-xs font-medium">
            {results.indemnityBlockReason || 'Indemnización bloqueada conforme a la normativa legal.'}
          </span>
        </div>
      ) : (
        /* Desglose Matemático */
        <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/60">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span>Desglose de la Fórmula Matemática</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Años Completos:</span>
              <strong className="text-white text-sm">{results.yearsWorked} año(s)</strong>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                = {results.yearsWorked * (isDespido ? 30 : 15)} días de salario base
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Fracción Residual:</span>
              <strong className="text-white text-sm">{results.monthsWorked} meses, {results.daysWorked} días</strong>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                Proporcional calculado por días
              </span>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg">
              <span className="text-slate-400 block text-[11px]">Salario Diario Aplicado:</span>
              <strong className="text-emerald-400 text-sm">{formatCurrency(results.indemnityCappedDaily)} / día</strong>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                {results.isCapped ? 'Tope 4 salarios mínimos' : 'Salario ordinario'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
