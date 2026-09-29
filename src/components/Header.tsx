import React from 'react';
import { Calculator, BookOpen, Scale, FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'calculator' | 'notes';
  onTabChange: (tab: 'calculator' | 'notes') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="w-full bg-[#0a2e5c] text-white shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-[#072142] flex items-center justify-center text-white shadow-inner">
            <Scale className="w-6 h-6 text-sky-300" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Calculadora de Prestaciones
            </h1>
            <p className="text-xs sm:text-sm text-sky-200/90 font-medium">
              El Salvador — Código de Trabajo
            </p>
          </div>
        </div>

        {/* Right: Academic Project Metadata */}
        <div className="text-center md:text-right text-xs text-sky-100/80 leading-snug">
          <span className="font-extrabold tracking-wider text-sky-300 uppercase block text-[11px]">
            PROYECTO ACADÉMICO
          </span>
          <span className="font-medium text-white block">
            Ingeniería en Sistemas y Redes Informáticas
          </span>
          <span className="text-sky-200/70 text-[11px] block">
            Derecho Empresarial e Informático — Bloque 2
          </span>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#082447] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onTabChange('calculator')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${
              activeTab === 'calculator'
                ? 'border-sky-400 text-white bg-[#0c3566]'
                : 'border-transparent text-sky-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-4 h-4 text-sky-400" />
            <span>Calculadora Laboral</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('notes')}
            className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold transition-all border-b-2 ${
              activeTab === 'notes'
                ? 'border-sky-400 text-white bg-[#0c3566]'
                : 'border-transparent text-sky-200/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Bloc de Notas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
