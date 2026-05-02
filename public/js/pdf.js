/* ============================================================
   PDF GENERATION — Tipos: x (Pedido), a, b, c (Factura)
   ============================================================ */

const PDF_DOC_TYPES = {
  x: { label: 'PEDIDO', letter: 'X', cod: null,       showIva: false },
  a: { label: 'FACTURA',     letter: 'A', cod: 'COD. 001', showIva: true  },
  b: { label: 'FACTURA',     letter: 'B', cod: 'COD. 006', showIva: false },
  c: { label: 'FACTURA',     letter: 'C', cod: 'COD. 011', showIva: false }
};

function generateInvoicePDF(client, docType, items, total, invoiceId = null) {
  if (!window.jspdf) {
    showToast('jsPDF no está disponible', 'error');
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const typeInfo   = PDF_DOC_TYPES[docType] || PDF_DOC_TYPES.x;
  const dateStr    = getCurrentDate();
  const numDoc     = invoiceId ? invoiceId.split('-').pop().substring(0, 8).padEnd(8, '0') : String(Math.floor(Math.random() * 99999)).padStart(8, '0');
  const isPresup   = docType === 'x';

  // Para Factura A, desglosa IVA 21 %
  const netAmount  = typeInfo.showIva ? total / 1.21 : total;
  const ivaAmount  = typeInfo.showIva ? total - netAmount : 0;

  // ── Dibuja una mitad de hoja (original o duplicado) ────────────
  function drawHalf(oY, copyLabel) {
    const pageW = 190;
    const boxH  = 130;

    // Marco exterior
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.rect(10, oY + 10, pageW, boxH);

    // ── Cabecera empresa (izquierda) ──────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(CONFIG.APP_NAME || 'La Distribuidora', 15, oY + 17);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Mayorista de Alimentos - Necochea', 15, oY + 21.5);

    // ── Cuadro central con letra del comprobante ──────────────────
    doc.setLineWidth(0.6);
    doc.rect(92, oY + 10, 26, 18);
    doc.setLineWidth(0.4);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.text(typeInfo.letter, 105, oY + 23.5, { align: 'center' });
    if (typeInfo.cod) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.text(typeInfo.cod, 105, oY + 28, { align: 'center' });
    }

    // ── Cabecera documento (derecha) ──────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(typeInfo.label, 122, oY + 16.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`N°: 0001-${numDoc}`, 122, oY + 21);
    doc.text(`Fecha: ${dateStr}`,  122, oY + 25);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.text(copyLabel, 122, oY + 28.5);

    // ── Separador ─────────────────────────────────────────────────
    doc.setFont('helvetica', 'normal');
    doc.line(10, oY + 31, 200, oY + 31);

    // ── Datos del cliente ─────────────────────────────────────────
    doc.setFontSize(8.5);
    const col2 = 115;

    doc.setFont('helvetica', 'bold');   doc.text('Señor(es):', 15, oY + 35);
    doc.setFont('helvetica', 'normal'); doc.text((client.name || '').substring(0, 40), 33, oY + 35);
    doc.setFont('helvetica', 'bold');   doc.text('Cond.:', col2, oY + 35);
    doc.setFont('helvetica', 'normal'); doc.text((client.tax || '—').substring(0, 15), col2 + 18, oY + 35);

    doc.setFont('helvetica', 'bold');   doc.text('Domicilio:', 15, oY + 38.5);
    doc.setFont('helvetica', 'normal'); doc.text((client.address || '—').substring(0, 40), 33, oY + 38.5);
    doc.setFont('helvetica', 'bold');   doc.text('CUIT:', col2, oY + 38.5);
    doc.setFont('helvetica', 'normal'); doc.text(client.cuit || '—', col2 + 18, oY + 38.5);

    // ── Cabecera tabla de items ───────────────────────────────────
    doc.line(10, oY + 42, 200, oY + 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('Cant.',       13,  oY + 45.5);
    doc.text('Descripción', 28,  oY + 45.5);
    doc.text('P. Unit.',    150, oY + 45.5);
    doc.text('Subtotal',    179, oY + 45.5);

    // Cabecera columna 2 si hay muchos items
    if (items.length > 14) {
      doc.text('Cant.',       110, oY + 45.5);
      doc.text('Descripción', 125, oY + 45.5);
      doc.text('P. Unit.',    167, oY + 45.5);
      doc.text('Subtotal',    192, oY + 45.5);
    }

    doc.line(10, oY + 47, 200, oY + 47);

    // ── Items (2 columnas si es necesario) ──────────────────────
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    const maxItemsPerColumn = 14;
    const itemsCol1 = items.slice(0, maxItemsPerColumn);
    const itemsCol2 = items.slice(maxItemsPerColumn);

    const drawItemsColumn = (itemList, startX, descStartX, priceX, subtotalX, startRowY) => {
      let rowY = startRowY;
      const maxItemsHeight = oY + 105;
      itemList.forEach(item => {
        if (rowY > maxItemsHeight) return;
        const descLines = doc.splitTextToSize(item.name, Math.max(30, descStartX - startX - 5));
        const lineHeight = descLines.length > 1 ? 4.5 : 3.8;
        doc.text(String(item.qty), startX, rowY);
        doc.text(descLines, descStartX, rowY);
        doc.text(fmt(item.price), priceX, rowY);
        doc.text(fmt(item.price * item.qty), subtotalX, rowY);
        rowY += lineHeight;
      });
    };

    // Columna 1 (izquierda)
    drawItemsColumn(itemsCol1, 13, 28, 150, 179, oY + 50);

    // Columna 2 (derecha) si hay más items
    if (itemsCol2.length > 0) {
      drawItemsColumn(itemsCol2, 110, 125, 167, 192, oY + 50);
    }

    // ── Totales ───────────────────────────────────────────────────
    doc.line(10, oY + 118, 200, oY + 118);

    if (typeInfo.showIva) {
      // Factura A: desglose neto + IVA
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text('Neto Gravado:', 143, oY + 122);
      doc.text(fmt(netAmount),  179, oY + 122);
      doc.text('IVA 21%:',      143, oY + 125.5);
      doc.text(fmt(ivaAmount),  179, oY + 125.5);
      doc.setLineWidth(0.2);
      doc.line(141, oY + 127.5, 200, oY + 127.5);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('TOTAL:',    143, oY + 130.5);
      doc.text(fmt(total),  179, oY + 130.5);
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('TOTAL:',   148, oY + 125);
      doc.text(fmt(total), 179, oY + 125);
    }

    // Aclaración presupuesto
    if (isPresup) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(6);
      doc.text('Documento no válido como comprobante fiscal. Uso interno.', 15, oY + 130);
    }
  }

  // ── Página: ORIGINAL arriba, DUPLICADO abajo ──────────────────
  drawHalf(0,     'ORIGINAL');

  doc.setDrawColor(140);
  doc.setLineDashPattern([2.5, 2.5], 0);
  doc.line(0, 148.5, 210, 148.5);
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(0);

  drawHalf(148.5, 'DUPLICADO');

  // ── Guardar archivo ───────────────────────────────────────────
  const prefix   = isPresup ? 'Pedido' : `Factura-${typeInfo.letter}`;
  const safeName = (client.name || 'cliente').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ]/g, '_');
  const safeDate = dateStr.replace(/\//g, '-');
  doc.save(`${prefix}_${safeName}_${safeDate}.pdf`);
}
