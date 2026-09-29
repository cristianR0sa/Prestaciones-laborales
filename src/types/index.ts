export type TerminationType = 'despido_injustificado' | 'renuncia_voluntaria';

export interface EmployeeData {
  // 0. Datos de la Relación Laboral
  fullName: string;
  companyName: string;
  documentId?: string;
  position?: string;
  
  // 1. Datos Financieros y Período
  salary: number; // Salario mensual
  yearsWorkedInput: number; // Años laborados
  monthsWorkedInput: number; // Meses laborados (0-11)
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  vacationStartDate: string;
  vacationEndDate: string;
  vacationCalculationType?: 'completo' | 'proporcional';
  
  // 2. Causa de Finalización
  terminationType: TerminationType;
  informedEmployer: boolean | null; // Preaviso en renuncia
  
  // 3. Aguinaldo
  aguinaldoType: 'auto' | 'completo' | 'proporcional';
  
  // 4. Días de Asueto Laborados
  workedHolidays: boolean;
  selectedHolidays: string[];
  
  // 5. Jornadas Extraordinarias y Descanso Semanal
  noOvertimeApply: boolean;
  hasOvertime?: boolean;
  overtimeEntries: OvertimeEntry[];
  workedWeeklyRestDays: number; // Días de descanso semanal laborados
}

export interface OvertimeEntry {
  id: string;
  date: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  hours: number;
  type: 'diurna' | 'nocturna' | 'mixta';
  dayType?: 'habil' | 'asueto' | 'descanso';
  diurnasHours: number;
  nocturnasHours: number;
  calculatedAmount: number;
  description?: string;
}

export interface HolidayItem {
  id: string;
  name: string;
  dateStr: string;
  description: string;
  isSanMiguel?: boolean;
}

export interface CalculationResult {
  hasCalculated: boolean;
  
  // Antigüedad
  yearsWorked: number;
  monthsWorked: number;
  daysWorked: number;
  totalDaysWorked: number;
  
  // Salarios
  dailySalary: number;
  hourlySalary: number;
  
  // 1. Indemnización
  indemnityBase: number;
  indemnityCappedDaily: number;
  isCapped: boolean;
  indemnityAmount: number;
  indemnityBlocked: boolean;
  indemnityBlockReason?: string;
  
  // 2. Aguinaldo
  aguinaldoDaysEntitled: number;
  aguinaldoSeniorityBracket: string;
  aguinaldoDaysWorkedInPeriod: number;
  aguinaldoIsProportional: boolean;
  aguinaldoAmount: number;
  
  // 3. Vacaciones
  vacationDaysToPay: number;
  vacationBaseAmount: number;
  vacationPremiumAmount: number;
  vacationTotalAmount: number;
  vacationIsProportional: boolean;
  
  // 4. Asuetos
  holidaysWorkedCount: number;
  holidaysWorkedAmount: number;
  holidaysDetails: { name: string; date: string; amount: number }[];
  
  // 5. Horas Extras & Descanso
  overtimeTotalHours: number;
  overtimeDiurnasHours: number;
  overtimeNocturnasHours: number;
  overtimeTotalAmount: number;
  weeklyRestWorkedDays: number;
  weeklyRestWorkedAmount: number;
  
  // Totales
  grossTotal: number; // TOTAL SIN AFP NI SEGURO SOCIAL
  isssDeduction: number; // ISSS 3%
  afpDeduction: number; // AFP 7.25%
  totalDeductions: number;
  netTotal: number; // TOTAL CON LA DEDUCCIÓN DEL ISSS Y AFP
}
