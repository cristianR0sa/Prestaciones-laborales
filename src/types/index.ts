export type TipoTerminacion = 'despido_injustificado' | 'renuncia_voluntaria';
export type SectorEconomico = 'comercio' | 'maquila' | 'agropecuario';
export type TipoCargo = 'empleado' | 'jefatura';

export interface DatosEmpleado {
  // 0. Datos de la Relación Laboral
  nombreCompleto: string;
  empresa: string;
  dui?: string;
  cargo?: string;
  sectorEconomico: SectorEconomico; // Comercio, Maquila, Agropecuario
  tipoCargo: TipoCargo; // Empleado (15d preaviso) vs Jefatura (30d preaviso)
  
  // 1. Datos Financieros y Período
  salarioMensual: number; // Salario mensual
  anosLaboradosInput: number; // Años laborados
  mesesLaboradosInput: number; // Meses laborados (0-11)
  fechaInicio: string; // YYYY-MM-DD
  fechaFin: string; // YYYY-MM-DD
  fechaInicioVacaciones: string;
  fechaFinVacaciones: string;
  tipoCalculoVacaciones?: 'completo' | 'proporcional';
  
  // 2. Causa de Finalización
  tipoTerminacion: TipoTerminacion;
  informoAlPatrono: boolean | null; // Preaviso en renuncia
  
  // 3. Aguinaldo
  tipoAguinaldo: 'auto' | 'completo' | 'proporcional';
  
  // 4. Días de Asueto Laborados
  laboroAsuetos: boolean;
  asuetosSeleccionados: string[];
  
  // 5. Jornadas Extraordinarias y Descanso Semanal
  noAplicaHorasExtras: boolean;
  registrosHorasExtras: RegistroHoraExtra[];
  diasDescansoLaborados: number; // Días de descanso semanal laborados
}

export interface RegistroHoraExtra {
  id: string;
  fecha: string;
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  horasTotales: number;
  tipo: 'diurna' | 'nocturna' | 'mixta';
  horasDiurnas: number;
  horasNocturnas: number;
  montoCalculado: number;
  descripcion?: string;
}

export interface DiaAsueto {
  id: string;
  nombre: string;
  fechaTexto: string;
  descripcion: string;
  esSanMiguel?: boolean;
}

export interface ResultadoLiquidacion {
  haCalculado: boolean;
  
  // Antigüedad
  anosTrabajados: number;
  mesesTrabajados: number;
  diasTrabajados: number;
  totalDiasTrabajados: number;
  
  // Salarios base y sector
  salarioMinimoSector: number;
  salarioDiario: number;
  salarioPorHora: number;
  
  // 1. Indemnización
  baseIndemnizacion: number;
  salarioDiarioTopado: number;
  aplicaTopeLegal: boolean;
  aplicaMinimoLegal15Dias: boolean;
  montoIndemnizacion: number;
  indemnizacionBloqueada: boolean;
  motivoBloqueoIndemnizacion?: string;
  
  // 2. Aguinaldo
  diasAguinaldoDerecho: number;
  tramoAntiguedadAguinaldo: string;
  diasTrabajadosPeriodoAguinaldo: number;
  aguinaldoEsProporcional: boolean;
  montoAguinaldo: number;
  
  // 3. Vacaciones
  diasVacacionesPagar: number;
  montoBaseVacacion: number;
  montoPrimaVacacional: number;
  totalVacaciones: number;
  vacacionEsProporcional: boolean;
  
  // 4. Asuetos
  cantidadAsuetosLaborados: number;
  montoAsuetosLaborados: number;
  detalleAsuetos: { nombre: string; fecha: string; monto: number }[];
  
  // 5. Horas Extras y Descanso
  totalHorasExtras: number;
  horasExtrasDiurnas: number;
  horasExtrasNocturnas: number;
  montoHorasExtras: number;
  diasDescansoTrabajados: number;
  montoDescansoTrabajado: number;
  
  // 6. Base Cotizable y Deducciones
  baseCotizableISSS_AFP: number;
  totalBruto: number; // TOTAL SIN AFP NI SEGURO SOCIAL
  descuentoISSS: number; // ISSS 3% (Tope $30)
  descuentoAFP: number; // AFP 7.25%
  totalDeducciones: number;
  totalNeto: number; // TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP
}
