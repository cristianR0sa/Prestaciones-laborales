import React, { useState } from 'react';
import { Clock, Plus, Trash2, CheckCircle2, XCircle, Moon, SunMedium, Sparkles } from 'lucide-react';
import { EmployeeData, CalculationResult, OvertimeEntry } from '../types';
import { calculateOvertimeType, formatCurrency } from '../utils/calculator';

interface OvertimeSectionProps {
  data: EmployeeData;
  results: CalculationResult;
  onChange: (fields: Partial<EmployeeData>) => void;
}

export const OvertimeSection: React.FC<OvertimeSectionProps> = ({ data, results, onChange }) => {
  const [entryDate, setEntryDate] = useState<string>(data.endDate || new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('21:00');
  const [description, setDescription] = useState<string>('Jornada extraordinaria no pagada');

  // Preview dinámico del tipo de hora
  const preview = calculateOvertimeType(startTime, endTime);
  const hourlyRate = results.hourlySalary;
  const previewAmount = (preview.diurnasHours * hourlyRate * 2.0) + (preview.nocturnasHours * hourlyRate * 2.25);

  const addEntry = () => {
    if (!startTime || !endTime || preview.totalHours <= 0) return;

    const newEntry: OvertimeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: entryDate,
      startTime,
      endTime,
      hours: preview.totalHours,
      type: preview.type,
      diurnasHours: preview.diurnasHours,
      nocturnasHours: preview.nocturnasHours,
      dayType: 'habil',
      calculatedAmount: previewAmount,
      description: description || 'Horas extras pendientes'
    };

    onChange({
      overtimeEntries: [...data.overtimeEntries, newEntry]
    });
  };

  const removeEntry = (id: string) => {
    onChange({
      overtimeEntries: data.overtimeEntries.filter(e => e.id !== id)
    });
  };

  return (
    <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 md:p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-700/60 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">7. Horas Extras Extraordinarias (No Pagadas)</h2>
            <p className="text-xs text-slate-400">
              Detección automática Diurna (+100%) vs Nocturna (+125%) según horario ingresado
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400 block">Total Horas Extras ({results.overtimeTotalHours}h)</span>
          <span className="text-xl font-extrabold text-purple-400">
            {formatCurrency(results.overtimeTotalAmount)}
          </span>
        </div>
      </div>

      {/* Pregunta inicial: ¿Se realizaron horas extras? */}
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
          ¿Tiene horas extras acumuladas no remuneradas (máximo mes anterior/reciente)?
        </label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => onChange({ hasOvertime: true })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
              data.hasOvertime
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>SÍ, tiene pendientes</span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ hasOvertime: false, overtimeEntries: [] })}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all ${
              !data.hasOvertime
                ? 'bg-slate-700 text-white shadow-md ring-2 ring-slate-500'
                : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-700'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>NO tiene</span>
          </button>
        </div>
      </div>

      {/* Flujo SÍ: Formulario de ingreso con deducción automática */}
      {data.hasOvertime && (
        <div className="mt-4 p-4 rounded-xl bg-slate-900/90 border border-slate-700 animate-in fade-in space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Registrar Turno de Horas Extras</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Fecha */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Fecha Realizada</label>
              <input
                type="date"
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* 2. Hora Inicio */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hora Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* 3. Hora Fin */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Hora Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            {/* Botón Añadir */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={addEntry}
                disabled={preview.totalHours <= 0}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs py-2 px-4 rounded-lg transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Registro</span>
              </button>
            </div>
          </div>

          {/* Deducción automática en vivo del tipo de hora */}
          <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Detección automática:</span>
              {preview.diurnasHours > 0 && (
                <span className="inline-flex items-center gap-1 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  <SunMedium className="w-3.5 h-3.5" />
                  {preview.diurnasHours}h Diurnas (+100%)
                </span>
              )}
              {preview.nocturnasHours > 0 && (
                <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                  <Moon className="w-3.5 h-3.5" />
                  {preview.nocturnasHours}h Nocturnas (+125%)
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 mr-2">Valor Estimado del Turno:</span>
              <strong className="text-purple-300 font-mono text-sm">{formatCurrency(previewAmount)}</strong>
            </div>
          </div>

          {/* Lista de Registros Añadidos */}
          {data.overtimeEntries.length > 0 && (
            <div className="mt-3 space-y-2">
              <span className="text-xs font-semibold text-slate-300 block">Registros Acumulados:</span>
              <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/40">
                {data.overtimeEntries.map((entry) => {
                  const entryCalc = calculateOvertimeType(entry.startTime, entry.endTime);
                  return (
                    <div key={entry.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-300 font-bold">{entry.date}</span>
                        <span className="text-slate-400 font-mono">({entry.startTime} a {entry.endTime})</span>
                        <div className="flex items-center gap-1.5">
                          {entryCalc.diurnasHours > 0 && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                              {entryCalc.diurnasHours}h Diurna
                            </span>
                          )}
                          {entryCalc.nocturnasHours > 0 && (
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded">
                              {entryCalc.nocturnasHours}h Nocturna
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <strong className="text-purple-400 font-mono">{formatCurrency(entry.calculatedAmount)}</strong>
                        <button
                          type="button"
                          onClick={() => removeEntry(entry.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
