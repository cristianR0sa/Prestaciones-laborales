import { HolidayItem } from '../types';

export const MINIMUM_WAGE_COMMERCE = 365.00;
export const LEGAL_INDEMNITY_CAP_MULTIPLIER = 4;
export const MAX_MONTHLY_INDEMNITY_BASE = MINIMUM_WAGE_COMMERCE * LEGAL_INDEMNITY_CAP_MULTIPLIER; // $1,460.00
export const MAX_DAILY_INDEMNITY_BASE = MAX_MONTHLY_INDEMNITY_BASE / 30; // $48.6667

export const ISSS_RATE = 0.03; // 3%
export const ISSS_MAX_CAP = 30.00; // Tope máximo ISSS $30.00
export const AFP_RATE = 0.0725; // 7.25%

export const OFFICIAL_HOLIDAYS: HolidayItem[] = [
  { id: 'ano_nuevo', name: 'Año Nuevo', dateStr: '1 de enero', description: 'Celebración de Año Nuevo (Art. 190 CT)' },
  { id: 'jueves_santo', name: 'Jueves Santo', dateStr: 'Semana Santa', description: 'Jueves Santo (Art. 190 CT)' },
  { id: 'viernes_santo', name: 'Viernes Santo', dateStr: 'Semana Santa', description: 'Viernes Santo (Art. 190 CT)' },
  { id: 'sabado_santo', name: 'Sábado Santo', dateStr: 'Semana Santa', description: 'Sábado de Gloria (Art. 190 CT)' },
  { id: 'dia_trabajo', name: 'Día del Trabajo', dateStr: '1 de mayo', description: 'Día Internacional del Trabajo (Art. 190 CT)' },
  { id: 'dia_madres', name: 'Día de las Madres', dateStr: '10 de mayo', description: 'Celebración Día de la Madre (Art. 190 CT)' },
  { id: 'dia_padre', name: 'Día del Padre', dateStr: '17 de junio', description: 'Celebración Día del Padre (Art. 190 CT)' },
  { id: 'divino_salvador', name: 'Día del Divino Salvador del Mundo', dateStr: '6 de agosto', description: 'Fiesta Nacional (Art. 190 CT)' },
  { id: 'fiestas_agostinas_3', name: 'Fiestas Agostinas — 3 de agosto', dateStr: '3 de agosto', description: 'San Salvador (Art. 190 CT)' },
  { id: 'fiestas_agostinas_5', name: 'Fiestas Agostinas — 5 de agosto', dateStr: '5 de agosto', description: 'San Salvador (Art. 190 CT)' },
  { id: 'independencia', name: 'Independencia de El Salvador', dateStr: '15 de septiembre', description: 'Fiesta Cívica Nacional (Art. 190 CT)' },
  { id: 'dia_difuntos', name: 'Día de los Difuntos', dateStr: '2 de noviembre', description: 'Conmemoración Difuntos (Art. 190 CT)' },
  { id: 'san_miguel_21_nov', name: 'Fiestas de San Miguel (Virgen de la Paz)', dateStr: '21 de noviembre', description: 'San Miguel — Fiestas Patronales', isSanMiguel: true },
  { id: 'dia_patronal', name: 'Día patronal del municipio', dateStr: 'Día principal — según municipio', description: 'Fiestas Patronales Municipales (Art. 190 CT)' },
  { id: 'navidad', name: 'Navidad', dateStr: '25 de diciembre', description: 'Celebración de Navidad (Art. 190 CT)' },
];

export const LEGAL_ARTICLES = [
  {
    title: 'Vacaciones',
    articles: ['Art. 177', 'Art. 178', 'Art. 179'],
    text: 'Todo trabajador que cumpla un año de servicio tiene derecho a 15 días de vacaciones con el salario ordinario más un 30% adicional. La vacación proporcional se paga al término de la relación laboral cuando no se ha completado el año.'
  },
  {
    title: 'Aguinaldo',
    articles: ['Art. 196', 'Art. 197', 'Art. 198'],
    text: 'Prima anual: de 1 a menos de 3 años → 15 días; de 3 a menos de 10 años (o 3 < 5) → 19 días; de 10 o más años (o > 5) → 21 días de salario. El período del aguinaldo va del 12 de diciembre al 12 de diciembre. Se paga antes del 20 de diciembre.'
  },
  {
    title: 'Indemnización por despido injustificado',
    articles: ['Art. 58', 'Art. 59'],
    text: '30 días de salario básico por cada año de servicio. El salario diario utilizado no puede exceder 4 veces el salario mínimo del sector comercio ($365.00/mes). Fracciones de año son proporcionales.'
  },
  {
    title: 'Horas extraordinarias',
    articles: ['Art. 168', 'Art. 169', 'Art. 170'],
    text: 'Diurnas (06:00-19:00): recargo del 100% (pago doble). Nocturnas (19:00-06:00): recargo del 150% (o 2.5x el salario/hora) o 125%. Jornada ordinaria máxima: 8 horas diurnas o 7 nocturnas.'
  },
  {
    title: 'Días de asueto',
    articles: ['Art. 190', 'Art. 191', 'Art. 192'],
    text: 'Los días de asueto son remunerados. Si el trabajador labora en día de asueto, recibe el salario del día más un recargo del 100% (doble salario).'
  },
  {
    title: 'Descanso semanal',
    articles: ['Art. 171', 'Art. 172', 'Art. 173'],
    text: 'Un día de descanso remunerado por semana. Si trabaja en día de descanso, recibe el salario del día más un recargo del 100% (doble salario).'
  }
];
