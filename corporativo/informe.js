/* Exportación local: los datos del panel no se envían a servicios externos. */
async function exportarInformeExcel(registros, filtros) {
  const book = new ExcelJS.Workbook();
  book.creator = 'Aerobol Academy';
  book.created = new Date();
  const sheet = book.addWorksheet('Preinscritos', { views: [{ state: 'frozen', ySplit: 9, showGridLines: false }] });
  const green = 'FF008561', purple = 'FF702082', ink = 'FF18354A', muted = 'FF718096';
  sheet.properties.defaultRowHeight = 22;
  const widths = [23, 32, 20, 32, 21, 32, 22, 15, 18, 15, 30, 23, 24, 18, 30, 22, 26, 22, 26, 26, 30, 40, 24, 28, 30];
  widths.forEach((width, index) => { sheet.getColumn(index + 1).width = width; });
  for (let row = 1; row <= 3; row++) sheet.getRow(row).height = 25;
  sheet.mergeCells('D1:L2');
  sheet.getCell('D1').value = 'INFORME DE PREINSCRIPCIONES';
  sheet.getCell('D1').font = { name: 'Calibri', size: 20, bold: true, color: { argb: ink } };
  sheet.getCell('D1').alignment = { vertical: 'middle' };
  sheet.mergeCells('D3:L3');
  sheet.getCell('D3').value = 'Aerobol Academy · Equipo de admisiones';
  sheet.getCell('D3').font = { size: 12, color: { argb: green } };
  const response = await fetch('../assets/logo-aerobol-transparente.png');
  if (!response.ok) throw new Error('Logo no disponible');
  const blob = await response.blob();
  const base64 = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
  const image = book.addImage({ base64, extension: 'png' });
  sheet.addImage(image, { tl: { col: .15, row: .15 }, ext: { width: 220, height: 78 } });
  const fecha = new Intl.DateTimeFormat('es-BO', { timeZone: 'America/La_Paz', dateStyle: 'long', timeStyle: 'short' }).format(new Date());
  [['A5', 'Generado: ' + fecha + ' · Hora de Bolivia'], ['A6', 'Estado: ' + (filtros.estado === 'done' ? 'Atendidos' : filtros.estado === 'pending' ? 'Pendientes' : 'Todos') + '   |   Fecha: ' + filtros.fechas + '   |   Búsqueda: ' + (filtros.busqueda || 'Sin filtro')], ['A7', 'Total del informe: ' + registros.length + ' registros · Incluye todas las páginas del filtro seleccionado.']].forEach(([cell, value]) => {
    const row = Number(cell.slice(1)); sheet.mergeCells(row, 1, row, widths.length); sheet.getCell(cell).value = value; sheet.getCell(cell).font = { name: 'Calibri', size: 11, color: { argb: muted } };
  });
  const headers = ['Fecha de registro (Bolivia)', 'Nombre completo', 'WhatsApp', 'Correo electrónico', 'Ciudad', 'Carrera de interés', 'Inicio de interés', 'Edad', 'Horario de contacto', 'Estado', 'Atendido por', 'Origen de campaña', 'Cómo nos conoció', 'Bachiller', 'Nombre del tutor', 'Celular del tutor', 'Campaña UTM', 'Medio UTM', 'Contenido UTM', 'Término UTM', 'FBCLID', 'Código', 'Fecha de atención', 'Título profesional o técnico', 'Grado académico'];
  sheet.getRow(9).values = headers; sheet.getRow(9).height = 34;
  sheet.getRow(9).eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: green } }; cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } }; cell.alignment = { vertical: 'middle', wrapText: true }; });
  const dateFormat = new Intl.DateTimeFormat('es-BO', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  registros.forEach((r, index) => {
    const row = sheet.addRow([dateFormat.format(new Date(r.date)), r.name, r.phone, r.email || 'No indicado', r.city, r.career, r.start, r.age ? Number(r.age) : "No indicada", r.time, r.status === 'done' ? 'Atendido' : 'Pendiente', r.attendedBy || '—', r.source, r.declaredSource || 'No indicado', r.bachiller || 'No indicado', r.tutorName || 'No aplica', r.tutorPhone || 'No aplica', r.campaign, r.medium, r.content, r.term, r.fbclid, r.code, r.attendedAt ? dateFormat.format(new Date(r.attendedAt)) : 'Pendiente', r.tituloProfesionalTecnico, r.gradoAcademico]);
    row.height = 36;
    row.eachCell({ includeEmpty: true }, cell => { cell.font = { name: 'Calibri', size: 11, color: { argb: ink } }; cell.alignment = { vertical: 'middle', wrapText: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: index % 2 ? 'FFF1F6F5' : 'FFFFFFFF' } }; cell.border = { bottom: { style: 'hair', color: { argb: 'FFDFE7EB' } } }; });
    row.getCell(3).numFmt = '@';
    row.getCell(10).font = { bold: true, color: { argb: r.status === 'done' ? green : 'FFB97800' } };
  });
  sheet.autoFilter = { from: { row: 9, column: 1 }, to: { row: Math.max(9, 9 + registros.length), column: widths.length } };
  const footer = sheet.getRow(12 + registros.length); footer.getCell(1).value = 'Aerobol Academy · Uso interno de admisiones'; footer.getCell(1).font = { italic: true, size: 10, color: { argb: purple } };
  sheet.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '9:9', printArea: 'A1:Y' + (12 + registros.length) };
  sheet.headerFooter.oddFooter = '&LAerobol Academy&RPágina &P de &N';
  const buffer = await book.xlsx.writeBuffer();
  const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
  const a = document.createElement('a'); a.href = url; a.download = 'Aerobol_Preinscritos_' + (filtros.estado || 'todos') + '_' + new Date().toISOString().slice(0, 10) + '.xlsx'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
