/* ============================================================
   HISTORY AND MOVEMENTS TRACKING
   ============================================================ */

let historyData = {
  dateFrom: null,
  dateTo: null,
  typeFilter: null,
  movements: []
};

function getHistoryDateRange() {
  const fromInput = document.getElementById('history-date-from');
  const toInput = document.getElementById('history-date-to');
  const typeFilter = document.getElementById('history-type-filter');

  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

  historyData.dateFrom = fromInput?.value ? new Date(fromInput.value) : thirtyDaysAgo;
  historyData.dateTo = toInput?.value ? new Date(toInput.value + 'T23:59:59') : today;
  historyData.typeFilter = typeFilter?.value || null;
}

const _historyTypeConfig = {
  factura:  { icon: 'fa-receipt',        color: 'blue',   label: 'FACTURA' },
  stock:    { icon: 'fa-boxes-stacked',  color: 'green',  label: 'STOCK' },
  precio:   { icon: 'fa-tag',            color: 'amber',  label: 'PRECIO' },
  producto: { icon: 'fa-edit',           color: 'purple', label: 'PRODUCTO' },
  bulk:     { icon: 'fa-table',          color: 'indigo', label: 'MASIVO' },
  unknown:  { icon: 'fa-circle',         color: 'gray',   label: 'OTRO' },
};

function getAllMovements() {
  const movements = [];

  // Facturas
  if (!historyData.typeFilter || historyData.typeFilter === 'factura') {
    STATE.adminInvoices.forEach(inv => {
      const invDate = new Date(inv.date);
      if (invDate >= historyData.dateFrom && invDate <= historyData.dateTo) {
        movements.push({
          date: inv.date,
          type: 'factura',
          title: `Factura #${inv.invoiceNumber || inv.id}`,
          description: `Cliente: ${inv.client}`,
          amount: fmt(inv.total),
          details: `${(inv.items || []).length} producto(s)`,
          oldValue: null,
          newValue: null,
          note: null
        });
      }
    });
  }

  // changeLog entries
  const logEntries = STATE.changeLog || [];
  logEntries.forEach(entry => {
    const entryDate = new Date(entry.date);
    if (entryDate < historyData.dateFrom || entryDate > historyData.dateTo) return;
    if (historyData.typeFilter && entry.type !== historyData.typeFilter) return;

    const cfg = _historyTypeConfig[entry.type] || _historyTypeConfig.unknown;
    movements.push({
      date: entry.date,
      type: entry.type,
      title: entry.productName
        ? `${cfg.label}: ${entry.productName}`
        : `${cfg.label}`,
      description: entry.note || (entry.field ? `Campo: ${entry.field}` : ''),
      amount: entry.newValue ? `→ ${entry.newValue}` : '',
      details: entry.oldValue ? `Anterior: ${entry.oldValue}` : '',
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      note: entry.note
    });
  });

  historyData.movements = movements.sort((a, b) => new Date(b.date) - new Date(a.date));
  return historyData.movements;
}

function generateHistoryReport() {
  getHistoryDateRange();
  const movements = getAllMovements();

  const invoiceCount = movements.filter(m => m.type === 'factura').length;
  const priceChanges = movements.filter(m => m.type === 'precio').length;
  const productChanges = movements.filter(m => m.type === 'producto' || m.type === 'bulk').length;
  const stockChanges = movements.filter(m => m.type === 'stock').length;

  const inv = document.getElementById('history-total-invoices');
  const pc = document.getElementById('history-price-changes');
  const pd = document.getElementById('history-product-changes');
  const sc = document.getElementById('history-stock-changes');

  if (inv) inv.textContent = invoiceCount;
  if (pc) pc.textContent = priceChanges;
  if (pd) pd.textContent = productChanges;
  if (sc) sc.textContent = stockChanges;

  renderHistoryTimeline(movements);
  renderHistoryTable(movements);
}

const _colorBg = { blue: '#DBEAFE', green: '#DCFCE7', amber: '#FEF3C7', purple: '#F3E8FF', indigo: '#E0E7FF', gray: '#F3F4F6' };
const _colorText = { blue: '#1E40AF', green: '#166534', amber: '#92400E', purple: '#6B21A8', indigo: '#3730A3', gray: '#374151' };
const _colorDot = { blue: '#3B82F6', green: '#10B981', amber: '#F59E0B', purple: '#8B5CF6', indigo: '#6366F1', gray: '#9CA3AF' };

function renderHistoryTimeline(movements) {
  const timeline = document.getElementById('history-timeline');
  if (!timeline) return;

  if (movements.length === 0) {
    timeline.innerHTML = '<div class="text-center text-gray-400 py-8">No hay movimientos en este período</div>';
    return;
  }

  const grouped = {};
  movements.forEach(m => {
    const date = formatDate(new Date(m.date));
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  const cfg = (type) => _historyTypeConfig[type] || _historyTypeConfig.unknown;

  timeline.innerHTML = Object.entries(grouped).map(([date, items]) => `
    <div>
      <div class="text-sm font-bold text-gray-700 mb-3">${date}</div>
      <div class="space-y-2 ml-4 border-l-2 border-gray-200 pl-4">
        ${items.map(m => {
          const c = cfg(m.type);
          return `
          <div class="flex gap-3 pb-4 border-b border-gray-100 last:border-b-0">
            <div class="flex-shrink-0 mt-1">
              <div style="background-color: ${_colorDot[c.color] || '#9CA3AF'}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${c.icon}" style="color: white; font-size: 14px;"></i>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-gray-800">${escapeHtml(m.title)}</p>
              <p class="text-sm text-gray-600">${escapeHtml(m.description)}</p>
              ${m.oldValue || m.newValue ? `<p class="text-xs mt-1" style="color:#666;">
                ${m.oldValue ? `<span style="color:#ef4444;">◀ ${escapeHtml(m.oldValue)}</span>` : ''}
                ${m.oldValue && m.newValue ? ' → ' : ''}
                ${m.newValue ? `<span style="color:#10b981;">${escapeHtml(m.newValue)} ▶</span>` : ''}
              </p>` : ''}
              <p class="text-xs text-gray-400 mt-1">${escapeHtml(m.details)} ${m.amount ? '• ' + escapeHtml(m.amount) : ''}</p>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  `).join('');
}

function renderHistoryTable(movements) {
  const tbody = document.getElementById('history-table-tbody');
  if (!tbody) return;

  if (movements.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px; color:#999;">No hay movimientos</td></tr>';
    return;
  }

  const cfg = (type) => _historyTypeConfig[type] || _historyTypeConfig.unknown;

  tbody.innerHTML = movements.map(m => {
    const c = cfg(m.type);
    return `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding:10px 12px; font-size:12px; color:#666; white-space:nowrap;">${new Date(m.date).toLocaleString('es-AR')}</td>
      <td style="padding:10px 12px;">
        <span style="background: ${_colorBg[c.color] || '#F3F4F6'}; color: ${_colorText[c.color] || '#374151'}; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
          <i class="fas ${c.icon} mr-1"></i>${c.label}
        </span>
      </td>
      <td style="padding:10px 12px; font-weight:500; font-size:13px;">${escapeHtml(m.title)}</td>
      <td style="padding:10px 12px; font-size:12px; color:#666;">${escapeHtml(m.description)}</td>
      <td style="padding:10px 12px; font-size:12px; color:#ef4444;">${m.oldValue ? escapeHtml(m.oldValue) : '—'}</td>
      <td style="padding:10px 12px; font-size:12px; color:#10b981; font-weight:600;">${m.newValue ? escapeHtml(m.newValue) : (m.amount || '—')}</td>
    </tr>`;
  }).join('');
}
