/* ============================================================
   BULK EDIT MANAGEMENT
   ============================================================ */

let _bulkEditChanges = {};
let _bulkCategoryFilter = 'all';

function initBulkEdit() {
  renderBulkCategoryFilters();
  renderBulkPriceTools();
  renderBulkEditTable();
  renderBulkListHeaders();
  updateBulkChangesCount();
}

function renderBulkCategoryFilters() {
  const container = document.getElementById('bulk-category-filters');
  if (!container) return;

  const categories = CONFIG.CATEGORIES.map(c => c.id);
  const buttons = categories.map(cat => {
    const label = CONFIG.CATEGORIES.find(c => c.id === cat)?.name || cat;
    return `<button type="button" onclick="filterBulkByCategory('${cat}')" class="category-filter-btn px-4 py-2 rounded-lg font-semibold text-sm transition-all ${_bulkCategoryFilter === cat ? 'active bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}" data-category="${cat}">
      ${escapeHtml(label)}
    </button>`;
  });

  container.innerHTML = buttons.join('');
}

function renderBulkPriceTools() {
  const container = document.getElementById('bulk-price-tools');
  if (!container) return;

  const activeLists = STATE.priceLists.filter(pl => pl.is_active);
  if (!activeLists.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div class="flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">Lista de precios</label>
        <select id="bulk-tool-list" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          ${activeLists.map(l => `<option value="${l.id}">${escapeHtml(l.name)} (${(l.factor * 100).toFixed(0)}%)</option>`).join('')}
        </select>
      </div>
      <div>
        <label class="block text-xs font-semibold text-gray-600 mb-1">% ajuste (ej: 10 o -5)</label>
        <input type="number" id="bulk-tool-percent" step="0.1" placeholder="0" class="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28">
      </div>
      <button onclick="applyBulkPriceAdjustment()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all">
        Aplicar a todos los visibles
      </button>
      <button onclick="applyBulkPriceAbsolute()" class="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-all">
        Copiar precio base a lista
      </button>
      <button onclick="clearBulkListOverrides()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold px-4 py-2 rounded-lg text-sm transition-all">
        Limpiar overrides de lista
      </button>
    </div>
  `;
}

function applyBulkPriceAdjustment() {
  const listId = parseInt(document.getElementById('bulk-tool-list')?.value);
  const percent = parseFloat(document.getElementById('bulk-tool-percent')?.value) || 0;
  if (!listId) return;

  const filteredProducts = _bulkCategoryFilter === 'all'
    ? STATE.products
    : STATE.products.filter(p => p.cat === _bulkCategoryFilter);

  filteredProducts.forEach(product => {
    if (!_bulkEditChanges[product.id]) _bulkEditChanges[product.id] = {};
    if (!_bulkEditChanges[product.id].priceOverrides) _bulkEditChanges[product.id].priceOverrides = {};

    const basePrice = getPriceForList(product, listId);
    const newPrice = roundPrice(basePrice * (1 + percent / 100));
    _bulkEditChanges[product.id].priceOverrides[listId] = newPrice;
  });

  updateBulkChangesCount();
  renderBulkEditTable();
  showToast(`Ajuste de ${percent >= 0 ? '+' : ''}${percent}% aplicado a ${filteredProducts.length} productos`, 'success');
}

function applyBulkPriceAbsolute() {
  const listId = parseInt(document.getElementById('bulk-tool-list')?.value);
  if (!listId) return;

  const list = STATE.priceLists.find(pl => pl.id === listId);
  if (!list) return;

  const filteredProducts = _bulkCategoryFilter === 'all'
    ? STATE.products
    : STATE.products.filter(p => p.cat === _bulkCategoryFilter);

  filteredProducts.forEach(product => {
    if (!_bulkEditChanges[product.id]) _bulkEditChanges[product.id] = {};
    if (!_bulkEditChanges[product.id].priceOverrides) _bulkEditChanges[product.id].priceOverrides = {};

    const newPrice = roundPrice(product.sale * list.factor);
    _bulkEditChanges[product.id].priceOverrides[listId] = newPrice;
  });

  updateBulkChangesCount();
  renderBulkEditTable();
  showToast(`Precio base × factor aplicado a ${filteredProducts.length} productos`, 'success');
}

function clearBulkListOverrides() {
  const listId = parseInt(document.getElementById('bulk-tool-list')?.value);
  if (!listId) return;

  const filteredProducts = _bulkCategoryFilter === 'all'
    ? STATE.products
    : STATE.products.filter(p => p.cat === _bulkCategoryFilter);

  filteredProducts.forEach(product => {
    if (_bulkEditChanges[product.id]?.priceOverrides) {
      delete _bulkEditChanges[product.id].priceOverrides[listId];
      if (!Object.keys(_bulkEditChanges[product.id].priceOverrides).length) {
        delete _bulkEditChanges[product.id].priceOverrides;
      }
      if (!Object.keys(_bulkEditChanges[product.id]).length) {
        delete _bulkEditChanges[product.id];
      }
    }
    const list = STATE.priceLists.find(pl => pl.id === listId);
    if (list && list.overrides && list.overrides[product.id] !== undefined) {
      if (!_bulkEditChanges[product.id]) _bulkEditChanges[product.id] = {};
      if (!_bulkEditChanges[product.id].priceOverrides) _bulkEditChanges[product.id].priceOverrides = {};
      _bulkEditChanges[product.id].priceOverrides[listId] = null;
    }
  });

  updateBulkChangesCount();
  renderBulkEditTable();
  showToast('Overrides limpiados. Guardá para confirmar.', 'info');
}

function renderBulkListHeaders() {
  const headerCell = document.getElementById('bulk-price-list-headers');
  if (!headerCell) return;

  const activeLists = STATE.priceLists.filter(pl => pl.is_active);
  if (!activeLists.length) {
    headerCell.textContent = '';
    return;
  }

  headerCell.style.textAlign = 'center';
  headerCell.style.padding = '12px';
  headerCell.style.fontWeight = '600';
  headerCell.innerHTML = activeLists.map(l =>
    `<span style="display:inline-block; min-width:90px; margin:0 4px; font-size:12px;">${escapeHtml(l.name)}</span>`
  ).join('');
}

function renderBulkEditTable() {
  const tbody = document.getElementById('bulk-edit-tbody');
  if (!tbody) return;

  const filteredProducts = _bulkCategoryFilter === 'all'
    ? STATE.products
    : STATE.products.filter(p => p.cat === _bulkCategoryFilter);

  const activeLists = STATE.priceLists.filter(pl => pl.is_active);

  tbody.innerHTML = filteredProducts.map(product => {
    const changes = _bulkEditChanges[product.id] || {};
    const currentStock = changes.stock !== undefined ? changes.stock : product.stock;
    const currentCost = changes.cost !== undefined ? changes.cost : product.cost;
    const currentSale = changes.sale !== undefined ? changes.sale : product.sale;
    const hasChanges = Object.keys(changes).length > 0;

    return `<tr data-product-id="${product.id}" style="border-bottom: 1px solid #e5e7eb; ${hasChanges ? 'background-color: #fef3c7;' : ''}">
      <td style="padding:8px 12px; text-align:center;">
        <img src="${product.img}" alt="${product.name}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
      </td>
      <td style="padding:8px 12px;">
        <div style="font-weight:bold; color:var(--color-ink);">${escapeHtml(product.name)}</div>
        <div style="font-size:11px; color:#666;">${escapeHtml(product.sku || '—')}</div>
      </td>
      <td style="padding:8px 12px; font-size:12px;">${escapeHtml(product.cat || '—')}</td>
      <td style="padding:8px 12px; text-align:center;">
        <input type="number" value="${currentStock}" onchange="handleBulkCellChange('${product.id}', 'stock', this.value)" class="w-full border border-gray-300 rounded px-2 py-1 text-center text-sm" style="max-width:80px;">
      </td>
      <td style="padding:8px 12px; text-align:right;">
        <input type="number" step="0.01" value="${roundPrice(currentCost)}" onchange="handleBulkCellChange('${product.id}', 'cost', this.value)" class="w-full border border-gray-300 rounded px-2 py-1 text-right text-sm" style="max-width:100px;">
      </td>
      <td style="padding:8px 12px; text-align:right;">
        <input type="number" step="0.01" value="${roundPrice(currentSale)}" onchange="handleBulkCellChange('${product.id}', 'sale', this.value)" class="w-full border border-gray-300 rounded px-2 py-1 text-right text-sm font-semibold" style="max-width:100px;">
      </td>
      <td style="padding:8px 12px;">
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
        ${activeLists.map(list => {
          const pendingOverride = changes.priceOverrides?.[list.id];
          const currentVal = pendingOverride !== undefined && pendingOverride !== null
            ? pendingOverride
            : getPriceForList(product, list.id);
          const isOverridden = (list.overrides && list.overrides[product.id] !== undefined) || pendingOverride !== undefined;
          return `<div style="min-width:90px;">
            <input type="number" step="0.01" value="${roundPrice(currentVal)}" onchange="handleBulkPriceOverride('${product.id}', ${list.id}, this.value)" class="w-full border ${isOverridden ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'} rounded px-2 py-1 text-right text-sm" style="max-width:100px;" title="${escapeHtml(list.name)}">
            <div style="font-size:10px; color:#888; margin-top:2px; text-align:center;">${escapeHtml(list.name)}</div>
          </div>`;
        }).join('')}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function handleBulkCellChange(productId, field, value) {
  if (!_bulkEditChanges[productId]) {
    _bulkEditChanges[productId] = {};
  }

  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  const parsedValue = field === 'stock' ? parseInt(value) : parseFloat(value);
  _bulkEditChanges[productId][field] = parsedValue;

  const row = document.querySelector(`tr[data-product-id="${productId}"]`);
  if (row) {
    row.style.backgroundColor = '#fef3c7';
  }

  updateBulkChangesCount();
}

function handleBulkPriceOverride(productId, listId, price) {
  if (!_bulkEditChanges[productId]) {
    _bulkEditChanges[productId] = {};
  }

  const parsedPrice = parseFloat(price);
  if (!_bulkEditChanges[productId].priceOverrides) {
    _bulkEditChanges[productId].priceOverrides = {};
  }

  _bulkEditChanges[productId].priceOverrides[listId] = parsedPrice;

  const row = document.querySelector(`tr[data-product-id="${productId}"]`);
  if (row) {
    row.style.backgroundColor = '#fef3c7';
  }

  updateBulkChangesCount();
}

function updateBulkChangesCount() {
  const count = Object.keys(_bulkEditChanges).length;
  const countEl = document.getElementById('bulk-changes-count');
  if (countEl) {
    countEl.textContent = count;
  }
}

function filterBulkByCategory(category) {
  _bulkCategoryFilter = category;

  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-indigo-600', 'text-white');
    btn.classList.add('bg-gray-100', 'text-gray-700');
  });

  const activeBtn = document.querySelector(`.category-filter-btn[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-gray-100', 'text-gray-700');
    activeBtn.classList.add('active', 'bg-indigo-600', 'text-white');
  }

  renderBulkEditTable();
}

function saveBulkChanges() {
  const changedCount = Object.keys(_bulkEditChanges).length;
  if (changedCount === 0) {
    showToast('No hay cambios para guardar', 'info');
    return;
  }

  for (const productId in _bulkEditChanges) {
    const changes = _bulkEditChanges[productId];
    const product = STATE.products.find(p => p.id === productId);
    if (!product) continue;

    const oldSale = product.sale;
    const oldStock = product.stock;

    if (changes.stock !== undefined) product.stock = changes.stock;
    if (changes.cost !== undefined) product.cost = changes.cost;
    if (changes.sale !== undefined) {
      product.sale = changes.sale;
      product.price = changes.sale;
    }

    if (changes.priceOverrides) {
      for (const listId in changes.priceOverrides) {
        const priceVal = changes.priceOverrides[listId];
        if (priceVal === null) {
          const list = STATE.priceLists.find(pl => pl.id === parseInt(listId));
          if (list && list.overrides) delete list.overrides[productId];
        } else {
          setPriceOverride(parseInt(listId), productId, priceVal);
        }
      }
    }

    if (typeof logChange === 'function') {
      const fields = [];
      if (changes.stock !== undefined && changes.stock !== oldStock) fields.push(`stock: ${oldStock}→${changes.stock}`);
      if (changes.sale !== undefined && changes.sale !== oldSale) fields.push(`precio: ${fmt(oldSale)}→${fmt(changes.sale)}`);
      if (changes.priceOverrides) {
        for (const listId in changes.priceOverrides) {
          const list = STATE.priceLists.find(pl => pl.id === parseInt(listId));
          if (list) fields.push(`${list.name}: ${fmt(changes.priceOverrides[listId])}`);
        }
      }
      if (fields.length) {
        logChange({
          type: 'bulk',
          productId: product.id,
          productName: product.name,
          field: fields.join(', '),
          oldValue: null,
          newValue: null,
          note: `Edición masiva: ${fields.join(', ')}`
        });
      }
    }
  }

  persistData();
  _bulkEditChanges = {};
  updateBulkChangesCount();
  renderBulkEditTable();
  showToast(`${changedCount} producto(s) actualizado(s)`, 'success');
}

function goBackFromBulkEdit() {
  if (Object.keys(_bulkEditChanges).length > 0) {
    showConfirmDialog('Tienes cambios sin guardar. ¿Descartar cambios y volver?', () => {
      _bulkEditChanges = {};
      window.location.href = '/admin/productos';
    });
  } else {
    window.location.href = '/admin/productos';
  }
}
