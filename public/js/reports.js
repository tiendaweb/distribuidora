/* ============================================================
   REPORTS MODULE
   Genera reportes de ventas, productos, clientes y márgenes.
   Depende de: STATE.adminInvoices, STATE.products, STATE.clients,
               STATE.priceLists, STATE.changeLog (cargados por utils.js).
   Funciones de entrada: generateAllReports(), switchReportTab(name),
                         downloadReportsAsExcel(), downloadReportsAsPDF().
   ============================================================ */

let reportData = {
  dateFrom: null,
  dateTo: null
};

function switchReportTab(tabName) {
  document.querySelectorAll('.report-tab-content').forEach(el => {
    el.classList.remove('active');
    el.style.display = 'none';
  });

  document.querySelectorAll('.reports-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderBottomColor = 'transparent';
    btn.style.color = '#374151';
  });

  const activeTab = document.getElementById(`report-tab-${tabName}`);
  if (activeTab) {
    activeTab.classList.add('active');
    activeTab.style.display = 'block';
  }

  const activeBtn = document.querySelector(`.reports-tab-btn[onclick="switchReportTab('${tabName}')"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    activeBtn.style.borderBottomColor = '#4f46e5';
    activeBtn.style.color = '#4f46e5';
  }

  if (tabName === 'dashboard' && typeof generateDashboard === 'function') {
    generateDashboard();
  }
}

function getReportDateRange() {
  const fromInput = document.getElementById('reports-date-from');
  const toInput = document.getElementById('reports-date-to');

  const today = new Date();
  // Sin fecha de inicio → muestra todo el historial desde 2020
  const defaultFrom = new Date('2020-01-01T00:00:00');

  reportData.dateFrom = fromInput?.value ? new Date(fromInput.value + 'T00:00:00') : defaultFrom;
  reportData.dateTo = toInput?.value ? new Date(toInput.value + 'T23:59:59') : today;
}

function getInvoicesInDateRange() {
  getReportDateRange();
  return STATE.adminInvoices.filter(inv => {
    // inv.date puede ser es-AR ("25/4/2025 14:30:00") o ISO — parsear antes de comparar
    const ymd = parseDateToYMD(inv.date || '');
    if (!ymd) return false;
    const invDate = new Date(ymd + 'T12:00:00');
    return invDate >= reportData.dateFrom && invDate <= reportData.dateTo;
  });
}

function generatePeriodSummary() {
  const invoices = getInvoicesInDateRange();

  const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalOrders = invoices.length;
  const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Calculate total margin
  let totalMargin = 0;
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      const product = STATE.products.find(p => p.id === item.id);
      if (product) {
        const cost = product.cost * item.qty;
        const gain = (item.price * item.qty) - cost;
        totalMargin += gain;
      }
    });
  });

  // Actualizar los spans existentes en el HTML (no reemplazar el grid — eso rompe las columnas)
  const salesEl = document.getElementById('report-total-sales');
  const ordersEl = document.getElementById('report-total-orders');
  const ticketEl = document.getElementById('report-avg-ticket');
  const marginEl = document.getElementById('report-total-margin');

  if (salesEl) salesEl.textContent = fmt(totalSales);
  if (ordersEl) ordersEl.textContent = totalOrders;
  if (ticketEl) ticketEl.textContent = fmt(avgTicket);
  if (marginEl) marginEl.textContent = fmt(totalMargin);
}

function generateTopProductsReport() {
  const invoices = getInvoicesInDateRange();
  const productStats = {};

  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productStats[item.id]) {
        productStats[item.id] = {
          name: item.name,
          qty: 0,
          revenue: 0,
          cost: 0,
          margin: 0
        };
      }
      productStats[item.id].qty += item.qty;
      productStats[item.id].revenue += item.price * item.qty;

      const product = STATE.products.find(p => p.id === item.id);
      if (product) {
        productStats[item.id].cost += product.cost * item.qty;
        productStats[item.id].margin += (item.price - product.cost) * item.qty;
      }
    });
  });

  const sorted = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const tableContainer = document.getElementById('reports-top-products');
  if (!tableContainer) return;

  tableContainer.innerHTML = `
    <table class="admin-table" style="width: 100%; margin-top: 12px;">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align: right;">Cantidad</th>
          <th style="text-align: right;">Ingresos</th>
          <th style="text-align: right;">Costo</th>
          <th style="text-align: right;">Margen</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(p => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td style="text-align: right;">${p.qty} u.</td>
            <td style="text-align: right; font-weight: bold; color: var(--color-brand);">${fmt(p.revenue)}</td>
            <td style="text-align: right; color: #666;">${fmt(p.cost)}</td>
            <td style="text-align: right; font-weight: bold; color: #10b981;">${fmt(p.margin)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generateTopClientsReport() {
  const invoices = getInvoicesInDateRange();
  const clientStats = {};

  invoices.forEach(inv => {
    if (!clientStats[inv.clientId]) {
      clientStats[inv.clientId] = {
        name: inv.client,
        orders: 0,
        total: 0,
        margin: 0
      };
    }
    clientStats[inv.clientId].orders += 1;
    clientStats[inv.clientId].total += inv.total;

    // Calculate margin
    let invMargin = 0;
    inv.items.forEach(item => {
      const product = STATE.products.find(p => p.id === item.id);
      if (product) {
        const cost = product.cost * item.qty;
        invMargin += (item.price * item.qty) - cost;
      }
    });
    clientStats[inv.clientId].margin += invMargin;
  });

  const sorted = Object.values(clientStats)
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  const tableContainer = document.getElementById('reports-top-clients');
  if (!tableContainer) return;

  tableContainer.innerHTML = `
    <table class="admin-table" style="width: 100%; margin-top: 12px;">
      <thead>
        <tr>
          <th>Cliente</th>
          <th style="text-align: right;">Pedidos</th>
          <th style="text-align: right;">Monto Total</th>
          <th style="text-align: right;">Promedio</th>
          <th style="text-align: right;">Margen</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(c => `
          <tr>
            <td>${escapeHtml(c.name)}</td>
            <td style="text-align: right;">${c.orders}</td>
            <td style="text-align: right; font-weight: bold; color: var(--color-brand);">${fmt(c.total)}</td>
            <td style="text-align: right;">${fmt(c.total / c.orders)}</td>
            <td style="text-align: right; font-weight: bold; color: #10b981;">${fmt(c.margin)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generateMarginsReport() {
  const invoices = getInvoicesInDateRange();
  const productStats = {};

  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productStats[item.id]) {
        const product = STATE.products.find(p => p.id === item.id);
        productStats[item.id] = {
          name: item.name,
          cost: 0,
          revenue: 0,
          margin: 0,
          marginPercent: product?.margin || 0
        };
      }
      const product = STATE.products.find(p => p.id === item.id);
      if (product) {
        productStats[item.id].cost += product.cost * item.qty;
        productStats[item.id].revenue += item.price * item.qty;
        productStats[item.id].margin += (item.price - product.cost) * item.qty;
      }
    });
  });

  const sorted = Object.values(productStats)
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 15);

  const tableContainer = document.getElementById('reports-margins');
  if (!tableContainer) return;

  const totalCost = sorted.reduce((s, p) => s + p.cost, 0);
  const totalRevenue = sorted.reduce((s, p) => s + p.revenue, 0);
  const totalMargin = sorted.reduce((s, p) => s + p.margin, 0);
  const avgMarginPercent = sorted.length > 0 ? (totalMargin / totalRevenue * 100) : 0;

  tableContainer.innerHTML = `
    <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 16px; border-left: 4px solid var(--color-brand);">
      <p style="margin: 0 0 8px; font-weight: 600; color: #666;">Resumen de Márgenes</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px;">
        <div>
          <p style="margin: 0; font-size: 11px; color: #999;">Costo Total</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold;">${fmt(totalCost)}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 11px; color: #999;">Ingresos Total</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold;">${fmt(totalRevenue)}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 11px; color: #999;">Margen Ganado</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold; color: #10b981;">${fmt(totalMargin)}</p>
        </div>
        <div>
          <p style="margin: 0; font-size: 11px; color: #999;">% Margen Promedio</p>
          <p style="margin: 4px 0 0; font-size: 16px; font-weight: bold;">${avgMarginPercent.toFixed(1)}%</p>
        </div>
      </div>
    </div>
    <table class="admin-table" style="width: 100%; margin-top: 12px;">
      <thead>
        <tr>
          <th>Producto</th>
          <th style="text-align: right;">Costo Total</th>
          <th style="text-align: right;">Ingresos</th>
          <th style="text-align: right;">Margen Ganado</th>
          <th style="text-align: right;">% Margen</th>
        </tr>
      </thead>
      <tbody>
        ${sorted.map(p => `
          <tr>
            <td>${escapeHtml(p.name)}</td>
            <td style="text-align: right;">${fmt(p.cost)}</td>
            <td style="text-align: right;">${fmt(p.revenue)}</td>
            <td style="text-align: right; font-weight: bold; color: #10b981;">${fmt(p.margin)}</td>
            <td style="text-align: right;">${(p.margin / p.revenue * 100).toFixed(1)}%</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function generateLowStockReport() {
  const lowStockProducts = STATE.products.filter(p => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  const tableContainer = document.getElementById('reports-low-stock');
  if (!tableContainer) return;

  if (lowStockProducts.length === 0) {
    tableContainer.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:#999;">Sin productos con stock bajo</td></tr>';
    return;
  }

  tableContainer.innerHTML = lowStockProducts.map(p => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px;">${escapeHtml(p.name)}</td>
      <td style="text-align:center; padding:12px;">
        <span style="background:${p.stock <= 2 ? '#fee2e2' : '#fef3c7'}; color:${p.stock <= 2 ? '#991b1b' : '#92400e'}; padding:4px 8px; border-radius:4px; font-weight:bold;">
          ${p.stock} u.
        </span>
      </td>
    </tr>
  `).join('');
}

function generatePriceListsReport() {
  const headerRow = document.getElementById('reports-price-lists-header');
  const tableContainer = document.getElementById('reports-price-lists');
  if (!headerRow || !tableContainer) return;

  const activeLists = STATE.priceLists.filter(pl => pl.is_active);

  if (activeLists.length === 0) {
    tableContainer.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:20px; color:#999;">Sin listas de precios activas</td></tr>';
    return;
  }

  headerRow.innerHTML = '<th style="text-align:left; padding:12px; font-weight:600;">Producto</th>' +
    activeLists.map(list => `<th style="text-align:right; padding:12px; font-weight:600;">${escapeHtml(list.name)}</th>`).join('');

  const htmlRows = STATE.products.map(product => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:12px; font-weight:500;">${escapeHtml(product.name)}</td>
      ${activeLists.map(list => {
        const price = getPriceForList(product, list.id);
        return `<td style="text-align:right; padding:12px;">$${roundPrice(price).toFixed(2)}</td>`;
      }).join('')}
    </tr>
  `).join('');

  tableContainer.innerHTML = htmlRows;
}

function generateDashboard() {
  const today = new Date();
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const totalProducts = STATE.products.length;
  const lowStock = STATE.products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const zeroStock = STATE.products.filter(p => p.stock === 0).length;
  const totalClients = STATE.clients.length;
  const activeLists = (STATE.priceLists || []).filter(pl => pl.is_active).length;

  const monthInvoices = (STATE.adminInvoices || []).filter(inv => {
    const ymd = parseDateToYMD(inv.date || '');
    return ymd ? new Date(ymd + 'T12:00:00') >= firstOfMonth : false;
  });
  const monthSales = monthInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const el = id => document.getElementById(id);
  if (el('dash-total-products')) el('dash-total-products').textContent = totalProducts;
  if (el('dash-low-stock')) el('dash-low-stock').textContent = lowStock;
  if (el('dash-zero-stock')) el('dash-zero-stock').textContent = zeroStock;
  if (el('dash-total-clients')) el('dash-total-clients').textContent = totalClients;
  if (el('dash-month-sales')) el('dash-month-sales').textContent = fmt(monthSales);
  if (el('dash-active-lists')) el('dash-active-lists').textContent = activeLists;

  // Stock status breakdown
  const stockEl = el('dash-stock-status');
  if (stockEl) {
    const normalStock = totalProducts - lowStock - zeroStock;
    const pct = (n, total) => total > 0 ? Math.round(n / total * 100) : 0;
    stockEl.innerHTML = `
      <div class="space-y-3">
        <div>
          <div class="flex justify-between text-sm mb-1"><span class="text-green-600 font-medium">Normal</span><span>${normalStock}</span></div>
          <div class="bg-gray-100 rounded-full h-2"><div class="bg-green-500 h-2 rounded-full" style="width:${pct(normalStock, totalProducts)}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1"><span class="text-amber-600 font-medium">Stock Bajo (≤5)</span><span>${lowStock}</span></div>
          <div class="bg-gray-100 rounded-full h-2"><div class="bg-amber-400 h-2 rounded-full" style="width:${pct(lowStock, totalProducts)}%"></div></div>
        </div>
        <div>
          <div class="flex justify-between text-sm mb-1"><span class="text-red-600 font-medium">Sin Stock</span><span>${zeroStock}</span></div>
          <div class="bg-gray-100 rounded-full h-2"><div class="bg-red-500 h-2 rounded-full" style="width:${pct(zeroStock, totalProducts)}%"></div></div>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3">${totalProducts} productos en total</p>
    `;
  }

  // Price lists
  const listsEl = el('dash-price-lists');
  if (listsEl) {
    const lists = STATE.priceLists || [];
    if (lists.length === 0) {
      listsEl.innerHTML = '<p class="text-gray-400 text-sm">Sin listas de precios</p>';
    } else {
      listsEl.innerHTML = lists.map(pl => `
        <div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
          <div>
            <span class="font-semibold text-gray-800 text-sm">${escapeHtml(pl.name)}</span>
            ${pl.is_default ? '<span class="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Principal</span>' : ''}
          </div>
          <div class="text-right">
            <span class="text-sm font-mono ${pl.is_active ? 'text-green-600' : 'text-gray-400'}">
              ×${parseFloat(pl.factor || 1).toFixed(2)}
            </span>
            <span class="ml-2 text-xs ${pl.is_active ? 'text-green-600' : 'text-red-400'}">${pl.is_active ? 'Activa' : 'Inactiva'}</span>
          </div>
        </div>
      `).join('');
    }
  }

  // Recent changes
  const changesEl = el('dash-recent-changes');
  if (changesEl) {
    const log = (STATE.changeLog || []).slice(0, 8);
    if (log.length === 0) {
      changesEl.innerHTML = '<p class="text-gray-400 text-sm">Sin cambios registrados</p>';
    } else {
      const typeColors = { factura: '#3B82F6', stock: '#10B981', precio: '#F59E0B', producto: '#8B5CF6', bulk: '#6366F1' };
      changesEl.innerHTML = `<div class="space-y-2">${log.map(entry => {
        const color = typeColors[entry.type] || '#9CA3AF';
        return `
          <div class="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
            <span style="background:${color}22; color:${color}; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:700; white-space:nowrap;">${(entry.type || 'otro').toUpperCase()}</span>
            <span class="text-sm text-gray-800 flex-1 truncate">${escapeHtml(entry.productName || entry.note || '—')}</span>
            ${entry.oldValue || entry.newValue ? `<span class="text-xs text-gray-400 whitespace-nowrap">${entry.oldValue ? `<span style="color:#ef4444">${escapeHtml(entry.oldValue)}</span> → ` : ''}${entry.newValue ? `<span style="color:#10b981">${escapeHtml(entry.newValue)}</span>` : ''}</span>` : ''}
            <span class="text-xs text-gray-400 whitespace-nowrap">${new Date(entry.date).toLocaleDateString('es-AR')}</span>
          </div>`;
      }).join('')}</div>`;
    }
  }
}

function generateHistoryReport() {
  const container = document.getElementById('reports-history');
  if (!container) return;

  if (!STATE.changeLog || STATE.changeLog.length === 0) {
    container.innerHTML = '<p style="color: #999; text-align: center; padding: 32px;">No hay historial de cambios</p>';
    return;
  }

  const types = {};
  STATE.changeLog.forEach(entry => {
    types[entry.type] = (types[entry.type] || 0) + 1;
  });

  const summary = Object.entries(types)
    .map(([type, count]) => `<span style="background: #e5e7eb; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 600;">${type.toUpperCase()}: ${count}</span>`)
    .join('');

  let html = `
    <div style="margin-bottom: 16px;">
      <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; color: #666;">Resumen de cambios</p>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">${summary}</div>
    </div>
    <div style="max-height: 600px; overflow-y: auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px;">
      ${STATE.changeLog.map(entry => {
        const color = entry.type === 'precio' ? '#3b82f6' : entry.type === 'stock' ? '#10b981' : entry.type === 'producto' ? '#f59e0b' : '#6b7280';
        const date = new Date(entry.date);
        const dateStr = date.toLocaleDateString('es-AR');
        const timeStr = date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

        return `
          <div style="padding: 12px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 12px;">
            <span style="background: ${color}22; color: ${color}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; white-space: nowrap;">
              ${(entry.type || 'otro').toUpperCase()}
            </span>
            <div style="flex: 1; min-width: 0;">
              <p style="margin: 0; font-size: 13px; font-weight: 600; color: #1f2937;">
                ${escapeHtml(entry.productName || entry.note || '—')}
              </p>
              <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">
                ${entry.field ? `Campo: <strong>${escapeHtml(entry.field)}</strong>` : ''}
                ${entry.oldValue && entry.newValue ? `• <span style="color: #ef4444;">${escapeHtml(entry.oldValue)}</span> → <span style="color: #10b981;">${escapeHtml(entry.newValue)}</span>` : ''}
              </p>
            </div>
            <span style="font-size: 11px; color: #9ca3af; white-space: nowrap;">${dateStr} ${timeStr}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
}

function generateAllReports() {
  generateDashboard();
  generatePeriodSummary();
  generateTopProductsReport();
  generateTopClientsReport();
  generateMarginsReport();
  generateLowStockReport();
  generatePriceListsReport();
  generateHistoryReport();
  showToast('Reportes generados', 'success');
}

function generateReports() {
  generateAllReports();
}

function exportReportsToCSV() {
  const invoices = getInvoicesInDateRange();
  const data = [];

  data.push(['Tipo de Reporte', 'Período', 'Fecha de Generación']);
  data.push(['Resumen de Ventas', `${formatDate(reportData.dateFrom)} al ${formatDate(reportData.dateTo)}`, getCurrentDateTime()]);
  data.push([]);

  data.push(['Producto', 'Cantidad', 'Ingresos', 'Costo', 'Margen']);
  const productStats = {};
  invoices.forEach(inv => {
    inv.items.forEach(item => {
      if (!productStats[item.id]) {
        productStats[item.id] = { name: item.name, qty: 0, revenue: 0, cost: 0, margin: 0 };
      }
      productStats[item.id].qty += item.qty;
      productStats[item.id].revenue += item.price * item.qty;
      const product = STATE.products.find(p => p.id === item.id);
      if (product) {
        productStats[item.id].cost += product.cost * item.qty;
        productStats[item.id].margin += (item.price - product.cost) * item.qty;
      }
    });
  });

  Object.values(productStats).forEach(p => {
    data.push([p.name, p.qty, p.revenue, p.cost, p.margin]);
  });

  const csv = data.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  downloadCSV(csv, `reportes-${formatDate(reportData.dateFrom)}.csv`);
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function downloadReportsAsExcel() {
  try {
    getReportDateRange();
    const wb = XLSX.utils.book_new();
    const invoices = getInvoicesInDateRange();

    const summary = [];
    const totalSales = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalOrders = invoices.length;
    const avgTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
    let totalMargin = 0;
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        const product = STATE.products.find(p => p.id === item.id);
        if (product) {
          const cost = product.cost * item.qty;
          const gain = (item.price * item.qty) - cost;
          totalMargin += gain;
        }
      });
    });

    summary.push(['RESUMEN DEL PERÍODO', '']);
    summary.push(['', '']);
    summary.push(['Período', `${formatDate(reportData.dateFrom)} al ${formatDate(reportData.dateTo)}`]);
    summary.push(['Total Ventas', totalSales]);
    summary.push(['Cantidad Pedidos', totalOrders]);
    summary.push(['Ticket Promedio', avgTicket.toFixed(2)]);
    summary.push(['Margen Total', totalMargin.toFixed(2)]);

    const ws1 = XLSX.utils.aoa_to_sheet(summary);
    ws1['!cols'] = [{wch: 25}, {wch: 20}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen');

    const productStats = {};
    invoices.forEach(inv => {
      inv.items.forEach(item => {
        if (!productStats[item.id]) {
          productStats[item.id] = { name: item.name, qty: 0, revenue: 0, cost: 0, margin: 0 };
        }
        productStats[item.id].qty += item.qty;
        productStats[item.id].revenue += item.price * item.qty;
        const product = STATE.products.find(p => p.id === item.id);
        if (product) {
          productStats[item.id].cost += product.cost * item.qty;
          productStats[item.id].margin += (item.price - product.cost) * item.qty;
        }
      });
    });

    const productsData = [['Producto', 'Cantidad', 'Ingresos', 'Costo', 'Margen']];
    Object.values(productStats).sort((a, b) => b.revenue - a.revenue).forEach(p => {
      productsData.push([p.name, p.qty, p.revenue.toFixed(2), p.cost.toFixed(2), p.margin.toFixed(2)]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(productsData);
    ws2['!cols'] = [{wch: 30}, {wch: 12}, {wch: 15}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Productos');

    const clientStats = {};
    invoices.forEach(inv => {
      if (!clientStats[inv.clientId]) {
        clientStats[inv.clientId] = { name: inv.client, orders: 0, total: 0, margin: 0 };
      }
      clientStats[inv.clientId].orders += 1;
      clientStats[inv.clientId].total += inv.total;
      let invMargin = 0;
      inv.items.forEach(item => {
        const product = STATE.products.find(p => p.id === item.id);
        if (product) {
          const cost = product.cost * item.qty;
          invMargin += (item.price * item.qty) - cost;
        }
      });
      clientStats[inv.clientId].margin += invMargin;
    });

    const clientsData = [['Cliente', 'Pedidos', 'Total Gastado', 'Promedio', 'Margen']];
    Object.values(clientStats).sort((a, b) => b.total - a.total).forEach(c => {
      clientsData.push([c.name, c.orders, c.total.toFixed(2), (c.total / c.orders).toFixed(2), c.margin.toFixed(2)]);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(clientsData);
    ws3['!cols'] = [{wch: 30}, {wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}];
    XLSX.utils.book_append_sheet(wb, ws3, 'Clientes');

    const filename = `reportes-${formatDate(reportData.dateFrom)}-${formatDate(reportData.dateTo)}.xlsx`;
    XLSX.writeFile(wb, filename);
    showToast('Reporte exportado a Excel', 'success');
  } catch (err) {
    showToast('Error al exportar Excel: ' + err.message, 'error');
  }
}

function downloadReportsAsPDF() {
  getReportDateRange();
  const element = document.getElementById('view-admin');
  const opt = {
    margin: 10,
    filename: `reportes-${formatDate(reportData.dateFrom)}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' }
  };

  html2pdf().set(opt).from(element).save();
  showToast('Reporte exportado a PDF', 'success');
}
