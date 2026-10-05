import React from 'react';
import { Calculator, BookOpen, Scale, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'notes';
  onTabChange: (tab: 'calculator' | 'notes') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="w-full border-b border-slate-200 bg-white/85 backdrop-blur-md shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white flex items-center justify-center shadow-[0_12px_22px_rgba(15,23,42,0.12)]">
            <Scale className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Calculadora de Prestaciones
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              El Salvador — Código de Trabajo
            </p>
          </div>
        </div>

        <div className="text-center md:text-right text-xs text-slate-500 leading-snug">
          <span className="font-extrabold tracking-[0.18em] text-sky-700 uppercase block text-[10px]">
            Proyecto académico
          </span>
          <span className="font-semibold text-slate-700 block">
            Ingeniería en Sistemas y Redes Informáticas
          </span>
          <span className="text-slate-500 text-[11px] block">
            Derecho Empresarial e Informático — Bloque 2
          </span>
        </div>
      </div>

      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 py-1">
          <button
            type="button"
            onClick={() => onTabChange('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'calculator'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200 border-b-transparent'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
            }`}
          >
            <Calculator className="w-4 h-4 text-sky-700" />
            <span>Calculadora Laboral</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold transition-all ${
              activeTab === 'notes'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200 border-b-transparent'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/70'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Bloc de Notas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
