import React from 'react';
import { UserX, LogOut, AlertTriangle, CheckCircle2, XCircle, ShieldAlert, Info } from 'lucide-react';
import { TerminationType, EmployeeData, CalculationResult } from '../types';

interface TerminationSectionProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const TerminationSection: React.FC<TerminationSectionProps> = ({ data, results, onChange }) => {
  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-700/60">
        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
          <UserX className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">2. Motivo de Terminación del Contrato</h2>
          <p className="text-xs text-slate-400">Seleccione si fue despido injustificado o renuncia voluntaria</p>
        </div>
      </div>

      {/* Selector de Terminación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        {/* Opción 1: Despido Injustificado */}
        <button
          type="button"
          onClick={() => onChange({ terminationType: 'despido_injustificado' })}
          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            data.terminationType === 'despido_injustificado'
              ? 'bg-blue-600/15 border-blue-500 text-white shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
              : 'bg-slate-900/50 border-slate-700/70 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${data.terminationType === 'despido_injustificado' ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block text-white">Despido Injustificado</span>
                <span className="text-xs text-slate-400">Art. 58 Código de Trabajo</span>
              </div>
            </div>
            {data.terminationType === 'despido_injustificado' && (
              <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Aplica indemnización de 30 días por cada año laborado con tope legal de 4 salarios mínimos del sector comercio.
          </p>
        </button>

        {/* Opción 2: Renuncia Voluntaria */}
        <button
          type="button"
          onClick={() => onChange({ terminationType: 'renuncia_voluntaria' })}
          className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
            data.terminationType === 'renuncia_voluntaria'
              ? 'bg-indigo-600/15 border-indigo-500 text-white shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/50'
              : 'bg-slate-900/50 border-slate-700/70 text-slate-400 hover:border-slate-600 hover:text-slate-200'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${data.terminationType === 'renuncia_voluntaria' ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm block text-white">Renuncia Voluntaria</span>
                <span className="text-xs text-slate-400">Ley Reguladora de Renuncia</span>
              </div>
            </div>
            {data.terminationType === 'renuncia_voluntaria' && (
              <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Requiere preaviso legal obligatorio por escrito al patrono y al menos 2 años de servicio continuo.
          </p>
        </button>
      </div>

      {/* CUADRITO INTERACTIVO DE PREGUNTA: Renuncia Voluntaria */}
      {data.terminationType === 'renuncia_voluntaria' && (
        <div className="mt-4 p-5 rounded-xl bg-slate-900/90 border-2 border-indigo-500/50 shadow-inner animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5 mb-3 text-indigo-300">
            <Info className="w-5 h-5 text-indigo-400 shrink-0" />
            <span className="text-sm font-bold uppercase tracking-wider">
              Validación Legal de Renuncia Voluntaria
            </span>
          </div>

          <p className="text-sm text-slate-200 mb-4 font-medium">
            ¿Informó y notificó formalmente al patrono con el preaviso correspondiente de ley?
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => onChange({ informedEmployer: true })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
                data.informedEmployer === true
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>SÍ, se informó</span>
            </button>

            <button
              type="button"
              onClick={() => onChange({ informedEmployer: false })}
              className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all ${
                data.informedEmployer === false
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>NO se informó</span>
            </button>
          </div>

          {/* MENSAJE DE BLOQUEO ESTRICTO SI NO INFORMÓ */}
          {data.informedEmployer === false && (
            <div className="mt-4 p-4 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 flex items-start gap-3 animate-in shake">
              <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-extrabold text-red-300 uppercase tracking-wide">
                  BENEFICIO DE RENUNCIA BLOQUEADO
                </strong>
                <p className="text-xs text-red-200/90 mt-1 leading-relaxed">
                  Conforme a la <strong>Ley Reguladora de la Prestación Económica por Renuncia Voluntaria</strong> (Art. 3 y 4), si el trabajador <strong>NO</strong> da el preaviso legal de 15 o 30 días al patrono, el sistema <strong>NO permite generarle compensación económica de renuncia</strong>.
                </p>
                <span className="inline-block mt-2 px-2.5 py-1 bg-red-900/80 border border-red-500/40 rounded text-[11px] font-bold text-white">
                  Indemnización por Renuncia = \$0.00 (Bloqueada)
                </span>
              </div>
            </div>
          )}

          {/* MENSAJE SI INFORMÓ PERO TIENE MENOS DE 2 AÑOS */}
          {data.informedEmployer === true && results.yearsWorked < 2 && (
            <div className="mt-4 p-4 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-amber-300 uppercase">
                  Antigüedad Insuficiente para Compensación por Renuncia
                </strong>
                <p className="text-xs text-amber-200/90 mt-0.5">
                  El trabajador tiene <strong>{results.yearsWorked} año(s)</strong> laborados. La ley exige un mínimo de <strong>2 años continuos</strong> para gozar de compensación por renuncia. Se liquidarán sus derechos irrenunciables (aguinaldo y vacaciones proporcionales).
                </p>
              </div>
            </div>
          )}

          {/* MENSAJE SI INFORMÓ Y CUMPLE REQUISITOS */}
          {data.informedEmployer === true && results.yearsWorked >= 2 && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-medium">
                Cumple los requisitos legales: Se calculan 15 días por cada año laborado con tope de 2 salarios mínimos.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
