import React from 'react';
import { LEGAL_ARTICLES, OFFICIAL_HOLIDAYS } from '../constants/holidays';

export const LegalBaseSection: React.FC = () => {
  return (
    <div className="space-y-8 mt-12 pt-8 border-t border-slate-200">
      
      {/* 1. BASE LEGAL */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-amber-500 rounded-full" />
            <h3 className="text-base font-extrabold text-[#0a2e5c]">
              Base Legal
            </h3>
          </div>
          <span className="px-3 py-1 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 tracking-wider">
            CÓDIGO DE TRABAJO — EL SALVADOR
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-5 leading-relaxed">
          Los cálculos de esta herramienta se basan en el <strong>Código de Trabajo de El Salvador</strong> (Decreto Legislativo N.º 15, publicado el 31 de julio de 1972 y sus reformas).
        </p>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGAL_ARTICLES.map((item, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
                  <div className="flex flex-wrap gap-1 shrink-0 justify-end">
                    {item.articles.map((art, aIdx) => (
                      <span key={aIdx} className="px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 rounded text-[10px] font-bold">
                        {art}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. DÍAS DE ASUETO NACIONALES */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
            DÍAS DE ASUETO NACIONALES
          </h4>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-bold">
            Art. 190 CT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-xs">
          {OFFICIAL_HOLIDAYS.map((h) => (
            <div key={h.id} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="font-semibold text-slate-800">{h.name}</span>
              <span className="text-slate-400 text-[11px]">— {h.dateStr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FÓRMULAS APLICADAS */}
      <div className="bg-[#0b1b36] rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <h4 className="text-xs font-black tracking-widest uppercase text-sky-400 mb-6 pb-2 border-b border-white/10">
          FÓRMULAS APLICADAS
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              SALARIO DIARIO
            </span>
            <code className="text-sm font-mono font-bold text-white block">
              Salario mensual ÷ 30
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              SALARIO POR HORA
            </span>
            <code className="text-sm font-mono font-bold text-white block">
              Salario diario ÷ 8
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              VACACIÓN PROPORCIONAL
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              (Meses ÷ 12) × 15 días × Salario diario × 1.30
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              AGUINALDO PROPORCIONAL
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              (Meses ÷ 12) × Días base × Salario diario
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              INDEMNIZACIÓN
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              30 días × Salario diario × Años de servicio
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              HORA EXTRA DIURNA
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              Horas × Salario/hora × 2.0
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              HORA EXTRA NOCTURNA
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              Horas × Salario/hora × 2.5
            </code>
          </div>

          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block mb-1">
              DÍA DE ASUETO / DESCANSO
            </span>
            <code className="text-xs font-mono font-bold text-white block leading-tight">
              Días × Salario diario × 2.0
            </code>
          </div>

        </div>
      </div>

    </div>
  );
};
