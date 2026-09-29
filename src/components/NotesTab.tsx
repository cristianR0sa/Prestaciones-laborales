import React, { useState, useEffect } from 'react';
import { FileText, Save, Trash2, CheckCircle2, Clock } from 'lucide-react';

export const NotesTab: React.FC = () => {
  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem('labor_notes_draft') || 
`# Bloc de Notas — Casos y Observaciones Laborales

- Empleado: Juan Carlos Pérez
- Caso: Liquidación por terminación contractual
- Observaciones:
  * Revisar comprobantes de preaviso si aplica renuncia.
  * Verificar si gozó vacaciones del período correspondiente.
  * Confirmar reporte de horas extras con jefe de departamento.
`;
  });

  const [savedStatus, setSavedStatus] = useState<boolean>(false);

  const handleSave = () => {
    localStorage.setItem('labor_notes_draft', notes);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleClear = () => {
    if (window.confirm('¿Desea limpiar el bloc de notas?')) {
      setNotes('');
      localStorage.removeItem('labor_notes_draft');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0a2e5c]">Bloc de Notas Laborales</h2>
            <p className="text-xs text-slate-500">Espacio de trabajo para apuntes de expedientes, cálculos previos y finiquitos</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedStatus && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" /> Guardado
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-[#0a2e5c] hover:bg-[#082447] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={16}
        placeholder="Escriba aquí sus notas, observaciones del caso o bitácora de cálculo..."
        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-4 text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] transition-all resize-y"
      />

      <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          <span>Las notas se guardan en el almacenamiento local de tu navegador.</span>
        </span>
        <span>{notes.length} caracteres</span>
      </div>
    </div>
  );
};
