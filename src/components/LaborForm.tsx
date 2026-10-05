import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Plus, 
  Trash2, 
  AlertTriangle
} from 'lucide-react';
import { DatosEmpleado, ResultadoLiquidacion, RegistroHoraExtra } from '../types';
import { DIAS_ASUETO_OFICIALES } from '../constants/holidays';
import { deducirTipoHoraExtra, formatearMoneda, calcularDiferenciaFechas } from '../utils/calculator';

interface PropsFormularioLaboral {
  datos: DatosEmpleado;
  resultados: ResultadoLiquidacion;
  alCambiar: (campos: Partial<DatosEmpleado>) => void;
  alCalcular: () => void;
  alLimpiar: () => void;
}

const calcularFechaMaximaVacaciones = (fechaInicio: string): string => {
  const [ano, mes, dia] = fechaInicio.split('-').map(Number);
  const fecha = new Date(ano, mes - 1, dia);
  let diasContados = 0;

  while (diasContados < 15) {
    if (fecha.getDay() !== 0) diasContados++;
    if (diasContados < 15) fecha.setDate(fecha.getDate() + 1);
  }

  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
};

const contarDiasVacaciones = (fechaInicio: string, fechaFin: string): number => {
  const [anoInicio, mesInicio, diaInicio] = fechaInicio.split('-').map(Number);
  const [anoFin, mesFin, diaFin] = fechaFin.split('-').map(Number);
  const fecha = new Date(anoInicio, mesInicio - 1, diaInicio);
  const ultimaFecha = new Date(anoFin, mesFin - 1, diaFin);
  let diasContados = 0;

  while (fecha <= ultimaFecha) {
    if (fecha.getDay() !== 0) diasContados++;
    fecha.setDate(fecha.getDate() + 1);
  }

  return diasContados;
};

export const LaborForm: React.FC<PropsFormularioLaboral> = ({
  datos,
  resultados,
  alCambiar,
  alCalcular,
  alLimpiar
}) => {
  const hoy = new Date();
  const fechaHoy = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  const fechaMaximaVacaciones = datos.fechaInicioVacaciones
    ? [calcularFechaMaximaVacaciones(datos.fechaInicioVacaciones), fechaHoy].sort()[0]
    : fechaHoy;

  // Manejadores sincronizados de fechas
  const manejarCambioFechaInicio = (nuevaFechaInicio: string) => {
    if (nuevaFechaInicio && datos.fechaFin) {
      const antiguedad = calcularDiferenciaFechas(nuevaFechaInicio, datos.fechaFin);
      alCambiar({ 
        fechaInicio: nuevaFechaInicio,
        anosLaboradosInput: antiguedad.anos,
        mesesLaboradosInput: antiguedad.meses
      });
    } else {
      alCambiar({ fechaInicio: nuevaFechaInicio, anosLaboradosInput: 0, mesesLaboradosInput: 0 });
    }
  };

  const manejarCambioFechaFin = (nuevaFechaFin: string) => {
    if (datos.fechaInicio && nuevaFechaFin) {
      const antiguedad = calcularDiferenciaFechas(datos.fechaInicio, nuevaFechaFin);
      alCambiar({ 
        fechaFin: nuevaFechaFin,
        anosLaboradosInput: antiguedad.anos,
        mesesLaboradosInput: antiguedad.meses
      });
    } else {
      alCambiar({ fechaFin: nuevaFechaFin, anosLaboradosInput: 0, mesesLaboradosInput: 0 });
    }
  };

  // Estado modal de Horas Extras
  const [mostrarModalHorasExtras, setMostrarModalHorasExtras] = useState(false);
  const [fechaHE, setFechaHE] = useState<string>(datos.fechaFin || new Date().toISOString().slice(0, 10));
  const [horaInicioHE, setHoraInicioHE] = useState<string>('17:00');
  const [horaFinHE, setHoraFinHE] = useState<string>('21:00');

  const vistaPreviaHE = deducirTipoHoraExtra(horaInicioHE, horaFinHE);
  const tarifaPorHora = resultados.salarioPorHora || (Number(datos.salarioMensual) / 30 / 8);
  const montoVistaPreviaHE = (vistaPreviaHE.horasDiurnas * tarifaPorHora * 2.0) + (vistaPreviaHE.horasNocturnas * tarifaPorHora * 2.5);

  const agregarHoraExtra = () => {
    if (!horaInicioHE || !horaFinHE || vistaPreviaHE.horasTotales <= 0) return;

    const nuevoRegistro: RegistroHoraExtra = {
      id: Math.random().toString(36).substring(2, 9),
      fecha: fechaHE,
      horaInicio: horaInicioHE,
      horaFin: horaFinHE,
      horasTotales: vistaPreviaHE.horasTotales,
      tipo: vistaPreviaHE.tipo,
      horasDiurnas: vistaPreviaHE.horasDiurnas,
      horasNocturnas: vistaPreviaHE.horasNocturnas,
      montoCalculado: montoVistaPreviaHE
    };

    alCambiar({
      registrosHorasExtras: [...datos.registrosHorasExtras, nuevoRegistro]
    });
    setMostrarModalHorasExtras(false);
  };

  const eliminarHoraExtra = (id: string) => {
    alCambiar({
      registrosHorasExtras: datos.registrosHorasExtras.filter(e => e.id !== id)
    });
  };

  const alternarDiaAsueto = (idAsueto: string) => {
    const yaEstaSeleccionado = datos.asuetosSeleccionados.includes(idAsueto);
    let nuevosSeleccionados: string[];
    if (yaEstaSeleccionado) {
      nuevosSeleccionados = datos.asuetosSeleccionados.filter(id => id !== idAsueto);
    } else {
      nuevosSeleccionados = [...datos.asuetosSeleccionados, idAsueto];
    }
    alCambiar({ asuetosSeleccionados: nuevosSeleccionados });
  };

  return (
    <div className="space-y-6">
      
      {/* 0. DATOS DE LA RELACIÓN LABORAL */}
      <div className="bg-white/85 rounded-2xl border border-slate-200/80 shadow-[0_18px_35px_rgba(15,23,42,0.04)] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            0
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800">
            DATOS DE LA RELACIÓN LABORAL
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              NOMBRE DEL TRABAJADOR
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Carlos Pérez López"
              value={datos.nombreCompleto}
              onChange={(e) => alCambiar({ nombreCompleto: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              PATRONO / EMPRESA
            </label>
            <input
              type="text"
              placeholder="Ej. Comercial SV, S.A. de C.V."
              value={datos.empresa}
              onChange={(e) => alCambiar({ empresa: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              CARGO DESEMPEÑADO
            </label>
            <input
              type="text"
              placeholder="Ej. Ingeniero de Software / Asistente"
              value={datos.cargo || ''}
              onChange={(e) => alCambiar({ cargo: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              DUI DEL TRABAJADOR (OPCIONAL)
            </label>
            <input
              type="text"
              placeholder="Ej. 12345678-9"
              value={datos.dui || ''}
              onChange={(e) => alCambiar({ dui: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Selector de Sector Económico */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            SECTOR ECONÓMICO (SALARIO MÍNIMO Y TOPE LEGAL)
          </label>
          <select
            value={datos.sectorEconomico || 'comercio'}
            onChange={(e) => alCambiar({ sectorEconomico: e.target.value as any })}
            className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-300 transition-all"
          >
            <option value="comercio">Comercio y Servicios — Salario mín. $408.80 (Tope máx. 4 salarios: $1,635.20)</option>
            <option value="industria">Industria — Salario mín. $408.80 (Tope máx. 4 salarios: $1,635.20)</option>
            <option value="maquila">Maquila Textil y Confección — Salario mín. $402.32 (Tope: $1,609.28)</option>
            <option value="agricultura">Agricultura (Recolección de cosecha) — Salario mín. $305.23 (Tope: $1,220.92)</option>
            <option value="agropecuario">Agropecuario, pesca, otras activ. y café — Salario mín. $272.53 (Tope: $1,090.12)</option>
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Ajusta automáticamente el tope de 4 salarios mínimos vigentes 2026 para la indemnización (Art. 58 CT).
          </span>
        </div>
      </div>

      {/* 1. DATOS FINANCIEROS Y PERÍODO */}
      <div className="bg-white/85 rounded-2xl border border-slate-200/80 shadow-[0_18px_35px_rgba(15,23,42,0.04)] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            1
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800">
            DATOS FINANCIEROS Y PERÍODO
          </h2>
        </div>

        {/* Salario Mensual */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            SALARIO MENSUAL <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-sm">
              $
            </div>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={datos.salarioMensual ? datos.salarioMensual : ''}
              onChange={(e) => alCambiar({ salarioMensual: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0 })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3.5 py-2.5 text-sm text-slate-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] focus:border-transparent transition-all placeholder:text-slate-400 placeholder:font-normal"
              required
            />
          </div>
        </div>

        {/* Fechas de Inicio y Finalización */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>FECHA DE INICIO DE LA PRESTACIÓN</span>
            </label>
            <input
              type="date"
              min="1970-01-01"
              max={fechaHoy}
              value={datos.fechaInicio}
              onChange={(e) => {
                if (e.target.value <= fechaHoy) manejarCambioFechaInicio(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>FECHA DE FINALIZACIÓN</span>
            </label>
            <input
              type="date"
              min="1970-01-01"
              max={fechaHoy}
              value={datos.fechaFin}
              onChange={(e) => {
                if (e.target.value <= fechaHoy) manejarCambioFechaFin(e.target.value);
              }}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c]"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 mb-4">
          Al elegir las fechas de inicio y fin, los años y meses laborados se calculan automáticamente. También puedes escribir la fecha directamente con el teclado (ej. 01/01/2020) o pulsar sobre el año en el calendario para retroceder rápidamente.
        </p>

        {/* Años y Meses Laborados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              AÑOS LABORADOS
            </label>
            <input
              type="number"
              value={datos.anosLaboradosInput ? datos.anosLaboradosInput : ''}
              readOnly
              aria-readonly="true"
              placeholder="Se calcula con las fechas"
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              MESES LABORADOS
            </label>
            <input
              type="number"
              value={datos.mesesLaboradosInput ? datos.mesesLaboradosInput : ''}
              readOnly
              aria-readonly="true"
              placeholder="Se calcula con las fechas"
              className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 font-semibold cursor-not-allowed"
            />
          </div>
        </div>

        {/* Período de Vacaciones Gozadas */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>PERÍODO DE VACACIONES GOZADAS (MÁX. 15 DÍAS)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Inicio vacaciones</span>
              <input
                type="date"
                min="1970-01-01"
                max={fechaHoy}
                value={datos.fechaInicioVacaciones}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  if (nuevaFecha > fechaHoy) return;

                  const finActualValido = nuevaFecha && datos.fechaFinVacaciones >= nuevaFecha &&
                    datos.fechaFinVacaciones <= [calcularFechaMaximaVacaciones(nuevaFecha), fechaHoy].sort()[0] &&
                    contarDiasVacaciones(nuevaFecha, datos.fechaFinVacaciones) <= 15;
                  alCambiar({
                    fechaInicioVacaciones: nuevaFecha,
                    ...(!finActualValido ? { fechaFinVacaciones: '' } : {})
                  });
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0a2e5c]"
              />
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block mb-1">Fin vacaciones</span>
              <input
                type="date"
                min={datos.fechaInicioVacaciones || '1970-01-01'}
                max={fechaMaximaVacaciones}
                value={datos.fechaFinVacaciones}
                onChange={(e) => {
                  const nuevaFecha = e.target.value;
                  if (!nuevaFecha) {
                    alCambiar({ fechaFinVacaciones: '' });
                    return;
                  }
                  if (!datos.fechaInicioVacaciones || nuevaFecha < datos.fechaInicioVacaciones ||
                    nuevaFecha > fechaMaximaVacaciones || contarDiasVacaciones(datos.fechaInicioVacaciones, nuevaFecha) > 15) return;
                  alCambiar({ fechaFinVacaciones: nuevaFecha });
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0a2e5c]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CAUSA DE FINALIZACIÓN */}
      <div className="bg-white/85 rounded-2xl border border-slate-200/80 shadow-[0_18px_35px_rgba(15,23,42,0.04)] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            2
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800">
            CAUSA DE FINALIZACIÓN
          </h2>
        </div>

        <div className="space-y-3">
          {/* Despido Injustificado */}
          <label
            onClick={() => alCambiar({ tipoTerminacion: 'despido_injustificado' })}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              datos.tipoTerminacion === 'despido_injustificado'
                ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <input
              type="radio"
              name="tipoTerminacion"
              checked={datos.tipoTerminacion === 'despido_injustificado'}
              onChange={() => alCambiar({ tipoTerminacion: 'despido_injustificado' })}
              className="mt-1 text-[#0a2e5c] focus:ring-[#0a2e5c]"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block">Despido injustificado</span>
              <span className="text-xs text-slate-500">
                El patrono da por terminado el contrato sin causa justificada — Art. 58 CT
              </span>
            </div>
          </label>

          {/* Renuncia Voluntaria */}
          <label
            onClick={() => alCambiar({ tipoTerminacion: 'renuncia_voluntaria' })}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              datos.tipoTerminacion === 'renuncia_voluntaria'
                ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-600'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
            }`}
          >
            <input
              type="radio"
              name="tipoTerminacion"
              checked={datos.tipoTerminacion === 'renuncia_voluntaria'}
              onChange={() => alCambiar({ tipoTerminacion: 'renuncia_voluntaria' })}
              className="mt-1 text-[#0a2e5c] focus:ring-[#0a2e5c]"
            />
            <div>
              <span className="font-bold text-sm text-slate-900 block">Renuncia voluntaria</span>
              <span className="text-xs text-slate-500">
                El trabajador presenta su renuncia al cargo
              </span>
            </div>
          </label>
        </div>

        {/* Modal / Cuadro de Renuncia Voluntaria */}
        {datos.tipoTerminacion === 'renuncia_voluntaria' && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50/80 border border-amber-300 space-y-3">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
              Validación de Preaviso Legal al Patrono
            </span>

            {/* Selector de Cargo: Empleado vs Jefatura */}
            <div>
              <label className="block text-[11px] font-bold text-amber-950 uppercase tracking-wide mb-1">
                Tipo de Cargo / Nivel de Responsabilidad
              </label>
              <select
                value={datos.tipoCargo || 'empleado'}
                onChange={(e) => alCambiar({ tipoCargo: e.target.value as any })}
                className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="empleado">Empleado general / Operativo / Administrativo (Preaviso legal: 15 días)</option>
                <option value="jefatura">Jefatura / Gerencia / Personal Especializado (Preaviso legal: 30 días)</option>
              </select>
            </div>

            <p className="text-xs text-amber-900">
              ¿Informó y notificó oportunamente al patrono con el preaviso legal de <strong>{datos.tipoCargo === 'jefatura' ? '30 días' : '15 días'}</strong> de anticipación?
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => alCambiar({ informoAlPatrono: true })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  datos.informoAlPatrono === true
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Sí, se informó ({datos.tipoCargo === 'jefatura' ? '30d' : '15d'})
              </button>

              <button
                type="button"
                onClick={() => alCambiar({ informoAlPatrono: false })}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  datos.informoAlPatrono === false
                    ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500'
                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                NO se informó
              </button>
            </div>

            {datos.informoAlPatrono === false && (
              <div className="p-3 bg-red-100 border border-red-300 rounded-lg text-red-900 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>
                  <strong>BLOQUEO LEGAL:</strong> Al no otorgar el preaviso correspondiente de ley ({datos.tipoCargo === 'jefatura' ? '30 días' : '15 días'}), el sistema bloquea la compensación económica de renuncia (Monto = $0.00).
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. AGUINALDO */}
      <div className="bg-white/85 rounded-2xl border border-slate-200/80 shadow-[0_18px_35px_rgba(15,23,42,0.04)] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            3
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800">
            AGUINALDO
          </h2>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Ingrese la fecha de finalización para determinar si corresponde aguinaldo completo o proporcional.
        </p>

        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-center justify-between">
          <span>Régimen aplicable: <strong>{resultados.tramoAntiguedadAguinaldo}</strong></span>
          <span className="text-blue-700 font-bold">
            {resultados.aguinaldoEsProporcional ? 'Proporcional' : 'Completo (100%)'}
          </span>
        </div>
      </div>

      {/* 4. DÍAS DE ASUETO LABORADOS */}
      <div className="bg-white/85 rounded-2xl border border-slate-200/80 shadow-[0_18px_35px_rgba(15,23,42,0.04)] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-900 to-sky-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            4
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.14em] text-slate-800">
            DÍAS DE ASUETO LABORADOS
          </h2>
        </div>

        <p className="text-xs text-slate-700 font-semibold mb-3">
          ¿El trabajador laboró en algún día de asueto? (Art. 192 CT — doble salario)
        </p>

        <div className="flex gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="radio"
              name="laboroAsuetos"
              checked={datos.laboroAsuetos}
              onChange={() => alCambiar({ laboroAsuetos: true })}
              className="text-[#0a2e5c] focus:ring-[#0a2e5c]"
            />
            <span>Sí, laboró</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
            <input
              type="radio"
              name="laboroAsuetos"
              checked={!datos.laboroAsuetos}
              onChange={() => alCambiar({ laboroAsuetos: false, asuetosSeleccionados: [] })}
              className="text-[#0a2e5c] focus:ring-[#0a2e5c]"
            />
            <span>No laboró</span>
          </label>
        </div>

        {!datos.laboroAsuetos ? (
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-400">
            Sin días de asueto laborados — monto: $0.00
          </div>
        ) : (
          <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50 max-h-56 overflow-y-auto">
            <span className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
              Marque los días festivos laborados:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIAS_ASUETO_OFICIALES.map(asueto => (
                <label
                  key={asueto.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                    datos.asuetosSeleccionados.includes(asueto.id)
                      ? 'bg-blue-50 border-blue-400 text-blue-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={datos.asuetosSeleccionados.includes(asueto.id)}
                    onChange={() => alternarDiaAsueto(asueto.id)}
                    className="rounded text-[#0a2e5c]"
                  />
                  <div className="truncate">
                    <span>{asueto.nombre}</span>
                    <span className="text-[10px] text-slate-400 block">{asueto.fechaTexto}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. JORNADAS EXTRAORDINARIAS Y DESCANSO SEMANAL */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-3 pb-3 mb-4 border-b border-slate-100">
          <span className="w-6 h-6 rounded-full bg-[#0a2e5c] text-white flex items-center justify-center font-bold text-xs">
            5
          </span>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-[#0a2e5c]">
            JORNADAS EXTRAORDINARIAS Y DESCANSO SEMANAL
          </h2>
        </div>

        {/* Checkbox No aplica */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={datos.noAplicaHorasExtras}
            onChange={(e) => alCambiar({ noAplicaHorasExtras: e.target.checked, registrosHorasExtras: [], diasDescansoLaborados: 0 })}
            className="rounded text-[#0a2e5c] focus:ring-[#0a2e5c]"
          />
          <span>No aplica — Sin horas extras ni descanso semanal laborado</span>
        </label>

        {!datos.noAplicaHorasExtras && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-1">
                HORAS EXTRAORDINARIAS NO PAGADAS
              </span>
              <p className="text-[11px] text-slate-500 leading-relaxed mb-2">
                Registre cada jornada con fecha y hora. El sistema clasifica automáticamente en diurna (06:00–19:00) o nocturna (19:00–06:00). Fecha máxima: mes anterior.
              </p>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-3 text-[11px]">
                <span className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md font-semibold">
                  Diurna (06:00–19:00) — Recargo 100%
                </span>
                <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-semibold">
                  Nocturna (19:00–06:00) — Recargo 150%
                </span>
              </div>

              {/* Empty state or list */}
              {datos.registrosHorasExtras.length === 0 ? (
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-400 mb-3">
                  Sin registros. Presiona "+ Agregar jornada" para registrar horas no pagadas.
                </div>
              ) : (
                <div className="space-y-2 mb-3">
                  {datos.registrosHorasExtras.map(registro => (
                    <div key={registro.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-slate-800">{registro.fecha}</span>
                        <span className="text-slate-500">({registro.horaInicio} a {registro.horaFin})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          registro.tipo === 'nocturna' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {registro.horasTotales}h ({registro.tipo})
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 font-mono">{formatearMoneda(registro.montoCalculado)}</span>
                        <button
                          type="button"
                          onClick={() => eliminarHoraExtra(registro.id)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => setMostrarModalHorasExtras(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0a2e5c] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Agregar jornada extraordinaria</span>
              </button>
            </div>

            {/* Días de Descanso Semanal */}
            <div className="pt-3 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                DÍAS DE DESCANSO SEMANAL LABORADOS
              </label>
              <input
                type="number"
                min="0"
                value={datos.diasDescansoLaborados ? datos.diasDescansoLaborados : ''}
                onChange={(e) => alCambiar({ diasDescansoLaborados: e.target.value === '' ? 0 : parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full sm:w-48 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a2e5c] placeholder:text-slate-400 placeholder:font-normal"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Doble salario — Art. 173 CT
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BOTONES DE ACCIÓN: CALCULAR & LIMPIAR */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={alCalcular}
          className="flex-1 bg-[#0a2e5c] hover:bg-[#082447] active:scale-[0.99] text-white font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-md transition-all tracking-wider uppercase text-center"
        >
          CALCULAR LIQUIDACIÓN
        </button>

        <button
          type="button"
          onClick={alLimpiar}
          className="sm:w-36 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-sm py-3.5 px-6 rounded-xl transition-all uppercase text-center"
        >
          LIMPIAR
        </button>
      </div>

      {/* MODAL / FORMULARIO OVERTIME POPUP */}
      {mostrarModalHorasExtras && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-[#0a2e5c] mb-1">
              Agregar Jornada Extraordinaria
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Indique fecha y horario trabajado para clasificar automáticamente.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de la Jornada</label>
                <input
                  type="date"
                  min="1970-01-01"
                  max="2099-12-31"
                  value={fechaHE}
                  onChange={(e) => setFechaHE(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={horaInicioHE}
                    onChange={(e) => setHoraInicioHE(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={horaFinHE}
                    onChange={(e) => setHoraFinHE(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs flex justify-between items-center">
                <span>Detección: <strong>{vistaPreviaHE.tipo} ({vistaPreviaHE.horasTotales} hrs)</strong></span>
                <span className="font-bold text-[#0a2e5c]">{formatearMoneda(montoVistaPreviaHE)}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={agregarHoraExtra}
                className="flex-1 bg-[#0a2e5c] text-white text-xs font-bold py-2.5 rounded-lg"
              >
                Añadir Turno
              </button>
              <button
                type="button"
                onClick={() => setMostrarModalHorasExtras(false)}
                className="px-4 border border-slate-300 text-slate-700 text-xs font-bold py-2.5 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
