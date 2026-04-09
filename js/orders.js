/* ============================================================
   ORDERS MANAGEMENT WITH FILTERS
   ============================================================ */

let ordersFilter = {
  source: 'all',
  status: 'all',
  dateFrom: null,
  dateTo: null
};

function getFilteredOrders() {
  let filtered = STATE.adminOrders;

  // Filter by source
  if (ordersFilter.source !== 'all') {
    filtered = filtered.filter(o => o.source === ordersFilter.source);
  }

  // Filter by status
  if (ordersFilter.status !== 'all') {
    filtered = filtered.filter(o => o.status === ordersFilter.status);
  }

  // Filter by date range
  if (ordersFilter.dateFrom || ordersFilter.dateTo) {
    filtered = filtered.filter(o => {
      const orderDate = new Date(o.date.split(' ')[0]);
      if (ordersFilter.dateFrom) {
        const from = new Date(ordersFilter.dateFrom);
        if (orderDate < from) return false;
      }
      if (ordersFilter.dateTo) {
        const to = new Date(ordersFilter.dateTo);
        if (orderDate > to) return false;
      }
      return true;
    });
  }

  return filtered;
}

function setOrdersFilter(type, value) {
  ordersFilter[type] = value;
  renderOrdersTable();
}

function clearOrdersFilters() {
  ordersFilter = {
    source: 'all',
    status: 'all',
    dateFrom: null,
    dateTo: null
  };

  const sourceSelect = document.getElementById('orders-filter-source');
  const statusSelect = document.getElementById('orders-filter-status');
  const dateFromInput = document.getElementById('orders-filter-date-from');
  const dateToInput = document.getElementById('orders-filter-date-to');

  if (sourceSelect) sourceSelect.value = 'all';
  if (statusSelect) statusSelect.value = 'all';
  if (dateFromInput) dateFromInput.value = '';
  if (dateToInput) dateToInput.value = '';

  renderOrdersTable();
  showToast('Filtros borrados', 'info');
}

function renderOrdersTableFiltered() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  const filtered = getFilteredOrders();

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: #999; font-weight: bold;">No hay pedidos con los filtros seleccionados</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(o => {
    const isWeb = o.source === 'web';
    const statusColor = o.status === 'pending'
      ? 'background: #fef3c7; color: #92400e;'
      : 'background: #d1fae5; color: #065f46;';

    return `
    <tr data-order-id="${o.id}">
      <td style="font-size: 12px; color: #666;">${o.date}</td>
      <td style="font-weight: bold; color: var(--color-ink);">${escapeHtml(o.client)}</td>
      <td>${o.address}</td>
      <td style="font-weight: bold; color: var(--color-brand);">${fmt(o.total)}</td>
      <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; ${isWeb ? 'background: #dbeafe; color: #1e40af;' : 'background: #f3e8ff; color: #6b21a8;'}">${isWeb ? 'Web' : 'POS'}</span></td>
      <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; ${statusColor}">${o.status === 'pending' ? 'Pendiente' : 'Completado'}</span></td>
      <td style="text-align: right;">
        <button onclick="viewOrderDetail('${o.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline;">Ver</button>
        ${o.status === 'pending' ? `<button onclick="markOrderCompleted('${o.id}')" style="background: none; border: none; color: #10b981; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline; margin-left: 8px;">Completar</button>` : ''}
      </td>
    </tr>
    `;
  }).join('');
}

// Override renderOrdersTable to use filtered version
const originalRenderOrdersTable = renderOrdersTable;
function renderOrdersTable() {
  renderOrdersTableFiltered();
}
