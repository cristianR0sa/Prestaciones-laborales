import { jsPDF } from 'jspdf';
import { DatosEmpleado, ResultadoLiquidacion } from '../types';
import { formatearMoneda } from './calculator';

export function generarLiquidacionPDF(datos: DatosEmpleado, resultados: ResultadoLiquidacion) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const anchoPagina = doc.internal.pageSize.getWidth();
  const margen = 14;
  const anchoContenido = anchoPagina - (margen * 2);
  let y = 14;

  // Encabezado
  doc.setFillColor(10, 46, 92); // #0a2e5c
  doc.rect(margen, y, anchoContenido, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REPÚBLICA DE EL SALVADOR', anchoPagina / 2, y + 7, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('HOJA DE LIQUIDACIÓN Y CÁLCULO DE PRESTACIONES LABORALES', anchoPagina / 2, y + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Conforme al Código de Trabajo y Leyes Laborales Vigentes', anchoPagina / 2, y + 18, { align: 'center' });

  y += 27;

  // Cuadro de Datos Generales
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margen, y, anchoContenido, 42, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. DATOS GENERALES Y CONTRACTUALES', margen + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  // Columna 1
  const col1X = margen + 4;
  doc.text(`Trabajador:`, col1X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${datos.nombreCompleto || 'No especificado'}`, col1X + 22, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa / Patrono:`, col1X, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${datos.empresa || 'Empresa Empleadora'}`, col1X + 30, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo Terminación:`, col1X, y + 29);
  doc.setFont('helvetica', 'bold');
  const etiquetaTerminacion = datos.tipoTerminacion === 'despido_injustificado' 
    ? 'Despido Injustificado (Art. 58 C.T.)' 
    : `Renuncia Voluntaria (${datos.informoAlPatrono ? 'Con Preaviso' : 'SIN Preaviso - Bloqueado'})`;
  doc.text(etiquetaTerminacion, col1X + 28, y + 29);

  // Columna 2
  const col2X = margen + 105;
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Inicio:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${datos.fechaInicio || 'N/A'}`, col2X + 22, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Finalización:`, col2X, y + 21);
  doc.setFont('helvetica', 'bold');
  doc.text(`${datos.fechaFin || 'N/A'}`, col2X + 30, y + 21);

  doc.setFont('helvetica', 'normal');
  doc.text(`Tiempo Laborado:`, col2X, y + 29);
  doc.setFont('helvetica', 'bold');
  doc.text(`${resultados.anosTrabajados} años, ${resultados.mesesTrabajados} meses, ${resultados.diasTrabajados} días`, col2X + 28, y + 29);

  doc.setFont('helvetica', 'normal');
  doc.text(`Salario Mensual:`, col2X, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatearMoneda(datos.salarioMensual)} (Diario: ${formatearMoneda(resultados.salarioDiario)})`, col2X + 26, y + 37);

  y += 47;

  // Sección 2: Desglose
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. LIQUIDACIÓN DETALLADA DE PRESTACIONES LABORALES', margen, y);
  y += 3;

  // Tabla Header
  doc.setFillColor(10, 46, 92);
  doc.rect(margen, y, anchoContenido, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Concepto Legal', margen + 4, y + 4.5);
  doc.text('Base de Cálculo / Días', margen + 90, y + 4.5);
  doc.text('Monto Devengado', margen + anchoContenido - 4, y + 4.5, { align: 'right' });

  y += 7;

  const imprimirFila = (titulo: string, subtitulo: string, detalle: string, monto: number, bloqueado = false, fondo = false) => {
    const altoFila = 11;
    if (fondo) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margen, y, anchoContenido, altoFila, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margen, y + altoFila, margen + anchoContenido, y + altoFila);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(titulo, margen + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitulo, margen + 4, y + 8.5);

    doc.setTextColor(30, 41, 59);
    doc.text(detalle, margen + 90, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (bloqueado) {
      doc.setTextColor(220, 38, 38);
      doc.text('$0.00 (Bloqueado)', margen + anchoContenido - 4, y + 6, { align: 'right' });
    } else {
      doc.setTextColor(15, 23, 42);
      doc.text(formatearMoneda(monto), margen + anchoContenido - 4, y + 6, { align: 'right' });
    }

    y += altoFila;
  };

  // Fila 1: Indemnización
  if (datos.tipoTerminacion === 'despido_injustificado') {
    const notaTope = resultados.aplicaTopeLegal ? ' (Tope 4 Salarios Mínimos Comercio: $1,460.00)' : '';
    imprimirFila(
      'Indemnización por Despido Injustificado',
      `Art. 58 Código de Trabajo${notaTope}`,
      `${resultados.anosTrabajados} años + ${resultados.mesesTrabajados}m ${resultados.diasTrabajados}d`,
      resultados.montoIndemnizacion,
      false,
      false
    );
  } else {
    imprimirFila(
      'Compensación por Renuncia Voluntaria',
      datos.informoAlPatrono 
        ? 'Ley de Prestación por Renuncia Voluntaria (15 días/año)'
        : 'BLOQUEADO: No informó con preaviso legal al patrono',
      datos.informoAlPatrono ? `${resultados.anosTrabajados} años laborados` : 'Requisito incumplido',
      resultados.montoIndemnizacion,
      resultados.indemnizacionBloqueada,
      false
    );
  }

  // Fila 2: Aguinaldo
  const descAguinaldo = resultados.aguinaldoEsProporcional 
    ? `Proporcional (${resultados.diasTrabajadosPeriodoAguinaldo} días trabajados en periodo)`
    : `Completo (${resultados.diasAguinaldoDerecho} días de salario)`;
  imprimirFila(
    'Aguinaldo',
    `Art. 196-202 Código de Trabajo | Rango: ${resultados.tramoAntiguedadAguinaldo}`,
    descAguinaldo,
    resultados.montoAguinaldo,
    false,
    true
  );

  // Fila 3: Vacaciones
  const descVacacion = `Proporcional (${resultados.diasVacacionesPagar.toFixed(1)} días + 30% prima)`;
  imprimirFila(
    'Vacaciones Anuales + Prima Vacacional (30%)',
    'Art. 177 y 182 Código de Trabajo (15 días descanso remunerado + 30% recargo)',
    descVacacion,
    resultados.totalVacaciones,
    false,
    false
  );

  // Fila 4: Días de Asueto
  const descAsueto = resultados.cantidadAsuetosLaborados > 0 
    ? `${resultados.cantidadAsuetosLaborados} día(s) laborado(s) con recargo 100% (pago doble)`
    : 'No laboró en días de asueto';
  imprimirFila(
    'Remuneración por Días de Asueto Laborados',
    'Art. 192 Código de Trabajo (Salario ordinario + recargo 100%)',
    descAsueto,
    resultados.montoAsuetosLaborados,
    false,
    true
  );

  // Fila 5: Horas Extras
  const descHE = resultados.totalHorasExtras > 0 
    ? `Total: ${resultados.totalHorasExtras}h (Diurnas: ${resultados.horasExtrasDiurnas}h, Nocturnas: ${resultados.horasExtrasNocturnas}h)`
    : 'Sin horas extras pendientes';
  imprimirFila(
    'Horas Extraordinarias No Pagadas',
    'Art. 168-170 Código de Trabajo (Diurna +100% / Nocturna +150%)',
    descHE,
    resultados.montoHorasExtras,
    false,
    false
  );

  y += 4;

  // Totales y Deducciones
  const altoCajaTotales = 36;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margen, y, anchoContenido, altoCajaTotales, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margen, y, anchoContenido, altoCajaTotales, 2, 2, 'D');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL BRUTO (Sin Descuentos ISSS ni AFP):', margen + 6, y + 8);
  doc.setFontSize(9.5);
  doc.setTextColor(10, 46, 92);
  doc.text(formatearMoneda(resultados.totalBruto), margen + 92, y + 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('(-) Deducción ISSS (3.00% - Tope Legal $30.00):', margen + 6, y + 16);
  doc.text(`- ${formatearMoneda(resultados.descuentoISSS)}`, margen + 92, y + 16);

  doc.text('(-) Deducción AFP (7.25% Fondo de Pensiones):', margen + 6, y + 23);
  doc.text(`- ${formatearMoneda(resultados.descuentoAFP)}`, margen + 92, y + 23);

  // Total Líquido Destacado
  doc.setFillColor(10, 46, 92);
  doc.rect(margen + 105, y + 4, anchoContenido - 105 - 4, altoCajaTotales - 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('TOTAL LÍQUIDO A RECIBIR:', margen + 110, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatearMoneda(resultados.totalNeto), margen + 110, y + 23);

  y += altoCajaTotales + 6;

  // Finiquito Legal
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const textoFiniquito = 
    'DECLARACIÓN Y FINIQUITO: Con la recepción de la cantidad líquida descrita en la presente liquidación, el trabajador declara estar plenamente ' +
    'satisfecho en todos sus derechos laborales, salarios, prestaciones legales y contractuales devengadas durante la vigencia de la relación laboral, ' +
    'conforme a las disposiciones del Código de Trabajo de la República de El Salvador, no teniendo reclamo posterior alguno contra el patrono.';
  const textoDividido = doc.splitTextToSize(textoFiniquito, anchoContenido);
  doc.text(textoDividido, margen, y);

  y += 18;

  // Firmas
  const anchoCajaFirma = (anchoContenido - 20) / 2;
  
  doc.setDrawColor(148, 163, 184);
  doc.line(margen + 5, y + 16, margen + 5 + anchoCajaFirma, y + 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA DEL TRABAJADOR', margen + 5 + (anchoCajaFirma / 2), y + 21, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${datos.nombreCompleto || '__________________________'}`, margen + 5 + (anchoCajaFirma / 2), y + 25, { align: 'center' });

  const colPatronoX = margen + 15 + anchoCajaFirma;
  doc.line(colPatronoX, y + 16, colPatronoX + anchoCajaFirma, y + 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('FIRMA Y SELLO DEL PATRONO', colPatronoX + (anchoCajaFirma / 2), y + 21, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${datos.empresa || '__________________________'}`, colPatronoX + (anchoCajaFirma / 2), y + 25, { align: 'center' });
  doc.text('Representante Legal / RRHH', colPatronoX + (anchoCajaFirma / 2), y + 29, { align: 'center' });

  // Guardar PDF
  const nombreArchivo = `Liquidacion_${(datos.nombreCompleto || 'Empleado').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(nombreArchivo);
}
