import { jsPDF } from 'jspdf';
import { DatosEmpleado, ResultadoLiquidacion } from '../types';
import { formatearMoneda } from './calculator';

/**
 * Convierte un número a letras en español para moneda (Dólares).
 * Ejemplo: 36980.84 -> "TREINTA Y SEIS MIL NOVECIENTOS OCHENTA 84/100 DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA"
 */
function numeroALetras(monto: number): string {
  if (isNaN(monto) || monto < 0) return 'CERO 00/100 DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA';

  const parteEntera = Math.floor(monto);
  const centavos = Math.round((monto - parteEntera) * 100);
  const centavosTexto = centavos.toString().padStart(2, '0') + '/100 DÓLARES DE LOS ESTADOS UNIDOS DE AMÉRICA';

  if (parteEntera === 0) {
    return `CERO ${centavosTexto}`;
  }

  function convertirGrupo(n: number): string {
    const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = [
      '', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
    ];
    const especiales10 = [
      'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
    ];
    const especiales20 = [
      'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS', 'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'
    ];
    const centenas = [
      '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
    ];

    let c = Math.floor(n / 100);
    let d = Math.floor((n % 100) / 10);
    let u = n % 10;
    let resultado = '';

    if (n === 100) return 'CIEN';

    if (c > 0) {
      resultado += centenas[c] + ' ';
    }

    let du = n % 100;
    if (du >= 10 && du <= 19) {
      resultado += especiales10[du - 10] + ' ';
    } else if (du >= 20 && du <= 29) {
      resultado += especiales20[du - 20] + ' ';
    } else {
      if (d > 0) {
        resultado += decenas[d];
        if (u > 0) {
          resultado += ' Y ' + unidades[u] + ' ';
        } else {
          resultado += ' ';
        }
      } else if (u > 0) {
        resultado += unidades[u] + ' ';
      }
    }

    return resultado.trim();
  }

  let millones = Math.floor(parteEntera / 1000000);
  let miles = Math.floor((parteEntera % 1000000) / 1000);
  let unidades = parteEntera % 1000;

  let texto = '';

  if (millones > 0) {
    if (millones === 1) {
      texto += 'UN MILLÓN ';
    } else {
      texto += convertirGrupo(millones) + ' MILLONES ';
    }
  }

  if (miles > 0) {
    if (miles === 1) {
      texto += 'MIL ';
    } else {
      texto += convertirGrupo(miles) + ' MIL ';
    }
  }

  if (unidades > 0) {
    texto += convertirGrupo(unidades) + ' ';
  }

  return `${texto.trim()} ${centavosTexto}`.replace(/\s+/g, ' ').toUpperCase();
}

/**
 * Formatea una fecha YYYY-MM-DD a formato extendido: "01 de enero de 2006"
 */
function formatearFechaTexto(fechaStr?: string): string {
  if (!fechaStr) return 'No especificada';
  const partes = fechaStr.split('-');
  if (partes.length !== 3) return fechaStr;

  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  const dia = partes[2].padStart(2, '0');
  const mesIndex = parseInt(partes[1], 10) - 1;
  const anio = partes[0];

  if (mesIndex >= 0 && mesIndex < 12) {
    return `${dia} de ${meses[mesIndex]} de ${anio}`;
  }
  return fechaStr;
}

/**
 * Calcula la retención mensual aproximada de ISR según la tabla oficial de El Salvador
 */
function calcularISR(remuneracionGravada: number, descuentoISSS: number, descuentoAFP: number): number {
  const baseImponible = remuneracionGravada - descuentoISSS - descuentoAFP;
  if (baseImponible <= 472.00) return 0.00;
  if (baseImponible <= 895.24) {
    return (baseImponible - 472.00) * 0.10 + 17.67;
  }
  if (baseImponible <= 2038.10) {
    return (baseImponible - 895.24) * 0.20 + 60.00;
  }
  return (baseImponible - 2038.10) * 0.30 + 288.57;
}

/**
 * Genera el documento PDF formal de Liquidación Laboral en 2 páginas exactas según el modelo solicitado.
 */
export function generarLiquidacionPDF(datos: DatosEmpleado, resultados: ResultadoLiquidacion) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 18;
  const anchoContenido = anchoPagina - (margen * 2);

  const ahora = new Date();
  const fechaGeneracionTexto = `Generado el ${ahora.toLocaleDateString('es-SV')} ${ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}`;

  // Cálculos de remuneración gravada y exenta
  const remuneracionGravada = resultados.baseCotizableISSS_AFP;
  const montoExento = (resultados.indemnizacionBloqueada ? 0 : resultados.montoIndemnizacion) + resultados.montoAguinaldo;
  
  // Retención de ISR calculada
  const retencionISR = Number(calcularISR(remuneracionGravada, resultados.descuentoISSS, resultados.descuentoAFP).toFixed(2));
  const totalDeduccionesCalculado = resultados.descuentoISSS + resultados.descuentoAFP + retencionISR;
  const montoNetoFinal = Math.max(0, resultados.totalBruto - totalDeduccionesCalculado);

  const textoCausa = datos.tipoTerminacion === 'despido_injustificado' 
    ? 'Despido sin causa justificada' 
    : `Renuncia voluntaria (${datos.informoAlPatrono ? 'Con preaviso legal' : 'Sin preaviso'})`;

  // ==========================================
  // PÁGINA 1
  // ==========================================
  let y = 20;

  // Encabezado Principal
  doc.setTextColor(10, 46, 92); // Azul Marino #0a2e5c
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('COMPROBANTE DE LIQUIDACIÓN DE PRESTACIONES LABORALES', anchoPagina / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199); // Celeste #0284c7
  doc.text('República de El Salvador', anchoPagina / 2, y, { align: 'center' });

  y += 5;
  // Línea divisoria superior en azul marino / celeste
  doc.setDrawColor(2, 132, 199); // Celeste #0284c7
  doc.setLineWidth(0.6);
  doc.line(margen, y, margen + anchoContenido, y);

  y += 8;

  // I. Datos de las partes
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('I. Datos de las partes', margen, y);

  y += 6;
  const colIzqLabel = margen;
  const colIzqVal = margen + 32;
  const colDerLabel = margen + 92;
  const colDerVal = margen + 124;
  const interlineadoDatos = 6;

  doc.setFontSize(8);

  // Fila 1: Trabajador & Patrono
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Persona trabajadora', colIzqLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 46, 92);
  const nombreTrabajador = (datos.nombreCompleto || 'NO ESPECIFICADO').toUpperCase();
  doc.text(nombreTrabajador, colIzqVal, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Patrono', colDerLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(datos.empresa || 'Empresa Empleadora', colDerVal, y);

  y += interlineadoDatos;

  // Fila 2: Cargo & Salario
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Cargo desempeñado', colIzqLabel, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  doc.text(datos.cargo || 'Personal de Operaciones', colIzqVal, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Salario mensual', colDerLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 46, 92);
  doc.text(formatearMoneda(datos.salarioMensual), colDerVal, y);

  y += interlineadoDatos;

  // Fila 3: Fecha Ingreso & Fecha Terminación
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Fecha de ingreso', colIzqLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatearFechaTexto(datos.fechaInicio), colIzqVal, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Fecha de terminación', colDerLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(formatearFechaTexto(datos.fechaFin), colDerVal, y);

  y += interlineadoDatos;

  // Fila 4: Antigüedad & Causa
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Antigüedad reconocida', colIzqLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 46, 92);
  const textoAnos = resultados.anosTrabajados === 1 ? '1 año' : `${resultados.anosTrabajados} años`;
  const textoMeses = resultados.mesesTrabajados === 1 ? '1 mes' : `${resultados.mesesTrabajados} meses`;
  doc.text(`${textoAnos}, ${textoMeses}`, colIzqVal, y);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Causa de terminación', colDerLabel, y);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(textoCausa, colDerVal, y);

  y += interlineadoDatos;

  // Fila 5: Sector Económico & DUI
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Sector económico', colIzqLabel, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(15, 23, 42);
  const nombresSector: Record<string, string> = {
    comercio: 'Comercio y Servicios ($408.80)',
    industria: 'Industria ($408.80)',
    maquila: 'Maquila Textil ($402.32)',
    agricultura: 'Agricultura Cosecha ($305.23)',
    agropecuario: 'Agropecuario y Café ($272.53)'
  };
  doc.text(nombresSector[datos.sectorEconomico || 'comercio'] || 'Comercio ($408.80)', colIzqVal, y);

  if (datos.dui) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('DUI trabajador', colDerLabel, y);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(datos.dui, colDerVal, y);
  }

  y += 9;

  // II. Desglose de prestaciones liquidadas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('II. Desglose de prestaciones liquidadas', margen, y);

  y += 5;

  // Encabezado Tabla Prestaciones con fondo celeste suave
  doc.setFillColor(240, 249, 255); // #f0f9ff (Celeste suave)
  doc.rect(margen, y, anchoContenido, 6.5, 'F');
  doc.setDrawColor(2, 132, 199); // #0284c7 (Borde celeste)
  doc.setLineWidth(0.4);
  doc.line(margen, y, margen + anchoContenido, y);
  doc.line(margen, y + 6.5, margen + anchoContenido, y + 6.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('Concepto', margen + 2, y + 4.5);
  doc.text('Base legal', margen + 78, y + 4.5);
  doc.text('Monto', margen + anchoContenido - 2, y + 4.5, { align: 'right' });

  y += 6.5;

  // Función para imprimir filas de tabla
  const imprimirFilaPrestacion = (concepto: string, baseLegal: string, monto: number, bloqueado = false) => {
    const altoFila = 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(concepto, margen + 2, y + 4.2);

    doc.setTextColor(100, 116, 139);
    doc.text(baseLegal, margen + 78, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    if (bloqueado) {
      doc.setTextColor(220, 38, 38);
      doc.text('$0.00', margen + anchoContenido - 2, y + 4.2, { align: 'right' });
    } else {
      doc.text(formatearMoneda(monto), margen + anchoContenido - 2, y + 4.2, { align: 'right' });
    }

    doc.setDrawColor(224, 242, 254); // Celeste muy suave para líneas divisoras
    doc.setLineWidth(0.3);
    doc.line(margen, y + altoFila, margen + anchoContenido, y + altoFila);
    y += altoFila;
  };

  // Filas de conceptos
  imprimirFilaPrestacion('Vacación proporcional', 'Arts. 177 y 187 CT', resultados.totalVacaciones);
  imprimirFilaPrestacion('Aguinaldo proporcional', 'Arts. 196-198 CT', resultados.montoAguinaldo);
  
  const etiquetaIndemnizacion = datos.tipoTerminacion === 'despido_injustificado'
    ? 'Indemnización por despido injustificado'
    : 'Compensación por renuncia voluntaria';
  imprimirFilaPrestacion(
    etiquetaIndemnizacion, 
    datos.tipoTerminacion === 'despido_injustificado' ? 'Art. 58 CT' : 'Ley de Renuncia Voluntaria', 
    resultados.montoIndemnizacion,
    resultados.indemnizacionBloqueada
  );

  imprimirFilaPrestacion('Horas extras diurnas', 'Art. 169 CT', resultados.horasExtrasDiurnas * ((datos.salarioMensual / 30 / 8) * 2));
  imprimirFilaPrestacion('Horas extras nocturnas', 'Arts. 168 y 169 CT', resultados.horasExtrasNocturnas * ((datos.salarioMensual / 30 / 8) * 2.5));
  imprimirFilaPrestacion('Días de asueto laborados', 'Art. 192 CT', resultados.montoAsuetosLaborados);
  imprimirFilaPrestacion('Días de descanso semanal laborados', 'Arts. 175 y 176 CT', resultados.montoDescansoTrabajado);

  // Total Devengado Bruto con líneas azul marino
  y += 1;
  doc.setDrawColor(10, 46, 92); // Azul marino
  doc.setLineWidth(0.6);
  doc.line(margen, y, margen + anchoContenido, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('TOTAL DEVENGADO (BRUTO)', margen + 2, y);
  doc.text(formatearMoneda(resultados.totalBruto), margen + anchoContenido - 2, y, { align: 'right' });

  y += 2;
  doc.setDrawColor(2, 132, 199); // Celeste
  doc.setLineWidth(0.4);
  doc.line(margen, y, margen + anchoContenido, y);

  y += 8;

  // III. Deducciones de ley y neto a pagar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('III. Deducciones de ley y neto a pagar', margen, y);

  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Remuneración gravada: ${formatearMoneda(remuneracionGravada)}. Monto exento de ISR y de cotizaciones: ${formatearMoneda(montoExento)} (indemnización y aguinaldo).`, margen, y);

  y += 4;

  // Filas de deducciones con líneas celestes
  const imprimirFilaDeduccion = (concepto: string, baseLegal: string, monto: number) => {
    const altoFila = 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(concepto, margen + 2, y + 4.2);

    doc.setTextColor(100, 116, 139);
    doc.text(baseLegal, margen + 78, y + 4.2);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    const textoMonto = monto > 0 ? `-${formatearMoneda(monto)}` : '$0.00';
    doc.text(textoMonto, margen + anchoContenido - 2, y + 4.2, { align: 'right' });

    doc.setDrawColor(224, 242, 254); // Celeste suave
    doc.setLineWidth(0.3);
    doc.line(margen, y + altoFila, margen + anchoContenido, y + altoFila);
    y += altoFila;
  };

  imprimirFilaDeduccion('Cotización ISSS (trabajador)', 'Reglamento del ISSS, Art. 29', resultados.descuentoISSS);
  imprimirFilaDeduccion('Cotización AFP (trabajador)', 'Ley del Sistema de Ahorro para Pensiones', resultados.descuentoAFP);
  imprimirFilaDeduccion('Retención de ISR', 'Art. 37 Ley de ISR', retencionISR);

  // Total deducciones
  y += 1;
  doc.setDrawColor(186, 230, 253); // Celeste #bae6fd
  doc.setLineWidth(0.4);
  doc.line(margen, y, margen + anchoContenido, y);
  y += 4.5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('Total de deducciones', margen + 2, y);
  doc.text(`-${formatearMoneda(totalDeduccionesCalculado)}`, margen + anchoContenido - 2, y, { align: 'right' });

  y += 2;
  doc.setDrawColor(2, 132, 199); // Celeste
  doc.setLineWidth(0.5);
  doc.line(margen, y, margen + anchoContenido, y);

  y += 4;

  // Monto Neto a Pagar (Barra Celeste / Azul)
  doc.setFillColor(240, 249, 255); // Fondo celeste suave #f0f9ff
  doc.rect(margen, y, anchoContenido, 8, 'F');
  doc.setDrawColor(2, 132, 199); // Borde celeste #0284c7
  doc.setLineWidth(0.6);
  doc.rect(margen, y, anchoContenido, 8, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('MONTO NETO A PAGAR', margen + 3, y + 5.3);
  doc.setFontSize(10.5);
  doc.setTextColor(2, 132, 199); // Celeste destacado
  doc.text(formatearMoneda(montoNetoFinal), margen + anchoContenido - 3, y + 5.5, { align: 'right' });

  y += 12;

  // Monto neto en letras (Caja con borde celeste suave)
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margen, y, anchoContenido, 13, 1, 1, 'F');
  doc.setDrawColor(186, 230, 253); // Celeste #bae6fd
  doc.setLineWidth(0.4);
  doc.roundedRect(margen, y, anchoContenido, 13, 1, 1, 'D');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(2, 132, 199); // Celeste
  doc.text('Monto neto en letras', margen + 3, y + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  const textoLetras = numeroALetras(montoNetoFinal);
  doc.text(textoLetras, margen + 3, y + 9.5);

  // Pie de Página - Página 1
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(fechaGeneracionTexto, margen, altoPagina - 12);
  doc.text('1 / 2', anchoPagina - margen, altoPagina - 12, { align: 'right' });

  // ==========================================
  // PÁGINA 2
  // ==========================================
  doc.addPage();
  y = 20;

  // Encabezado Principal Página 2
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11.5);
  doc.text('COMPROBANTE DE LIQUIDACIÓN DE PRESTACIONES LABORALES', anchoPagina / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(2, 132, 199); // Celeste
  doc.text('República de El Salvador', anchoPagina / 2, y, { align: 'center' });

  y += 5;
  doc.setDrawColor(2, 132, 199); // Celeste
  doc.setLineWidth(0.6);
  doc.line(margen, y, margen + anchoContenido, y);

  y += 10;

  // IV. Declaración
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(10, 46, 92); // Azul marino
  doc.text('IV. Declaración', margen, y);

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  
  const textoDeclaracion = 
    `La persona trabajadora ${nombreTrabajador} declara haber recibido el detalle de las prestaciones económicas ` +
    `que anteceden, calculadas conforme al Código de Trabajo de El Salvador, así como el desglose de las retenciones de ley aplicadas ` +
    `y el monto neto resultante. Este comprobante se suscribe en la fecha que se indica al pie de las firmas.`;
  
  const lineasDeclaracion = doc.splitTextToSize(textoDeclaracion, anchoContenido);
  doc.text(lineasDeclaracion, margen, y);

  y += (lineasDeclaracion.length * 4.5) + 20;

  // Firmas en dos columnas con líneas azul marino
  const anchoBloqueFirma = (anchoContenido - 15) / 2;
  const colFirma1 = margen;
  const colFirma2 = margen + anchoBloqueFirma + 15;

  // Líneas de firma en azul marino
  doc.setDrawColor(10, 46, 92);
  doc.setLineWidth(0.6);
  doc.line(colFirma1, y, colFirma1 + anchoBloqueFirma, y);
  doc.line(colFirma2, y, colFirma2 + anchoBloqueFirma, y);

  y += 5;

  // Títulos de Firmas
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(10, 46, 92);
  doc.text('Persona trabajadora', colFirma1 + (anchoBloqueFirma / 2), y, { align: 'center' });
  doc.text('Patrono o representante legal', colFirma2 + (anchoBloqueFirma / 2), y, { align: 'center' });

  y += 8;

  // Campos de texto de firma
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  doc.text('Nombre: _________________________________', colFirma1, y);
  doc.text('Nombre: _________________________________', colFirma2, y);

  y += 6;
  doc.text('DUI: ____________________________________', colFirma1, y);
  doc.text('DUI: ____________________________________', colFirma2, y);

  y += 6;
  doc.text('Fecha: __________________________________', colFirma1, y);
  doc.text('Fecha: __________________________________', colFirma2, y);

  y += 18;

  // Cuadro: Advertencia Legal
  doc.setFillColor(254, 252, 232); // #fefce8 (Amarillo suave)
  doc.setDrawColor(245, 158, 11); // #f59e0b (Borde Ámbar)
  doc.setLineWidth(0.6);
  doc.roundedRect(margen, y, anchoContenido, 36, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(146, 64, 14); // #92400e
  doc.text('Advertencia legal', margen + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(69, 26, 3); // #451a03

  const textoAdvertencia = 
    `Este documento es un comprobante informativo del cálculo de prestaciones y NO constituye el finiquito laboral. Conforme al Art. 402 inciso ` +
    `2 del Código de Trabajo, la renuncia, la terminación por mutuo consentimiento o el recibo de pago de prestaciones por despido sin causa ` +
    `legal solo tienen valor probatorio si constan en hojas extendidas por la Dirección General de Inspección de Trabajo o por los jueces con ` +
    `competencia en materia laboral, utilizadas dentro de los diez días siguientes a su expedición, o bien en documento privado autenticado ` +
    `ante notario. Se recomienda asesoría legal profesional antes de suscribir cualquier finiquito.`;

  const lineasAdvertencia = doc.splitTextToSize(textoAdvertencia, anchoContenido - 8);
  doc.text(lineasAdvertencia, margen + 4, y + 11.5);

  // Pie de Página - Página 2
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(fechaGeneracionTexto, margen, altoPagina - 12);
  doc.text('2 / 2', anchoPagina - margen, altoPagina - 12, { align: 'right' });

  // Guardar archivo PDF
  const nombreLimpio = (datos.nombreCompleto || 'Liquidacion').replace(/\s+/g, '_');
  const fechaArchivo = ahora.toISOString().slice(0, 10);
  doc.save(`Comprobante_Liquidación_${nombreLimpio}_${fechaArchivo}.pdf`);
}
