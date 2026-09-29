import React from 'react';
import { 
  FileDown, 
  Printer, 
  Receipt, 
  MinusCircle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { EmployeeData, CalculationResult } from '../types';
import { formatCurrency } from '../utils/calculator';
import { generateLaborLiquidationPDF } from '../utils/pdfGenerator';

interface SummaryCardProps {
  data: EmployeeData;
  results: CalculationResult;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ data, results }) => {
  const handleDownloadPDF = () => {
    generateLaborLiquidationPDF(data, results);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-gradient-to-b from-slate-800/95 to-slate-900/95 border-2 border-blue-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-md sticky top-20">
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-500/15 text-blue-400 rounded-lg">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Resumen de Liquidación</h3>
            <p className="text-xs text-slate-400">Totales calculados en tiempo real</p>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold">
          Calculado
        </span>
      </div>

      {/* Desglose de Rubros */}
      <div className="space-y-3 mb-6 text-sm">
        {/* 1. Indemnización */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-xs">
            {data.terminationType === 'despido_injustificado' ? '1. Indemnización (Despido):' : '1. Compensación Renuncia:'}
          </span>
          <span className={`font-mono font-bold text-xs ${results.indemnityBlocked ? 'text-red-400' : 'text-slate-100'}`}>
            {results.indemnityBlocked ? '$0.00' : formatCurrency(results.indemnityAmount)}
          </span>
        </div>

        {/* 2. Aguinaldo */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-xs">
            2. Aguinaldo ({results.aguinaldoIsProportional ? 'Proporcional' : 'Completo'}):
          </span>
          <span className="font-mono font-bold text-xs text-slate-100">
            {formatCurrency(results.aguinaldoAmount)}
          </span>
        </div>

        {/* 3. Vacaciones */}
        <div className="flex items-center justify-between">
          <span className="text-slate-300 text-xs">
            3. Vacación + Prima (+30%):
          </span>
          <span className="font-mono font-bold text-xs text-slate-100">
            {formatCurrency(results.vacationTotalAmount)}
          </span>
        </div>

        {/* 4. Asuetos */}
        {results.holidaysWorkedCount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs">
              4. Asuetos ({results.holidaysWorkedCount} días):
            </span>
            <span className="font-mono font-bold text-xs text-rose-300">
              +{formatCurrency(results.holidaysWorkedAmount)}
            </span>
          </div>
        )}

        {/* 5. Horas Extras */}
        {results.overtimeTotalHours > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs">
              5. Horas Extras ({results.overtimeTotalHours}h):
            </span>
            <span className="font-mono font-bold text-xs text-purple-300">
              +{formatCurrency(results.overtimeTotalAmount)}
            </span>
          </div>
        )}

        {/* TOTAL SIN AFP NI SEGURO SOCIAL */}
        <div className="pt-3 border-t border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-sky-400 block">
              TOTAL SIN AFP NI SEGURO SOCIAL
            </span>
            <span className="text-[10px] text-slate-400">(Monto Bruto Devengado)</span>
          </div>
          <span className="text-base font-extrabold text-sky-400 font-mono">
            {formatCurrency(results.grossTotal)}
          </span>
        </div>

        {/* DEDUCCIONES DE LEY */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 mt-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MinusCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Deducciones de Ley</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>ISSS (3% - Tope legal $30.00):</span>
            <span className="font-mono font-semibold text-red-400">-{formatCurrency(results.isssDeduction)}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span>AFP (7.25% Fondo Pensiones):</span>
            <span className="font-mono font-semibold text-red-400">-{formatCurrency(results.afpDeduction)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">Total Deducciones:</span>
            <span className="font-mono font-bold text-red-400">-{formatCurrency(results.totalDeductions)}</span>
          </div>
        </div>

        {/* TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/50 via-indigo-900/50 to-blue-900/50 border border-blue-500/50 shadow-inner">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-200 block mb-1">
            TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] text-slate-300">Líquido a Pagar / Recibir</span>
            <span className="text-2xl font-black text-white font-mono tracking-tight drop-shadow-md">
              {formatCurrency(results.netTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all transform active:scale-95"
        >
          <FileDown className="w-5 h-5" />
          <span>DESCARGAR RESUMEN EN PDF</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir Hoja de Liquidación</span>
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 leading-tight">
          Cálculos fundamentados en los Artículos 58, 177, 182, 190, 192, 196 del Código de Trabajo y la Ley de Renuncia Voluntaria de El Salvador.
        </p>
      </div>
    </div>
  );
};
