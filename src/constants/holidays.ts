import { DiaAsueto, SectorEconomico } from '../types';

export const SALARIOS_MINIMOS_SECTOR = {
  comercio: 408.80,      // Comercio y Servicios ($408.80)
  industria: 408.80,     // Industria ($408.80)
  maquila: 402.32,       // Maquila textil y confección ($402.32)
  agricultura: 305.23,   // Agricultura (recolección de cosecha) ($305.23)
  agropecuario: 272.53   // Agropecuario, pesca, otras actividades y café ($272.53)
};

export function obtenerSalarioMinimoSector(sector: SectorEconomico = 'comercio'): number {
  return SALARIOS_MINIMOS_SECTOR[sector] || 408.80;
}

export const MULTIPLICADOR_TOPE_LEGAL = 4; // 4 salarios mínimos
export const TASA_ISSS = 0.03; // 3%
export const TOPE_MAXIMO_ISSS = 30.00; // Tope máximo ISSS $30.00 (salario $1,000+)
export const TASA_AFP = 0.0725; // 7.25%

export const DIAS_ASUETO_OFICIALES: DiaAsueto[] = [
  { id: 'ano_nuevo', nombre: 'Año Nuevo', fechaTexto: '1 de enero', descripcion: 'Celebración de Año Nuevo (Art. 190 CT)' },
  { id: 'jueves_santo', nombre: 'Jueves Santo', fechaTexto: 'Semana Santa', descripcion: 'Jueves Santo (Art. 190 CT)' },
  { id: 'viernes_santo', nombre: 'Viernes Santo', fechaTexto: 'Semana Santa', descripcion: 'Viernes Santo (Art. 190 CT)' },
  { id: 'sabado_santo', nombre: 'Sábado Santo', fechaTexto: 'Semana Santa', descripcion: 'Sábado de Gloria (Art. 190 CT)' },
  { id: 'dia_trabajo', nombre: 'Día del Trabajo', fechaTexto: '1 de mayo', descripcion: 'Día Internacional del Trabajo (Art. 190 CT)' },
  { id: 'dia_madres', nombre: 'Día de las Madres', fechaTexto: '10 de mayo', descripcion: 'Celebración Día de la Madre (Art. 190 CT)' },
  { id: 'dia_padre', nombre: 'Día del Padre', fechaTexto: '17 de junio', descripcion: 'Celebración Día del Padre (Art. 190 CT)' },
  { id: 'divino_salvador', nombre: 'Día del Divino Salvador del Mundo', fechaTexto: '6 de agosto', descripcion: 'Fiesta Nacional (Art. 190 CT)' },
  { id: 'fiestas_agostinas_3', nombre: 'Fiestas Agostinas — 3 de agosto', fechaTexto: '3 de agosto', descripcion: 'San Salvador (Art. 190 CT)' },
  { id: 'fiestas_agostinas_5', nombre: 'Fiestas Agostinas — 5 de agosto', fechaTexto: '5 de agosto', descripcion: 'San Salvador (Art. 190 CT)' },
  { id: 'independencia', nombre: 'Independencia de El Salvador', fechaTexto: '15 de septiembre', descripcion: 'Fiesta Cívica Nacional (Art. 190 CT)' },
  { id: 'dia_difuntos', nombre: 'Día de los Difuntos', fechaTexto: '2 de noviembre', descripcion: 'Conmemoración Difuntos (Art. 190 CT)' },
  { id: 'san_miguel_21_nov', nombre: 'Fiestas de San Miguel (Virgen de la Paz)', fechaTexto: '21 de noviembre', descripcion: 'San Miguel — Fiestas Patronales', esSanMiguel: true },
  { id: 'navidad', nombre: 'Navidad', fechaTexto: '25 de diciembre', descripcion: 'Celebración de Navidad (Art. 190 CT)' },
];

export const ARTICULOS_LEGALES = [
  {
    titulo: 'Vacaciones',
    articulos: ['Art. 177', 'Art. 178', 'Art. 179'],
    texto: 'Todo trabajador que cumpla un año de servicio tiene derecho a 15 días de vacaciones con el salario ordinario más un 30% adicional. La vacación proporcional se paga al término de la relación laboral cuando no se ha completado el año.'
  },
  {
    titulo: 'Aguinaldo',
    articulos: ['Art. 196', 'Art. 197', 'Art. 198'],
    texto: 'Prima anual: de 1 a menos de 3 años → 15 días; de 3 a menos de 10 años (o 3 < 5) → 19 días; de 10 o más años (o > 5) → 21 días de salario. El período del aguinaldo va del 12 de diciembre al 12 de diciembre. Se paga antes del 20 de diciembre.'
  },
  {
    titulo: 'Indemnización por despido injustificado',
    articulos: ['Art. 58', 'Art. 59'],
    texto: '30 días de salario básico por cada año de servicio. El salario diario utilizado no puede exceder 4 veces el salario mínimo del sector. En ningún caso la indemnización será menor del equivalente al salario de 15 días. Fracciones de año son proporcionales.'
  },
  {
    titulo: 'Horas extraordinarias',
    articulos: ['Art. 168', 'Art. 169', 'Art. 170'],
    texto: 'Diurnas (06:00-19:00): recargo del 100% (pago doble). Nocturnas (19:00-06:00): recargo del 150% (o 2.5x el salario/hora) o 125%. Jornada ordinaria máxima: 8 horas diurnas o 7 nocturnas.'
  },
  {
    titulo: 'Días de asueto',
    articulos: ['Art. 190', 'Art. 191', 'Art. 192'],
    texto: 'Los días de asueto son remunerados. Si el trabajador labora en día de asueto, recibe el salario del día más un recargo del 100% (doble salario).'
  },
  {
    titulo: 'Descanso semanal',
    articulos: ['Art. 171', 'Art. 172', 'Art. 173'],
    texto: 'Un día de descanso remunerado por semana. Si trabaja en día de descanso, recibe el salario del día más un recargo del 100% (doble salario).'
  }
];
