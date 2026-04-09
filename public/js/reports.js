/* ============================================================
   REPORTS MODULE
   ============================================================ */

let reportData = {
  dateFrom: null,
  dateTo: null
};

function getReportDateRange() {
  const fromInput = document.getElementById('reports-date-from');
  const toInput = document.getElementById('reports-date-to');

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

  reportData.dateFrom = fromInput?.value ? new Date(fromInput.value) : thirtyDaysAgo;
  reportData.dateTo = toInput?.value ? new Date(toInput.value) : today;
}

function getInvoicesInDateRange() {
  getReportDateRange();
  return STATE.adminInvoices.filter(inv => {
    const invDate = new Date(inv.date);
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

  const summaryContainer = document.getElementById('reports-summary');
  if (!summaryContainer) return;

  summaryContainer.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 20px; border-radius: 12px;">
        <p style="margin: 0; font-size: 12px; opacity: 0.9; font-weight: 600;">Total Ventas</p>
        <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800;">${fmt(totalSales)}</p>
      </div>
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; border-radius: 12px;">
        <p style="margin: 0; font-size: 12px; opacity: 0.9; font-weight: 600;">Cantidad Pedidos</p>
        <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800;">${totalOrders}</p>
      </div>
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; border-radius: 12px;">
        <p style="margin: 0; font-size: 12px; opacity: 0.9; font-weight: 600;">Ticket Promedio</p>
        <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800;">${fmt(avgTicket)}</p>
      </div>
      <div style="background: linear-gradient(135deg, #ec4899 0%, #be185d 100%); color: white; padding: 20px; border-radius: 12px;">
        <p style="margin: 0; font-size: 12px; opacity: 0.9; font-weight: 600;">Margen Total</p>
        <p style="margin: 8px 0 0; font-size: 28px; font-weight: 800;">${fmt(totalMargin)}</p>
      </div>
    </div>
  `;
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

function generateAllReports() {
  generatePeriodSummary();
  generateTopProductsReport();
  generateTopClientsReport();
  generateMarginsReport();
  showToast('Reportes generados', 'success');
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
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
