/* ============================================================
   ORDERS MANAGEMENT WITH FILTERS
   ============================================================ */

let ordersFilter = {
  source: 'all',
  status: 'all',
  dateFrom: null,
  dateTo: null,
  datePreset: 'all'
};

let ordersSortState = {
  field: 'date',
  direction: 'desc'
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

  // Filter by date preset or range
  const today = new Date();
  const todayStr = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.getFullYear() + '-' + String(yesterday.getMonth() + 1).padStart(2, '0') + '-' + String(yesterday.getDate()).padStart(2, '0');

  const dayBeforeYesterday = new Date(today);
  dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
  const dayBeforeYesterdayStr = dayBeforeYesterday.getFullYear() + '-' + String(dayBeforeYesterday.getMonth() + 1).padStart(2, '0') + '-' + String(dayBeforeYesterday.getDate()).padStart(2, '0');

  if (ordersFilter.datePreset !== 'all') {
    filtered = filtered.filter(o => {
      const orderDateStr = parseDateToYMD(o.date);

      if (ordersFilter.datePreset === 'today') {
        return orderDateStr === todayStr;
      } else if (ordersFilter.datePreset === 'yesterday') {
        return orderDateStr === yesterdayStr;
      } else if (ordersFilter.datePreset === 'day_before_yesterday') {
        return orderDateStr === dayBeforeYesterdayStr;
      }
      return true;
    });
  } else if (ordersFilter.dateFrom || ordersFilter.dateTo) {
    // Filter by custom date range
    filtered = filtered.filter(o => {
      const orderDateStr = parseDateToYMD(o.date);
      if (ordersFilter.dateFrom) {
        if (orderDateStr < ordersFilter.dateFrom) return false;
      }
      if (ordersFilter.dateTo) {
        if (orderDateStr > ordersFilter.dateTo) return false;
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

  let filtered = getFilteredOrders();

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: #999; font-weight: bold;">No hay pedidos con los filtros seleccionados</td></tr>';
    return;
  }

  // Aplicar ordenamiento
  filtered.sort((a, b) => {
    let aVal = a[ordersSortState.field];
    let bVal = b[ordersSortState.field];

    // Convertir a minúsculas para comparación alfabética
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    // Manejo de valores vacíos
    if (!aVal) aVal = '';
    if (!bVal) bVal = '';

    if (aVal < bVal) return ordersSortState.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return ordersSortState.direction === 'asc' ? 1 : -1;
    return 0;
  });

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
        <button onclick="downloadOrderInvoice('${o.id}')" style="background: none; border: none; color: #7c3aed; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline; margin-left: 8px;">${isWeb ? 'Descargar presupuesto' : 'Descargar factura'}</button>
        ${o.status === 'pending' ? `<button onclick="markOrderCompleted('${o.id}')" style="background: none; border: none; color: #10b981; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline; margin-left: 8px;">Completar</button>` : ''}
      </td>
    </tr>
    `;
  }).join('');

  updateOrdersSortArrow();
}

// Override renderOrdersTable to use filtered version
const originalRenderOrdersTable = renderOrdersTable;
function renderOrdersTable() {
  renderOrdersTableFiltered();
}

function filterOrdersByDate(preset) {
  // Limpiar filtros de rango si es un preset
  if (preset !== 'range') {
    ordersFilter.datePreset = preset;
    ordersFilter.dateFrom = null;
    ordersFilter.dateTo = null;

    // Actualizar estado de botones
    document.getElementById('filter-today')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
    document.getElementById('filter-yesterday')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
    document.getElementById('filter-day-before-yesterday')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
    document.getElementById('filter-all')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');

    // Marcar el botón activo
    const buttonId = `filter-${preset}`;
    const btn = document.getElementById(buttonId);
    if (btn) {
      btn.classList.add('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
    }

    // Limpiar inputs de rango
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');
    if (dateFromInput) dateFromInput.value = '';
    if (dateToInput) dateToInput.value = '';
  } else {
    // Modo rango personalizado
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput = document.getElementById('filter-date-to');

    if (dateFromInput?.value || dateToInput?.value) {
      ordersFilter.datePreset = 'all';
      ordersFilter.dateFrom = dateFromInput?.value || null;
      ordersFilter.dateTo = dateToInput?.value || null;

      // Limpiar estados de botones
      document.getElementById('filter-today')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
      document.getElementById('filter-yesterday')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
      document.getElementById('filter-day-before-yesterday')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
      document.getElementById('filter-all')?.classList.remove('border-indigo-500', 'bg-indigo-50', 'text-indigo-600');
    }
  }

  renderOrdersTable();
}

function sortOrdersBy(field) {
  // Si se hace clic en el mismo campo, cambiar la dirección
  if (ordersSortState.field === field) {
    ordersSortState.direction = ordersSortState.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // Si se hace clic en un campo diferente, establecer el campo y dirección ascendente
    ordersSortState.field = field;
    ordersSortState.direction = 'asc';
  }

  renderOrdersTable();
}

function updateOrdersSortArrow() {
  const arrowEl = document.getElementById('sort-orders-name-arrow');
  if (!arrowEl) return;

  if (ordersSortState.field === 'client') {
    arrowEl.textContent = ordersSortState.direction === 'asc' ? '↑' : '↓';
    arrowEl.style.color = '#4f46e5';
  } else {
    arrowEl.textContent = '⇅';
    arrowEl.style.color = '#9ca3af';
  }
}
