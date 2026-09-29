import { 
  DatosEmpleado, 
  ResultadoLiquidacion, 
  RegistroHoraExtra 
} from '../types';
import { 
  TOPE_MENSUAL_INDEMNIZACION, 
  TOPE_DIARIO_INDEMNIZACION, 
  TASA_ISSS, 
  TOPE_MAXIMO_ISSS, 
  TASA_AFP,
  DIAS_ASUETO_OFICIALES 
} from '../constants/holidays';

/**
 * Calcula la diferencia exacta entre dos fechas en años, meses y días.
 */
export function calcularDiferenciaFechas(fechaInicioTexto: string, fechaFinTexto: string) {
  if (!fechaInicioTexto || !fechaFinTexto) {
    return { anos: 0, meses: 0, dias: 0, totalDias: 0 };
  }

  const inicio = new Date(fechaInicioTexto);
  const fin = new Date(fechaFinTexto);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime()) || fin < inicio) {
    return { anos: 0, meses: 0, dias: 0, totalDias: 0 };
  }

  const diferenciaTiempo = Math.abs(fin.getTime() - inicio.getTime());
  const totalDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1;

  let anos = fin.getFullYear() - inicio.getFullYear();
  let meses = fin.getMonth() - inicio.getMonth();
  let dias = fin.getDate() - inicio.getDate() + 1;

  if (dias < 0) {
    meses -= 1;
    const mesAnterior = new Date(fin.getFullYear(), fin.getMonth(), 0);
    dias += mesAnterior.getDate();
  }

  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  return { anos: Math.max(0, anos), meses: Math.max(0, meses), dias: Math.max(0, dias), totalDias };
}

/**
 * Deduce automáticamente el tipo de hora extra (diurna, nocturna o mixta) según las horas ingresadas.
 */
export function deducirTipoHoraExtra(horaInicioTexto: string, horaFinTexto: string): { 
  horasTotales: number; 
  horasDiurnas: number; 
  horasNocturnas: number; 
  tipo: 'diurna' | 'nocturna' | 'mixta' 
} {
  if (!horaInicioTexto || !horaFinTexto) {
    return { horasTotales: 0, horasDiurnas: 0, horasNocturnas: 0, tipo: 'diurna' };
  }

  const [inicioHora, inicioMinutos] = horaInicioTexto.split(':').map(Number);
  const [finHora, finMinutos] = horaFinTexto.split(':').map(Number);

  let minutosInicio = inicioHora * 60 + inicioMinutos;
  let minutosFin = finHora * 60 + finMinutos;

  if (minutosFin < minutosInicio) {
    minutosFin += 24 * 60; // Cruza medianoche
  }

  const totalMinutos = minutosFin - minutosInicio;
  const horasTotales = Number((totalMinutos / 60).toFixed(2));

  let minutosDiurnos = 0;
  let minutosNocturnos = 0;

  // Horario diurno: 06:00 a 19:00 (minuto 360 al 1140)
  for (let m = minutosInicio; m < minutosFin; m++) {
    const minutoEnElDia = m % (24 * 60);
    if (minutoEnElDia >= 360 && minutoEnElDia < 1140) {
      minutosDiurnos++;
    } else {
      minutosNocturnos++;
    }
  }

  const horasDiurnas = Number((minutosDiurnos / 60).toFixed(2));
  const horasNocturnas = Number((minutosNocturnos / 60).toFixed(2));

  let tipo: 'diurna' | 'nocturna' | 'mixta' = 'diurna';
  if (horasDiurnas > 0 && horasNocturnas > 0) {
    tipo = 'mixta';
  } else if (horasNocturnas > 0) {
    tipo = 'nocturna';
  }

  return { horasTotales, horasDiurnas, horasNocturnas, tipo };
}

/**
 * Función principal que calcula todas las prestaciones laborales de El Salvador.
 */
export function calcularPrestacionesLaborales(datos: DatosEmpleado, haCalculado = true): ResultadoLiquidacion {
  const salarioMensual = Number(datos.salarioMensual) || 0;
  const salarioDiario = salarioMensual > 0 ? salarioMensual / 30 : 0;
  const salarioPorHora = salarioDiario > 0 ? salarioDiario / 8 : 0;

  // 1. Antigüedad
  let anosTrabajados = Number(datos.anosLaboradosInput) || 0;
  let mesesTrabajados = Number(datos.mesesLaboradosInput) || 0;
  let diasTrabajados = 0;
  let totalDiasTrabajados = (anosTrabajados * 365) + (mesesTrabajados * 30);

  if (datos.fechaInicio && datos.fechaFin) {
    const antiguedad = calcularDiferenciaFechas(datos.fechaInicio, datos.fechaFin);
    anosTrabajados = antiguedad.anos;
    mesesTrabajados = antiguedad.meses;
    diasTrabajados = antiguedad.dias;
    totalDiasTrabajados = antiguedad.totalDias;
  }

  // 2. Indemnización por Despido Injustificado / Compensación por Renuncia
  let baseIndemnizacion = salarioMensual;
  let aplicaTopeLegal = false;
  let salarioDiarioTopado = salarioDiario;
  let montoIndemnizacion = 0;
  let indemnizacionBloqueada = false;
  let motivoBloqueoIndemnizacion = '';

  if (datos.tipoTerminacion === 'renuncia_voluntaria') {
    if (datos.informoAlPatrono === false) {
      indemnizacionBloqueada = true;
      motivoBloqueoIndemnizacion = 'Por ley, al NO informar con preaviso al patrono, no aplica compensación económica por renuncia.';
      montoIndemnizacion = 0;
    } else if (datos.informoAlPatrono === true) {
      if (anosTrabajados < 2) {
        indemnizacionBloqueada = true;
        motivoBloqueoIndemnizacion = 'La ley exige al menos 2 años continuos para compensación por renuncia voluntaria.';
        montoIndemnizacion = 0;
      } else {
        const maximoRenunciaMensual = 365.00 * 2;
        const renunciaBaseDiaria = Math.min(salarioDiario, maximoRenunciaMensual / 30);
        const diasFraccion = (mesesTrabajados * 30) + diasTrabajados;
        const totalAnosEquivalentes = anosTrabajados + (diasFraccion / 365);
        montoIndemnizacion = totalAnosEquivalentes * 15 * renunciaBaseDiaria;
      }
    } else {
      indemnizacionBloqueada = true;
      motivoBloqueoIndemnizacion = 'Debe indicar si informó con preaviso al patrono.';
      montoIndemnizacion = 0;
    }
  } else {
    // Despido Injustificado (Art. 58 Código de Trabajo)
    if (salarioDiario > TOPE_DIARIO_INDEMNIZACION) {
      aplicaTopeLegal = true;
      salarioDiarioTopado = TOPE_DIARIO_INDEMNIZACION;
      baseIndemnizacion = TOPE_MENSUAL_INDEMNIZACION;
    } else {
      salarioDiarioTopado = salarioDiario;
      baseIndemnizacion = salarioMensual;
    }

    const diasFraccion = (mesesTrabajados * 30) + diasTrabajados;
    const totalAnosEquivalentes = anosTrabajados + (diasFraccion / 365);
    montoIndemnizacion = totalAnosEquivalentes * 30 * salarioDiarioTopado;
  }

  // 3. Aguinaldo (Art. 196-198 Código de Trabajo)
  let diasAguinaldoDerecho = 15;
  let tramoAntiguedadAguinaldo = 'Menor a 3 años: 15 días';

  if (anosTrabajados >= 5) {
    diasAguinaldoDerecho = 21;
    tramoAntiguedadAguinaldo = 'Mayor o igual a 5 años: 21 días';
  } else if (anosTrabajados >= 3) {
    diasAguinaldoDerecho = 19;
    tramoAntiguedadAguinaldo = 'De 3 a menos de 5 años: 19 días';
  }

  let aguinaldoEsProporcional = false;
  let diasTrabajadosPeriodoAguinaldo = 365;

  if (datos.fechaFin) {
    const fin = new Date(datos.fechaFin);
    const anoFin = fin.getFullYear();
    const inicioPeriodoActual = new Date(anoFin - 1, 11, 12);
    const finPeriodoActual = new Date(anoFin, 11, 11);
    const inicioEfectivo = new Date(datos.fechaInicio || `${anoFin}-01-01`);
    const inicioReal = inicioEfectivo > inicioPeriodoActual ? inicioEfectivo : inicioPeriodoActual;

    if (fin < finPeriodoActual || datos.tipoAguinaldo === 'proporcional') {
      aguinaldoEsProporcional = true;
      const diferenciaTiempo = Math.abs(fin.getTime() - inicioReal.getTime());
      diasTrabajadosPeriodoAguinaldo = Math.min(365, Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)) + 1);
    }
  }

  if (datos.tipoAguinaldo === 'completo') {
    aguinaldoEsProporcional = false;
    diasTrabajadosPeriodoAguinaldo = 365;
  }

  let montoAguinaldo = 0;
  if (aguinaldoEsProporcional) {
    montoAguinaldo = (diasTrabajadosPeriodoAguinaldo / 365) * diasAguinaldoDerecho * salarioDiario;
  } else {
    montoAguinaldo = diasAguinaldoDerecho * salarioDiario;
  }

  // 4. Vacaciones y Prima Vacacional (+30%) (Art. 177 y 182 Código de Trabajo)
  let diasFraccionVacacion = 365;
  let vacacionEsProporcional = true;

  if (datos.fechaFinVacaciones && datos.fechaFin) {
    const finUltimaVacacion = new Date(datos.fechaFinVacaciones);
    const fin = new Date(datos.fechaFin);
    if (!isNaN(finUltimaVacacion.getTime()) && !isNaN(fin.getTime()) && fin >= finUltimaVacacion) {
      const diferenciaTiempo = Math.abs(fin.getTime() - finUltimaVacacion.getTime());
      diasFraccionVacacion = Math.min(365, Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24)));
    }
  } else {
    const diasEnElAno = (mesesTrabajados * 30) + diasTrabajados;
    diasFraccionVacacion = Math.min(365, Math.max(1, diasEnElAno || 365));
  }

  const diasVacacionesPagar = (diasFraccionVacacion / 365) * 15;
  const montoBaseVacacion = diasVacacionesPagar * salarioDiario;
  const montoPrimaVacacional = montoBaseVacacion * 0.30;
  const totalVacaciones = montoBaseVacacion + montoPrimaVacacional;

  // 5. Días de Asueto Laborados (Art. 192 Código de Trabajo - Doble Salario)
  let cantidadAsuetosLaborados = 0;
  let montoAsuetosLaborados = 0;
  const detalleAsuetos: { nombre: string; fecha: string; monto: number }[] = [];

  if (datos.laboroAsuetos && datos.asuetosSeleccionados.length > 0) {
    datos.asuetosSeleccionados.forEach((idAsueto) => {
      const item = DIAS_ASUETO_OFICIALES.find(h => h.id === idAsueto);
      if (item) {
        const pagoDia = salarioDiario * 2;
        cantidadAsuetosLaborados++;
        montoAsuetosLaborados += pagoDia;
        detalleAsuetos.push({ nombre: item.nombre, fecha: item.fechaTexto, monto: pagoDia });
      }
    });
  }

  // 6. Horas Extras y Descanso Semanal (Art. 168-173 Código de Trabajo)
  let totalHorasExtras = 0;
  let horasExtrasDiurnas = 0;
  let horasExtrasNocturnas = 0;
  let montoHorasExtras = 0;

  if (!datos.noAplicaHorasExtras && datos.registrosHorasExtras.length > 0) {
    datos.registrosHorasExtras.forEach(registro => {
      const pagoDiurna = registro.horasDiurnas * (salarioPorHora * 2.00);
      const pagoNocturna = registro.horasNocturnas * (salarioPorHora * 2.50); // Recargo 150% = 2.5x
      const totalRegistro = pagoDiurna + pagoNocturna;

      totalHorasExtras += registro.horasTotales;
      horasExtrasDiurnas += registro.horasDiurnas;
      horasExtrasNocturnas += registro.horasNocturnas;
      montoHorasExtras += totalRegistro;
    });
  }

  const diasDescansoTrabajados = Number(datos.diasDescansoLaborados) || 0;
  const montoDescansoTrabajado = diasDescansoTrabajados * (salarioDiario * 2.00);

  // 7. Totales y Deducciones de Ley
  const totalBruto = (indemnizacionBloqueada ? 0 : montoIndemnizacion) +
                     montoAguinaldo +
                     totalVacaciones +
                     montoAsuetosLaborados +
                     montoHorasExtras +
                     montoDescansoTrabajado;

  const descuentoISSS = Math.min(totalBruto * TASA_ISSS, TOPE_MAXIMO_ISSS);
  const descuentoAFP = totalBruto * TASA_AFP;
  const totalDeducciones = descuentoISSS + descuentoAFP;
  const totalNeto = Math.max(0, totalBruto - totalDeducciones);

  return {
    haCalculado,
    anosTrabajados,
    mesesTrabajados,
    diasTrabajados,
    totalDiasTrabajados,
    salarioDiario,
    salarioPorHora,
    
    baseIndemnizacion,
    salarioDiarioTopado,
    aplicaTopeLegal,
    montoIndemnizacion,
    indemnizacionBloqueada,
    motivoBloqueoIndemnizacion,
    
    diasAguinaldoDerecho,
    tramoAntiguedadAguinaldo,
    diasTrabajadosPeriodoAguinaldo,
    aguinaldoEsProporcional,
    montoAguinaldo,
    
    diasVacacionesPagar,
    montoBaseVacacion,
    montoPrimaVacacional,
    totalVacaciones,
    vacacionEsProporcional,
    
    cantidadAsuetosLaborados,
    montoAsuetosLaborados,
    detalleAsuetos,
    
    totalHorasExtras,
    horasExtrasDiurnas,
    horasExtrasNocturnas,
    montoHorasExtras,
    diasDescansoTrabajados,
    montoDescansoTrabajado,
    
    totalBruto,
    descuentoISSS,
    descuentoAFP,
    totalDeducciones,
    totalNeto
  };
}

/**
 * Formatea un número como moneda en Dólares (USD).
 */
export function formatearMoneda(monto: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(monto || 0);
}
