/* ============================================================
   STOCK MANAGEMENT MODULE
   ============================================================ */

let _stockFilterCategory = '';
let _stockSearchQuery = '';

function renderStockManageList() {
  const tbody = document.getElementById('stock-manage-tbody');
  if (!tbody) return;

  let products = STATE.products;

  if (_stockFilterCategory) {
    products = products.filter(p => p.cat === _stockFilterCategory);
  }

  if (_stockSearchQuery) {
    const query = normalizeText(_stockSearchQuery);
    products = products.filter(p =>
      normalizeText(p.name).includes(query) ||
      normalizeText(p.sku).includes(query)
    );
  }

  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const zeroStockCount = products.filter(p => p.stock === 0).length;

  document.getElementById('stock-total-products').textContent = totalProducts;
  document.getElementById('stock-total-units').textContent = totalUnits;
  document.getElementById('stock-low-count').textContent = lowStockCount;
  document.getElementById('stock-zero-count').textContent = zeroStockCount;

  tbody.innerHTML = products.map(product => {
    let statusColor = '#10b981';
    let statusText = 'Normal';

    if (product.stock === 0) {
      statusColor = '#ef4444';
      statusText = 'Sin Stock';
    } else if (product.stock <= 5) {
      statusColor = '#f59e0b';
      statusText = 'Bajo Stock';
    }

    return `<tr style="border-bottom: 1px solid #e5e7eb; hover: background-color: #f9fafb;">
      <td style="padding:12px; font-weight:500;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <img src="${product.img}" alt="${product.name}" style="width:32px; height:32px; object-fit:cover; border-radius:4px;">
          <div>
            <div style="font-weight:600; color:#1F2937;">${escapeHtml(product.name)}</div>
            <div style="font-size:11px; color:#6B7280;">SKU: ${escapeHtml(product.sku || 'N/A')}</div>
          </div>
        </div>
      </td>
      <td style="padding:12px; text-align:center; font-size:12px; color:#666;">${escapeHtml(product.cat || '—')}</td>
      <td style="padding:12px; text-align:right;">
        <span style="font-weight:bold; font-size:16px; color:#1F2937;">${product.stock}</span>
        <span style="color:#6B7280; font-size:12px;"> unidades</span>
      </td>
      <td style="padding:12px; text-align:center;">
        <span style="background-color: ${statusColor}22; color: ${statusColor}; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">
          ${statusText}
        </span>
      </td>
      <td style="padding:12px; text-align:right;">
        <button onclick="openStockAdjustModal('${product.id}')" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-xs transition-all">
          <i class="fas fa-edit mr-1"></i> Ajustar
        </button>
      </td>
    </tr>`;
  }).join('');
}

function populateStockCategoryFilter() {
  const select = document.getElementById('stock-category-filter');
  if (!select) return;

  select.innerHTML = '<option value="">Todas las categorías</option>' +
    CONFIG.CATEGORIES.filter(cat => cat.id !== 'all').map(cat => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`).join('');
}

function filterStockList() {
  const categorySelect = document.getElementById('stock-category-filter');
  const searchInput = document.getElementById('stock-search');

  _stockFilterCategory = categorySelect?.value || '';
  _stockSearchQuery = searchInput?.value || '';

  renderStockManageList();
}

function openStockAdjustModal(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  const idInput = document.getElementById('adjust-product-id');
  const nameEl = document.getElementById('adjust-product-name');
  const currentEl = document.getElementById('adjust-current-stock');
  const newInput = document.getElementById('adjust-new-stock');
  const reasonInput = document.getElementById('adjust-reason');

  if (idInput) idInput.value = productId;
  if (nameEl) nameEl.textContent = escapeHtml(product.name);
  if (currentEl) currentEl.textContent = product.stock;
  if (newInput) {
    newInput.value = product.stock;
    newInput.focus();
    newInput.select();
  }
  if (reasonInput) reasonInput.value = '';

  const modal = document.getElementById('stock-adjust-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeStockAdjustModal() {
  const modal = document.getElementById('stock-adjust-modal');
  if (modal) modal.classList.add('hidden');
}

function saveStockAdjustment() {
  const productId = document.getElementById('adjust-product-id').value;
  const newStock = parseInt(document.getElementById('adjust-new-stock').value);
  const reason = document.getElementById('adjust-reason').value.trim();

  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  if (isNaN(newStock) || newStock < 0) {
    showToast('Ingresa un stock válido', 'warning');
    return;
  }

  const oldStock = product.stock;
  const difference = newStock - oldStock;

  product.stock = newStock;
  product.lastStockChange = new Date().toISOString();

  if (typeof logChange === 'function') {
    logChange({
      type: 'stock',
      productId: product.id,
      productName: product.name,
      field: 'stock',
      oldValue: oldStock,
      newValue: newStock,
      note: reason || 'Ajuste de inventario'
    });
  }

  persistData();
  closeStockAdjustModal();
  renderStockManageList();

  const message = difference > 0
    ? `Stock aumentado en ${difference} unidad(es)`
    : `Stock reducido en ${Math.abs(difference)} unidad(es)`;

  showToast(`${product.name}: ${message}`, 'success');
}
