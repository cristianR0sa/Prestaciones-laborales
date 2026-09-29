import React from 'react';
import { 
  FileText, 
  FileDown
} from 'lucide-react';
import { DatosEmpleado, ResultadoLiquidacion } from '../types';
import { formatearMoneda } from '../utils/calculator';
import { generarLiquidacionPDF } from '../utils/pdfGenerator';

interface PropsResultadosLiquidacion {
  datos: DatosEmpleado;
  resultados: ResultadoLiquidacion;
  haCalculado: boolean;
}

export const LiquidationResults: React.FC<PropsResultadosLiquidacion> = ({
  datos,
  resultados,
  haCalculado
}) => {
  const descargarPDF = () => {
    generarLiquidacionPDF(datos, resultados);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TARJETA PRINCIPAL: LIQUIDACIÓN LABORAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#0a2e5c] text-white px-5 py-4">
          <h3 className="text-base font-extrabold tracking-tight">Liquidación Laboral</h3>
          <p className="text-xs text-sky-200/90 font-medium">
            Complete el formulario y presione "Calcular"
          </p>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">
          {!haCalculado ? (
            /* Estado Inicial / Sin Resultados */
            <div className="py-14 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-700">Sin resultados aún</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Ingrese los datos laborales para ver la liquidación
              </p>
            </div>
          ) : (
            /* Estado Con Resultados Calculados */
            <div className="space-y-4">
              
              {/* Desglose de Prestaciones */}
              <div className="space-y-2.5 text-xs">
                
                {/* 1. Indemnización */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">
                      {datos.tipoTerminacion === 'despido_injustificado' ? 'Indemnización por despido' : 'Compensación por renuncia'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {datos.tipoTerminacion === 'despido_injustificado' 
                        ? `Art. 58 CT (${resultados.anosTrabajados}a ${resultados.mesesTrabajados}m)` 
                        : (datos.informoAlPatrono ? 'Ley de Renuncia' : 'Bloqueado por falta de preaviso')}
                    </span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${resultados.indemnizacionBloqueada ? 'text-red-500' : 'text-slate-900'}`}>
                    {resultados.indemnizacionBloqueada ? '$0.00' : formatearMoneda(resultados.montoIndemnizacion)}
                  </span>
                </div>

                {/* 2. Aguinaldo */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Aguinaldo</span>
                    <span className="text-[11px] text-slate-500">
                      {resultados.aguinaldoEsProporcional 
                        ? `Proporcional (${resultados.diasTrabajadosPeriodoAguinaldo} días)` 
                        : `Completo (${resultados.diasAguinaldoDerecho} días)`}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {formatearMoneda(resultados.montoAguinaldo)}
                  </span>
                </div>

                {/* 3. Vacaciones */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800 block">Vacación + Prima (30%)</span>
                    <span className="text-[11px] text-slate-500">
                      {resultados.diasVacacionesPagar.toFixed(1)} días computados
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-slate-900">
                    {formatearMoneda(resultados.totalVacaciones)}
                  </span>
                </div>

                {/* 4. Asuetos */}
                {resultados.cantidadAsuetosLaborados > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 block">Días de asueto laborados</span>
                      <span className="text-[11px] text-slate-500">{resultados.cantidadAsuetosLaborados} día(s) (pago doble)</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      +{formatearMoneda(resultados.montoAsuetosLaborados)}
                    </span>
                  </div>
                )}

                {/* 5. Horas Extras */}
                {resultados.totalHorasExtras > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 block">Horas extraordinarias</span>
                      <span className="text-[11px] text-slate-500">
                        {resultados.totalHorasExtras}h (Diurnas: {resultados.horasExtrasDiurnas}h, Nocturnas: {resultados.horasExtrasNocturnas}h)
                      </span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      +{formatearMoneda(resultados.montoHorasExtras)}
                    </span>
                  </div>
                )}

                {/* 6. Descanso Semanal */}
                {resultados.diasDescansoTrabajados > 0 && (
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 block">Descanso semanal laborado</span>
                      <span className="text-[11px] text-slate-500">{resultados.diasDescansoTrabajados} día(s) (Art. 173 CT)</span>
                    </div>
                    <span className="font-mono font-bold text-sm text-slate-900">
                      +{formatearMoneda(resultados.montoDescansoTrabajado)}
                    </span>
                  </div>
                )}
              </div>

              {/* TOTAL SIN AFP NI SEGURO SOCIAL */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 uppercase block">
                    TOTAL SIN AFP NI SEGURO SOCIAL
                  </span>
                  <span className="text-[10px] text-slate-400">Total bruto devengado</span>
                </div>
                <span className="text-base font-extrabold text-[#0a2e5c] font-mono">
                  {formatearMoneda(resultados.totalBruto)}
                </span>
              </div>

              {/* DEDUCCIONES DE LEY */}
              <div className="p-3 rounded-lg bg-red-50/60 border border-red-200 space-y-1 text-xs">
                <span className="text-[10px] font-bold text-red-900 uppercase block mb-1">
                  DEDUCCIONES DE LEY
                </span>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>ISSS (3% - Tope $30.00):</span>
                  <span className="font-mono font-semibold text-red-700">-{formatearMoneda(resultados.descuentoISSS)}</span>
                </div>
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>AFP (7.25%):</span>
                  <span className="font-mono font-semibold text-red-700">-{formatearMoneda(resultados.descuentoAFP)}</span>
                </div>
              </div>

              {/* TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP */}
              <div className="p-4 bg-[#0a2e5c] text-white rounded-xl shadow-md">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-sky-200 block mb-0.5">
                  TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-sky-200/80">Monto líquido a pagar</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-white">
                    {formatearMoneda(resultados.totalNeto)}
                  </span>
                </div>
              </div>

              {/* Botón de Exportar PDF */}
              <button
                type="button"
                onClick={descargarPDF}
                className="w-full flex items-center justify-center gap-2 bg-[#082447] hover:bg-[#061c37] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-sm transition-all"
              >
                <FileDown className="w-4 h-4 text-sky-300" />
                <span>Exportar PDF del resumen completo</span>
              </button>

            </div>
          )}
        </div>
      </div>

      {/* 2. TARJETA INFORMATIVA: ¿QUÉ SE CALCULA? */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-4">
          ¿QUÉ SE CALCULA?
        </h4>

        <ul className="space-y-2.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Vacación proporcional (Art. 177)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Aguinaldo completo o proporcional (Art. 196–198)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Indemnización con tope legal (Art. 58) — solo despido</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Horas extras diurnas y nocturnas por fecha/hora</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Días de asueto y descanso semanal (Art. 190–173)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Totales bruto y neto (ISSS 3% + AFP 7.25%)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
            <span>Exportar PDF del resumen completo</span>
          </li>
        </ul>
      </div>

    </div>
  );
};
