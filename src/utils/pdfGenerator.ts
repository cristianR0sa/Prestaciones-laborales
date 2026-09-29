import { jsPDF } from 'jspdf';
import { EmployeeData, CalculationResult } from '../types';
import { formatCurrency } from './calculator';

export function generateLaborLiquidationPDF(data: EmployeeData, results: CalculationResult) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - (margin * 2);
  let y = 14;

  // Header Banner
  doc.setFillColor(30, 64, 175); // #1e40af (Azul El Salvador)
  doc.rect(margin, y, contentWidth, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REPÚBLICA DE EL SALVADOR', pageWidth / 2, y + 7, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('HOJA DE LIQUIDACIÓN Y CÁLCULO DE PRESTACIONES LABORALES', pageWidth / 2, y + 13, { align: 'center' });
  doc.setFontSize(8);
  doc.text('Conforme al Código de Trabajo y Leyes Laborales Vigentes', pageWidth / 2, y + 18, { align: 'center' });

  y += 27;

  // Metadata Box (Datos del Empleado y Empresa)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 42, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('1. DATOS GENERALES Y CONTRACTUALES', margin + 4, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');

  // Columna 1
  const col1X = margin + 4;
  doc.text(`Empleado:`, col1X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.fullName || 'No especificado'}`, col1X + 22, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Documento (DUI):`, col1X, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.documentId || 'N/A'}`, col1X + 28, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Cargo / Puesto:`, col1X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.position || 'Empleado'}`, col1X + 24, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa / Patrono:`, col1X, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.companyName || 'Empresa Empleadora'}`, col1X + 30, y + 31);

  doc.setFont('helvetica', 'normal');
  doc.text(`Tipo Terminación:`, col1X, y + 37);
  doc.setFont('helvetica', 'bold');
  const termLabel = data.terminationType === 'despido_injustificado' 
    ? 'Despido Injustificado (Art. 58 C.T.)' 
    : `Renuncia Voluntaria (${data.informedEmployer ? 'Con Preaviso' : 'SIN Preaviso - Bloqueado'})`;
  doc.text(termLabel, col1X + 28, y + 37);

  // Columna 2
  const col2X = margin + 105;
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Inicio:`, col2X, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.startDate || 'N/A'}`, col2X + 22, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Terminación:`, col2X, y + 19);
  doc.setFont('helvetica', 'bold');
  doc.text(`${data.endDate || 'N/A'}`, col2X + 30, y + 19);

  doc.setFont('helvetica', 'normal');
  doc.text(`Tiempo Laborado:`, col2X, y + 25);
  doc.setFont('helvetica', 'bold');
  doc.text(`${results.yearsWorked} años, ${results.monthsWorked} meses, ${results.daysWorked} días`, col2X + 28, y + 25);

  doc.setFont('helvetica', 'normal');
  doc.text(`Salario Mensual:`, col2X, y + 31);
  doc.setFont('helvetica', 'bold');
  doc.text(`${formatCurrency(data.salary)} (Diario: ${formatCurrency(results.dailySalary)})`, col2X + 26, y + 31);

  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha de Emisión:`, col2X, y + 37);
  doc.setFont('helvetica', 'bold');
  doc.text(`${new Date().toLocaleDateString('es-SV')}`, col2X + 28, y + 37);

  y += 47;

  // Section 2: DESGLOSE DE PRESTACIONES
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('2. LIQUIDACIÓN DETALLADA DE PRESTACIONES LABORALES', margin, y);
  y += 3;

  // Table Header
  doc.setFillColor(30, 64, 175);
  doc.rect(margin, y, contentWidth, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('Concepto Legal', margin + 4, y + 4.5);
  doc.text('Base de Cálculo / Días', margin + 90, y + 4.5);
  doc.text('Monto Devengado', margin + contentWidth - 4, y + 4.5, { align: 'right' });

  y += 7;

  // Table Rows Helper
  const printRow = (title: string, subtitle: string, detail: string, amount: number, isBlocked = false, bg = false) => {
    const rowHeight = 11;
    if (bg) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, contentWidth, rowHeight, 'F');
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y + rowHeight, margin + contentWidth, y + rowHeight);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title, margin + 4, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, margin + 4, y + 8.5);

    doc.setTextColor(30, 41, 59);
    doc.text(detail, margin + 90, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (isBlocked) {
      doc.setTextColor(220, 38, 38);
      doc.text('$0.00 (Bloqueado)', margin + contentWidth - 4, y + 6, { align: 'right' });
    } else {
      doc.setTextColor(15, 23, 42);
      doc.text(formatCurrency(amount), margin + contentWidth - 4, y + 6, { align: 'right' });
    }

    y += rowHeight;
  };

  // Row 1: Indemnización
  if (data.terminationType === 'despido_injustificado') {
    const capNote = results.isCapped ? ' (Tope 4 Salarios Mínimos Comercio: $1,460.00)' : '';
    printRow(
      'Indemnización por Despido Injustificado',
      `Art. 58 Código de Trabajo${capNote}`,
      `${results.yearsWorked} años + ${results.monthsWorked}m ${results.daysWorked}d`,
      results.indemnityAmount,
      false,
      false
    );
  } else {
    printRow(
      'Compensación por Renuncia Voluntaria',
      data.informedEmployer 
        ? 'Ley de Prestación por Renuncia Voluntaria (15 días/año)'
        : 'BLOQUEADO: No informó con preaviso legal al patrono',
      data.informedEmployer ? `${results.yearsWorked} años laborados` : 'Requisito incumplido',
      results.indemnityAmount,
      results.indemnityBlocked,
      false
    );
  }

  // Row 2: Aguinaldo
  const aguinaldoDesc = results.aguinaldoIsProportional 
    ? `Proporcional (${results.aguinaldoDaysWorkedInPeriod} días trabajados en periodo)`
    : `Completo (${results.aguinaldoDaysEntitled} días de salario)`;
  printRow(
    'Aguinaldo',
    `Art. 196-202 Código de Trabajo | Rango: ${results.aguinaldoSeniorityBracket}`,
    aguinaldoDesc,
    results.aguinaldoAmount,
    false,
    true
  );

  // Row 3: Vacaciones y Prima
  const vacDesc = results.vacationIsProportional 
    ? `Proporcional (${results.vacationDaysToPay.toFixed(1)} días + 30% prima)`
    : `Completo (15 días + 30% prima = 19.5 días)`;
  printRow(
    'Vacaciones Anuales + Prima Vacacional (30%)',
    'Art. 177 y 182 Código de Trabajo (15 días descanso remunerado + 30% recargo)',
    vacDesc,
    results.vacationTotalAmount,
    false,
    false
  );

  // Row 4: Días de Asueto
  const asuetoDesc = results.holidaysWorkedCount > 0 
    ? `${results.holidaysWorkedCount} día(s) laborado(s) con recargo 100% (pago doble)`
    : 'No laboró en días de asueto';
  printRow(
    'Remuneración por Días de Asueto Laborados',
    'Art. 192 Código de Trabajo (Salario ordinario + recargo 100%)',
    asuetoDesc,
    results.holidaysWorkedAmount,
    false,
    true
  );

  // Row 5: Horas Extras
  const heDesc = results.overtimeTotalHours > 0 
    ? `Total: ${results.overtimeTotalHours}h (Diurnas: ${results.overtimeDiurnasHours}h, Nocturnas: ${results.overtimeNocturnasHours}h)`
    : 'Sin horas extras pendientes';
  printRow(
    'Horas Extraordinarias No Pagadas',
    'Art. 168-170 Código de Trabajo (Diurna +100% / Nocturna +125%)',
    heDesc,
    results.overtimeTotalAmount,
    false,
    false
  );

  y += 4;

  // Box Totals & Deductions
  const totalsBoxHeight = 36;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, totalsBoxHeight, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, totalsBoxHeight, 2, 2, 'D');

  // Columna Totales Izquierda
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('TOTAL BRUTO (Sin Descuentos ISSS ni AFP):', margin + 6, y + 8);
  doc.setFontSize(9.5);
  doc.setTextColor(2, 132, 199);
  doc.text(formatCurrency(results.grossTotal), margin + 92, y + 8);

  // Deducciones
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('(-) Deducción ISSS (3.00% - Tope Legal $30.00):', margin + 6, y + 16);
  doc.text(`- ${formatCurrency(results.isssDeduction)}`, margin + 92, y + 16);

  doc.text('(-) Deducción AFP (7.25% Fondo de Pensiones):', margin + 6, y + 23);
  doc.text(`- ${formatCurrency(results.afpDeduction)}`, margin + 92, y + 23);

  // Total Líquido Destacado
  doc.setFillColor(30, 64, 175);
  doc.rect(margin + 105, y + 4, contentWidth - 105 - 4, totalsBoxHeight - 8, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('TOTAL LÍQUIDO A RECIBIR:', margin + 110, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(formatCurrency(results.netTotal), margin + 110, y + 23);

  y += totalsBoxHeight + 6;

  // Finiquito Legal Text
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const finiquitoText = 
    'DECLARACIÓN Y FINIQUITO: Con la recepción de la cantidad líquida descrita en la presente liquidación, el trabajador declara estar plenamente ' +
    'satisfecho en todos sus derechos laborales, salarios, prestaciones legales y contractuales devengadas durante la vigencia de la relación laboral, ' +
    'conforme a las disposiciones del Código de Trabajo de la República de El Salvador, no teniendo reclamo posterior alguno contra el patrono.';
  const splitText = doc.splitTextToSize(finiquitoText, contentWidth);
  doc.text(splitText, margin, y);

  y += 18;

  // Signatures
  const sigBoxWidth = (contentWidth - 20) / 2;
  
  // Firma Empleado
  doc.setDrawColor(148, 163, 184);
  doc.line(margin + 5, y + 16, margin + 5 + sigBoxWidth, y + 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('FIRMA DEL TRABAJADOR', margin + 5 + (sigBoxWidth / 2), y + 21, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${data.fullName || '__________________________'}`, margin + 5 + (sigBoxWidth / 2), y + 25, { align: 'center' });
  doc.text(`DUI: ${data.documentId || '__________________'}`, margin + 5 + (sigBoxWidth / 2), y + 29, { align: 'center' });

  // Firma Patrono
  const colPatronoX = margin + 15 + sigBoxWidth;
  doc.line(colPatronoX, y + 16, colPatronoX + sigBoxWidth, y + 16);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('FIRMA Y SELLO DEL PATRONO', colPatronoX + (sigBoxWidth / 2), y + 21, { align: 'center' });
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Empresa: ${data.companyName || '__________________________'}`, colPatronoX + (sigBoxWidth / 2), y + 25, { align: 'center' });
  doc.text('Representante Legal / RRHH', colPatronoX + (sigBoxWidth / 2), y + 29, { align: 'center' });

  // Footer
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text('Generado por Sistema de Cálculo de Prestaciones Laborales - El Salvador', margin, 270);
  doc.text(`Página 1 de 1 - ${new Date().toISOString()}`, margin + contentWidth, 270, { align: 'right' });

  // Save PDF
  const filename = `Liquidacion_${(data.fullName || 'Empleado').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.pdf`;
  doc.save(filename);
}
