import { 
  EmployeeData, 
  CalculationResult, 
  OvertimeEntry 
} from '../types';
import { 
  MAX_MONTHLY_INDEMNITY_BASE, 
  MAX_DAILY_INDEMNITY_BASE, 
  ISSS_RATE, 
  ISSS_MAX_CAP, 
  AFP_RATE,
  OFFICIAL_HOLIDAYS 
} from '../constants/holidays';

export function calculateDateDifference(startDateStr: string, endDateStr: string) {
  if (!startDateStr || !endDateStr) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
    return { years: 0, months: 0, days: 0, totalDays: 0 };
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate() + 1;

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days), totalDays };
}

export function calculateOvertimeType(startTime: string, endTime: string): { 
  totalHours: number; 
  diurnasHours: number; 
  nocturnasHours: number; 
  type: 'diurna' | 'nocturna' | 'mixta' 
} {
  if (!startTime || !endTime) {
    return { totalHours: 0, diurnasHours: 0, nocturnasHours: 0, type: 'diurna' };
  }

  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let startMinutes = startH * 60 + startM;
  let endMinutes = endH * 60 + endM;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const totalMinutes = endMinutes - startMinutes;
  const totalHours = Number((totalMinutes / 60).toFixed(2));

  let diurnasMinutes = 0;
  let nocturnasMinutes = 0;

  for (let m = startMinutes; m < endMinutes; m++) {
    const currentMinInDay = m % (24 * 60);
    if (currentMinInDay >= 360 && currentMinInDay < 1140) { // 06:00 a 19:00
      diurnasMinutes++;
    } else {
      nocturnasMinutes++;
    }
  }

  const diurnasHours = Number((diurnasMinutes / 60).toFixed(2));
  const nocturnasHours = Number((nocturnasMinutes / 60).toFixed(2));

  let type: 'diurna' | 'nocturna' | 'mixta' = 'diurna';
  if (diurnasHours > 0 && nocturnasHours > 0) {
    type = 'mixta';
  } else if (nocturnasHours > 0) {
    type = 'nocturna';
  }

  return { totalHours, diurnasHours, nocturnasHours, type };
}

export function calculateLaborBenefits(data: EmployeeData, hasCalculated = true): CalculationResult {
  const salary = Number(data.salary) || 0;
  const dailySalary = salary > 0 ? salary / 30 : 0;
  const hourlySalary = dailySalary > 0 ? dailySalary / 8 : 0;

  // Antigüedad (prioriza cálculo por fechas si existen o inputs de años/meses)
  let yearsWorked = Number(data.yearsWorkedInput) || 0;
  let monthsWorked = Number(data.monthsWorkedInput) || 0;
  let daysWorked = 0;
  let totalDaysWorked = (yearsWorked * 365) + (monthsWorked * 30);

  if (data.startDate && data.endDate) {
    const diff = calculateDateDifference(data.startDate, data.endDate);
    yearsWorked = diff.years;
    monthsWorked = diff.months;
    daysWorked = diff.days;
    totalDaysWorked = diff.totalDays;
  }

  // 1. Indemnización
  let indemnityBase = salary;
  let isCapped = false;
  let indemnityCappedDaily = dailySalary;
  let indemnityAmount = 0;
  let indemnityBlocked = false;
  let indemnityBlockReason = '';

  if (data.terminationType === 'renuncia_voluntaria') {
    if (data.informedEmployer === false) {
      indemnityBlocked = true;
      indemnityBlockReason = 'Por ley, al NO informar con preaviso al patrono, no aplica compensación económica por renuncia.';
      indemnityAmount = 0;
    } else if (data.informedEmployer === true) {
      if (yearsWorked < 2) {
        indemnityBlocked = true;
        indemnityBlockReason = 'La ley exige al menos 2 años continuos para compensación por renuncia voluntaria.';
        indemnityAmount = 0;
      } else {
        const maxRenunciaMensual = 365.00 * 2;
        const renunciaBaseDiaria = Math.min(dailySalary, maxRenunciaMensual / 30);
        const fractionDays = (monthsWorked * 30) + daysWorked;
        const totalEquivYears = yearsWorked + (fractionDays / 365);
        indemnityAmount = totalEquivYears * 15 * renunciaBaseDiaria;
      }
    } else {
      indemnityBlocked = true;
      indemnityBlockReason = 'Debe indicar si informó con preaviso al patrono.';
      indemnityAmount = 0;
    }
  } else {
    // Despido Injustificado
    if (dailySalary > MAX_DAILY_INDEMNITY_BASE) {
      isCapped = true;
      indemnityCappedDaily = MAX_DAILY_INDEMNITY_BASE;
      indemnityBase = MAX_MONTHLY_INDEMNITY_BASE;
    } else {
      indemnityCappedDaily = dailySalary;
      indemnityBase = salary;
    }

    const fractionDays = (monthsWorked * 30) + daysWorked;
    const totalEquivalentYears = yearsWorked + (fractionDays / 365);
    indemnityAmount = totalEquivalentYears * 30 * indemnityCappedDaily;
  }

  // 2. Aguinaldo
  let aguinaldoDaysEntitled = 15;
  let aguinaldoSeniorityBracket = 'Menor a 3 años: 15 días';

  if (yearsWorked >= 5) {
    aguinaldoDaysEntitled = 21;
    aguinaldoSeniorityBracket = 'Mayor o igual a 5 años: 21 días';
  } else if (yearsWorked >= 3) {
    aguinaldoDaysEntitled = 19;
    aguinaldoSeniorityBracket = 'De 3 a menos de 5 años: 19 días';
  }

  let aguinaldoIsProportional = false;
  let aguinaldoDaysWorkedInPeriod = 365;

  if (data.endDate) {
    const end = new Date(data.endDate);
    const endYear = end.getFullYear();
    const currentPeriodStart = new Date(endYear - 1, 11, 12);
    const currentPeriodEnd = new Date(endYear, 11, 11);
    const actualStart = new Date(data.startDate || `${endYear}-01-01`);
    const effectiveStart = actualStart > currentPeriodStart ? actualStart : currentPeriodStart;

    if (end < currentPeriodEnd || data.aguinaldoType === 'proporcional') {
      aguinaldoIsProportional = true;
      const diffTime = Math.abs(end.getTime() - effectiveStart.getTime());
      aguinaldoDaysWorkedInPeriod = Math.min(365, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  if (data.aguinaldoType === 'completo') {
    aguinaldoIsProportional = false;
    aguinaldoDaysWorkedInPeriod = 365;
  }

  let aguinaldoAmount = 0;
  if (aguinaldoIsProportional) {
    aguinaldoAmount = (aguinaldoDaysWorkedInPeriod / 365) * aguinaldoDaysEntitled * dailySalary;
  } else {
    aguinaldoAmount = aguinaldoDaysEntitled * dailySalary;
  }

  // 3. Vacaciones
  let vacationFractionDays = 365;
  let vacationIsProportional = true;

  if (data.vacationEndDate && data.endDate) {
    const vacLastEnd = new Date(data.vacationEndDate);
    const end = new Date(data.endDate);
    if (!isNaN(vacLastEnd.getTime()) && !isNaN(end.getTime()) && end >= vacLastEnd) {
      const diffTime = Math.abs(end.getTime() - vacLastEnd.getTime());
      vacationFractionDays = Math.min(365, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    }
  } else {
    const daysInYear = (monthsWorked * 30) + daysWorked;
    vacationFractionDays = Math.min(365, Math.max(1, daysInYear || 365));
  }

  const vacationDaysToPay = (vacationFractionDays / 365) * 15;
  const vacationBaseAmount = vacationDaysToPay * dailySalary;
  const vacationPremiumAmount = vacationBaseAmount * 0.30;
  const vacationTotalAmount = vacationBaseAmount + vacationPremiumAmount;

  // 4. Asuetos
  let holidaysWorkedCount = 0;
  let holidaysWorkedAmount = 0;
  const holidaysDetails: { name: string; date: string; amount: number }[] = [];

  if (data.workedHolidays && data.selectedHolidays.length > 0) {
    data.selectedHolidays.forEach((holidayId) => {
      const item = OFFICIAL_HOLIDAYS.find(h => h.id === holidayId);
      if (item) {
        const dayPay = dailySalary * 2;
        holidaysWorkedCount++;
        holidaysWorkedAmount += dayPay;
        holidaysDetails.push({ name: item.name, date: item.dateStr, amount: dayPay });
      }
    });
  }

  // 5. Horas Extras & Descanso Semanal
  let overtimeTotalHours = 0;
  let overtimeDiurnasHours = 0;
  let overtimeNocturnasHours = 0;
  let overtimeTotalAmount = 0;

  if (!data.noOvertimeApply && data.overtimeEntries.length > 0) {
    data.overtimeEntries.forEach(entry => {
      const diurnaPay = entry.diurnasHours * (hourlySalary * 2.00);
      const nocturnaPay = entry.nocturnasHours * (hourlySalary * 2.50); // Recargo 150% = 2.5x según Figma
      const entryTotal = diurnaPay + nocturnaPay;

      overtimeTotalHours += entry.hours;
      overtimeDiurnasHours += entry.diurnasHours;
      overtimeNocturnasHours += entry.nocturnasHours;
      overtimeTotalAmount += entryTotal;
    });
  }

  const weeklyRestWorkedDays = Number(data.workedWeeklyRestDays) || 0;
  const weeklyRestWorkedAmount = weeklyRestWorkedDays * (dailySalary * 2.00);

  // Totales
  const grossTotal = (indemnityBlocked ? 0 : indemnityAmount) +
                     aguinaldoAmount +
                     vacationTotalAmount +
                     holidaysWorkedAmount +
                     overtimeTotalAmount +
                     weeklyRestWorkedAmount;

  const isssDeduction = Math.min(grossTotal * ISSS_RATE, ISSS_MAX_CAP);
  const afpDeduction = grossTotal * AFP_RATE;
  const totalDeductions = isssDeduction + afpDeduction;
  const netTotal = Math.max(0, grossTotal - totalDeductions);

  return {
    hasCalculated,
    yearsWorked,
    monthsWorked,
    daysWorked,
    totalDaysWorked,
    dailySalary,
    hourlySalary,
    
    indemnityBase,
    indemnityCappedDaily,
    isCapped,
    indemnityAmount,
    indemnityBlocked,
    indemnityBlockReason,
    
    aguinaldoDaysEntitled,
    aguinaldoSeniorityBracket,
    aguinaldoDaysWorkedInPeriod,
    aguinaldoIsProportional,
    aguinaldoAmount,
    
    vacationDaysToPay,
    vacationBaseAmount,
    vacationPremiumAmount,
    vacationTotalAmount,
    vacationIsProportional,
    
    holidaysWorkedCount,
    holidaysWorkedAmount,
    holidaysDetails,
    
    overtimeTotalHours,
    overtimeDiurnasHours,
    overtimeNocturnasHours,
    overtimeTotalAmount,
    weeklyRestWorkedDays,
    weeklyRestWorkedAmount,
    
    grossTotal,
    isssDeduction,
    afpDeduction,
    totalDeductions,
    netTotal
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0);
}
