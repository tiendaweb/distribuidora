/* ============================================================
   VENTA DIARIA
   Muestra las ventas consolidadas de un día específico.
   Agrega todas las facturas del día y suma unidades por producto.
   Depende de: STATE.adminInvoices (cargado por utils.js/loadPersistedData).
   Funciones de entrada:
     initDailySales()           — llamado desde app.js al cargar la página
     renderDailySales(dateStr)  — re-renderiza al cambiar fecha
     downloadDailySalesPDF()    — genera y descarga el PDF del día
   ============================================================ */

/**
 * Inicializa la sección Venta Diaria.
 * Establece la fecha de hoy y renderiza el reporte.
 */
function initDailySales() {
  const input = document.getElementById('daily-sales-date');
  if (!input) return;

  const today = new Date().toISOString().slice(0, 10);
  input.value = today;
  renderDailySales(today);
}

/**
 * Setea la fecha al día de hoy y re-renderiza.
 */
function setDailySalesToday() {
  const today = new Date().toISOString().slice(0, 10);
  const input = document.getElementById('daily-sales-date');
  if (input) input.value = today;
  renderDailySales(today);
}

/**
 * Agrega las facturas de un día y retorna el resumen.
 * @param {string} dateStr — fecha en formato YYYY-MM-DD
 * @returns {{ items: Array, totalAmount: number, totalInvoices: number, totalUnits: number }}
 */
function getDailySalesData(dateStr) {
  if (!dateStr || !Array.isArray(STATE.adminInvoices)) {
    return { items: [], totalAmount: 0, totalInvoices: 0, totalUnits: 0 };
  }

  // Filtrar facturas del día. inv.date puede ser es-AR ("25/4/2025 14:30:00") o ISO.
  const dayInvoices = STATE.adminInvoices.filter(inv => {
    return parseDateToYMD(inv.date || '') === dateStr;
  });

  // Acumular unidades y montos por producto
  const byProduct = {};
  dayInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const pid = item.id || item.product_id || item.name;
      if (!byProduct[pid]) {
        byProduct[pid] = {
          id: pid,
          name: item.name || '(sin nombre)',
          qty: 0,
          totalRevenue: 0,
        };
      }
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      byProduct[pid].qty += qty;
      byProduct[pid].totalRevenue += price * qty;
    });
  });

  const items = Object.values(byProduct).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const totalAmount = items.reduce((s, i) => s + i.totalRevenue, 0);
  const totalUnits = items.reduce((s, i) => s + i.qty, 0);

  return { items, totalAmount, totalInvoices: dayInvoices.length, totalUnits };
}

/**
 * Renderiza la tabla de venta diaria en el DOM.
 * @param {string} dateStr — fecha en formato YYYY-MM-DD
 */
function renderDailySales(dateStr) {
  if (!dateStr) return;

  const data = getDailySalesData(dateStr);

  // Tarjetas resumen
  const elAmount = document.getElementById('daily-total-amount');
  const elInvoices = document.getElementById('daily-total-invoices');
  const elUnits = document.getElementById('daily-total-units');
  if (elAmount) elAmount.textContent = fmt(data.totalAmount);
  if (elInvoices) elInvoices.textContent = data.totalInvoices;
  if (elUnits) elUnits.textContent = data.totalUnits + ' u.';

  // Título y subtítulo
  const titleEl = document.getElementById('daily-sales-title');
  const subtitleEl = document.getElementById('daily-sales-subtitle');
  if (titleEl) {
    const [year, month, day] = dateStr.split('-');
    titleEl.textContent = `Ventas del ${day}/${month}/${year}`;
  }
  if (subtitleEl) subtitleEl.textContent = data.totalInvoices > 0 ? `${data.totalInvoices} factura${data.totalInvoices !== 1 ? 's' : ''}` : '';

  const emptyEl = document.getElementById('daily-sales-empty');
  const tableWrapper = document.getElementById('daily-sales-table-wrapper');
  const tbody = document.getElementById('daily-sales-tbody');
  const footerUnits = document.getElementById('daily-footer-units');
  const footerTotal = document.getElementById('daily-footer-total');

  if (data.items.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (tableWrapper) tableWrapper.classList.add('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');
  if (tableWrapper) tableWrapper.classList.remove('hidden');

  if (tbody) {
    tbody.innerHTML = data.items.map(item => {
      const avgPrice = item.qty > 0 ? item.totalRevenue / item.qty : 0;
      return `
        <tr class="border-b border-gray-100 hover:bg-gray-50">
          <td class="px-6 py-3 font-medium text-gray-800">${escapeHtml(item.name)}</td>
          <td class="text-right px-6 py-3 font-mono text-gray-700">${item.qty} u.</td>
          <td class="text-right px-6 py-3 text-gray-500 font-mono">${fmt(avgPrice)}</td>
          <td class="text-right px-6 py-3 font-semibold text-gray-800 font-mono">${fmt(item.totalRevenue)}</td>
        </tr>
      `;
    }).join('');
  }

  if (footerUnits) footerUnits.textContent = data.totalUnits + ' u.';
  if (footerTotal) footerTotal.textContent = fmt(data.totalAmount);
}

/**
 * Genera y descarga el PDF de ventas diarias usando jsPDF.
 * El formato es A4, con cabecera de empresa, tabla de productos y totales.
 */
function downloadDailySalesPDF() {
  if (!window.jspdf) {
    showToast('jsPDF no está disponible', 'error');
    return;
  }

  const input = document.getElementById('daily-sales-date');
  const dateStr = input ? input.value : new Date().toISOString().slice(0, 10);
  if (!dateStr) {
    showToast('Seleccioná una fecha primero', 'warning');
    return;
  }

  const data = getDailySalesData(dateStr);
  if (data.items.length === 0) {
    showToast('No hay ventas para descargar en esta fecha', 'warning');
    return;
  }

  const [year, month, day] = dateStr.split('-');
  const dateLabel = `${day}/${month}/${year}`;

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 190;

  // ── Cabecera ──────────────────────────────────────────────
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageW, 30);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(CONFIG.APP_NAME || 'La Distribuidora', 15, 22);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(CONFIG.LOCATION || 'Necochea, Buenos Aires', 15, 28);
  doc.text('Mayorista de Alimentos', 15, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('RESUMEN DE VENTAS DIARIAS', pageW / 2 + 10, 20, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fecha: ${dateLabel}`, pageW / 2 + 10, 28, { align: 'center' });
  doc.text(`${data.totalInvoices} factura${data.totalInvoices !== 1 ? 's' : ''}`, pageW / 2 + 10, 34, { align: 'center' });

  // ── Tabla cabecera ────────────────────────────────────────
  let y = 50;
  doc.setLineWidth(0.4);
  doc.line(10, y, 200, y);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Producto', 12, y + 6);
  doc.text('Unidades', 130, y + 6);
  doc.text('Precio Prom.', 150, y + 6);
  doc.text('Subtotal', 179, y + 6);
  y += 8;
  doc.line(10, y, 200, y);

  // ── Filas de productos ────────────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  y += 2;

  data.items.forEach(item => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    const avgPrice = item.qty > 0 ? item.totalRevenue / item.qty : 0;
    const nameLines = doc.splitTextToSize(item.name, 110);
    doc.text(nameLines, 12, y + 5);
    doc.text(String(item.qty) + ' u.', 130, y + 5);
    doc.text(fmt(avgPrice), 150, y + 5);
    doc.text(fmt(item.totalRevenue), 179, y + 5);
    y += 6 * nameLines.length + 1;
    doc.setDrawColor(230);
    doc.line(10, y, 200, y);
    doc.setDrawColor(0);
    y += 1;
  });

  // ── Totales ───────────────────────────────────────────────
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Total unidades:', 130, y + 5);
  doc.text(String(data.totalUnits) + ' u.', 168, y + 5);
  y += 8;
  doc.setFontSize(11);
  doc.text('TOTAL DEL DÍA:', 130, y + 5);
  doc.text(fmt(data.totalAmount), 179, y + 5);

  // ── Guardar ───────────────────────────────────────────────
  doc.save(`VentaDiaria_${dateStr}.pdf`);
  showToast('PDF descargado correctamente', 'success');
}
