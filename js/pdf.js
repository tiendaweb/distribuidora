/* ============================================================
   PDF GENERATION
   ============================================================ */

function generateInvoicePDF(client, docType, items, total) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const dateStr = getCurrentDate();
  const numFactura = String(Math.floor(Math.random() * 99999)).padStart(8, '0');
  const isBlanco = docType === 'blanco';

  function drawHalf(startY, tipoCopia) {
    // Draw border box
    doc.setDrawColor(0);
    doc.rect(10, startY + 10, 190, 130);

    // Company header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(CONFIG.APP_NAME, 15, startY + 22);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Mayorista de Alimentos', 15, startY + 28);
    doc.text('Necochea, Buenos Aires', 15, startY + 33);
    doc.text('Tel: 0223-XXXXXX', 15, startY + 38);

    // Document type letter (solo AFIP)
    doc.rect(95, startY + 10, 20, 20);
    if (isBlanco) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(28);
      doc.text('C', 105, startY + 26, { align: 'center' });
      doc.setFontSize(8);
      doc.text('COD. 011', 105, startY + 33, { align: 'center' });
    }

    // Document header
    doc.setFontSize(16);
    doc.text(isBlanco ? 'FACTURA' : 'PRESUPUESTO', 120, startY + 22);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Comp. N°: 0001-${numFactura}`, 120, startY + 29);
    doc.text(`Fecha: ${dateStr}`, 120, startY + 35);
    doc.text(tipoCopia, 120, startY + 41);

    // Client section separator
    doc.line(10, startY + 45, 200, startY + 45);

    // Client data
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Señor(es):', 15, startY + 52);
    doc.setFont('helvetica', 'normal');
    doc.text(client.name.substring(0, 50), 35, startY + 52);

    doc.setFont('helvetica', 'bold');
    doc.text('Domicilio:', 15, startY + 58);
    doc.setFont('helvetica', 'normal');
    doc.text(client.address.substring(0, 50), 35, startY + 58);

    doc.setFont('helvetica', 'bold');
    doc.text('Condición IVA:', 105, startY + 52);
    doc.setFont('helvetica', 'normal');
    doc.text(client.tax.substring(0, 25), 135, startY + 52);

    doc.setFont('helvetica', 'bold');
    doc.text('CUIT:', 105, startY + 58);
    doc.setFont('helvetica', 'normal');
    doc.text(client.cuit || '—', 135, startY + 58);

    // Items section separator
    doc.line(10, startY + 62, 200, startY + 62);

    // Table headers
    doc.setFont('helvetica', 'bold');
    doc.text('Cant.', 15, startY + 68);
    doc.text('Descripción', 30, startY + 68);
    doc.text('P. Unit.', 150, startY + 68);
    doc.text('Subtotal', 180, startY + 68);
    doc.line(10, startY + 70, 200, startY + 70);

    // Items
    doc.setFont('helvetica', 'normal');
    let itemY = startY + 76;
    items.forEach(item => {
      doc.text(String(item.qty), 15, itemY);
      const descLines = doc.splitTextToSize(item.name, 110);
      doc.text(descLines, 30, itemY);
      doc.text(fmt(item.price), 150, itemY);
      doc.text(fmt(item.price * item.qty), 180, itemY);
      itemY += 6 * descLines.length;
    });

    // Total section
    doc.line(10, startY + 125, 200, startY + 125);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 150, startY + 133);
    doc.text(fmt(total), 180, startY + 133);

    // Disclaimer for presupuesto
    if (!isBlanco) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Documento no válido como factura. Control interno.', 15, startY + 133);
    }
  }

  // Draw first copy (ORIGINAL)
  drawHalf(0, 'ORIGINAL');

  // Draw dotted cutting line
  doc.setDrawColor(150);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(0, 148.5, 210, 148.5);
  doc.setLineDashPattern([], 0);

  // Draw second copy (DUPLICADO)
  drawHalf(148.5, 'DUPLICADO');

  // Download
  const prefix = isBlanco ? 'Factura' : 'Presupuesto';
  const filename = `${prefix}-${client.name.replace(/\s+/g, '_')}-${dateStr.replace(/\//g, '-')}.pdf`;
  doc.save(filename);
}
