/* ============================================================
   POS (PUNTO DE VENTA - CAJA REGISTRADORA)
   ============================================================ */

// CLIENT SELECT
function renderPosClientSelect() {
  const select = document.getElementById('admin-client-select');
  if (!select) return;

  select.innerHTML = STATE.clients.map(c =>
    `<option value="${c.id}">${escapeHtml(c.name)}${c.cuit ? ' - ' + c.cuit : ''}</option>`
  ).join('');
}

function renderPosCategoryFilters() {
  const container = document.getElementById('admin-pos-categories');
  if (!container) return;

  container.innerHTML = CONFIG.CATEGORIES.map(category => `
    <button
      type="button"
      class="pos-category-btn ${STATE.adminPosCategory === category.id ? 'active' : ''}"
      data-category="${category.id}"
      onclick="setPosCategory('${category.id}', this)"
    >
      ${escapeHtml(category.name)}
    </button>
  `).join('');
}

function setPosCategory(category, btn = null) {
  STATE.adminPosCategory = category;

  const container = document.getElementById('admin-pos-categories');
  if (container) {
    container.querySelectorAll('.pos-category-btn').forEach(button => {
      button.classList.toggle('active', button.dataset.category === category);
    });
  } else if (btn) {
    document.querySelectorAll('.pos-category-btn').forEach(button => button.classList.remove('active'));
    btn.classList.add('active');
  }

  renderPosProductList();
}

// PRODUCT LIST
function renderPosProductList() {
  const searchInput = document.getElementById('admin-search-prod');
  const list = document.getElementById('admin-prod-list');
  const noResults = document.getElementById('admin-pos-no-results');

  if (!list) return;

  const query = searchInput?.value.toLowerCase() || '';
  const activeCategory = STATE.adminPosCategory || 'all';

  const filtered = STATE.products.filter(p => {
    const productName = (p.name || '').toLowerCase();
    const productShort = (p.short || '').toLowerCase();
    const categoryMatches = activeCategory === 'all' || p.cat === activeCategory;
    const searchMatches = productName.includes(query) || productShort.includes(query);

    return categoryMatches && searchMatches;
  });

  renderPosCategoryFilters();

  list.innerHTML = filtered.map(p => `
    <div class="admin-pos-product-card">
      <div class="admin-pos-product-main">
        <img class="admin-pos-product-thumb" src="${escapeHtml(p.img || '')}" alt="${escapeHtml(p.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80'; this.onerror=null;">
        <div class="admin-pos-product-info">
          <p class="admin-pos-product-name">${escapeHtml(p.name)}</p>
          <p class="admin-pos-product-meta">Stock: ${p.stock} · ${fmt(p.sale)}</p>
        </div>
      </div>
      <button onclick="addToAdminCart('${p.id}')" class="btn btn-primary btn-sm admin-pos-add-btn" ${p.stock <= 0 ? 'disabled' : ''}>
        + Añadir
      </button>
    </div>
  `).join('');

  if (noResults) {
    noResults.classList.toggle('hidden', filtered.length > 0);
  }
}

// ADMIN CART
function addToAdminCart(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) {
    showToast('Producto sin stock', 'error');
    return;
  }

  const existing = STATE.adminCart.find(c => c.id === productId);
  if (existing) {
    if (existing.qty < product.stock) {
      existing.qty++;
    } else {
      showToast('Stock insuficiente', 'warning');
    }
  } else {
    STATE.adminCart.push({
      id: productId,
      name: product.name,
      price: product.sale,
      qty: 1,
      stock: product.stock
    });
  }

  renderPosCart();
}

function removeFromAdminCart(productId) {
  STATE.adminCart = STATE.adminCart.filter(c => c.id !== productId);
  renderPosCart();
}

function updateAdminCartQty(productId, qty) {
  qty = parseInt(qty) || 1;
  const item = STATE.adminCart.find(c => c.id === productId);
  if (!item) return;

  if (qty > item.stock) {
    qty = item.stock;
    showToast('Stock máximo: ' + item.stock, 'warning');
  }

  if (qty < 1) {
    removeFromAdminCart(productId);
  } else {
    item.qty = qty;
  }

  renderPosCart();
}

function renderPosCart() {
  const container = document.getElementById('admin-cart-items');
  const totalEl = document.getElementById('admin-cart-total');
  const itemsCountEl = document.getElementById('admin-items-count');

  if (!container || !totalEl) return;

  const total = STATE.adminCart.reduce((s, c) => s + c.price * c.qty, 0);
  const itemsCount = STATE.adminCart.reduce((s, c) => s + c.qty, 0);

  totalEl.textContent = fmt(total);

  if (itemsCountEl) {
    itemsCountEl.textContent = `${itemsCount} ${itemsCount === 1 ? 'artículo' : 'artículos'}`;
  }

  if (!STATE.adminCart.length) {
    container.innerHTML = '<div class="pos-ticket-empty">Ticket vacío</div>';
    return;
  }

  let html = '<div class="pos-ticket-item header" style="display: flex; justify-content: space-between; margin-bottom: 8px;">' +
    '<span>Producto</span>' +
    '<span>Total</span>' +
    '</div>';

  STATE.adminCart.forEach(c => {
    html += `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f0f0f0; gap: 8px;">
        <div style="flex: 1; min-width: 0;">
          <p style="margin: 0; font-weight: 600; font-size: 12px; color: var(--color-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</p>
          <p style="margin: 2px 0 0; font-size: 11px; color: #666;">${fmt(c.price)} × <input type="number" value="${c.qty}" min="1" max="${c.stock}" onchange="updateAdminCartQty('${c.id}', this.value)" style="width: 35px; padding: 2px; border: 1px solid #ddd; border-radius: 3px; text-align: center;"></p>
        </div>
        <div style="text-align: right; flex-shrink: 0;">
          <p style="margin: 0; font-weight: bold; font-size: 13px; color: var(--color-brand);">${fmt(c.price * c.qty)}</p>
          <button onclick="removeFromAdminCart('${c.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 11px; font-weight: bold; padding: 0; margin-top: 2px;">Quitar</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// DOCUMENT TYPE
function setDocumentType(type) {
  STATE.adminDocumentType = type;
  updateDocumentTypeUI();
}

function updateDocumentTypeUI() {
  document.querySelectorAll('[data-doctype]').forEach(el => {
    el.classList.toggle('checked', el.dataset.doctype === STATE.adminDocumentType);
  });
}

// PROCESS SALE
function procesarVenta(printPDF = false) {
  if (!STATE.adminCart.length) {
    showToast('El ticket está vacío', 'warning');
    return;
  }

  const clientSelect = document.getElementById('admin-client-select');
  const clientId = clientSelect?.value || 'c1';
  const client = STATE.clients.find(c => c.id === clientId) || STATE.clients[0];
  const docType = STATE.adminDocumentType;

  const total = STATE.adminCart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const orderId = generateId('ord');
  const invoiceId = generateId('inv');

  // Save invoice
  const invoice = {
    id: invoiceId,
    orderId,
    date: getCurrentDateTime(),
    client: client.name,
    clientId: client.id,
    docType,
    items: deepClone(STATE.adminCart),
    total,
    itemsCount: STATE.adminCart.reduce((s, c) => s + c.qty, 0)
  };

  STATE.adminInvoices.unshift(invoice);


  const order = {
    id: orderId,
    invoiceId,
    date: getCurrentDateTime(),
    client: client.name,
    address: client.address || '—',
    items: deepClone(STATE.adminCart),
    total,
    source: 'pos',
    status: 'completed'
  };

  STATE.adminOrders.unshift(order);

  // Deduct stock
  STATE.adminCart.forEach(item => {
    const product = STATE.products.find(p => p.id === item.id);
    if (product) {
      product.stock -= item.qty;
    }
  });

  persistData();

  // Print if requested
  if (printPDF) {
    generateInvoicePDF(client, docType, STATE.adminCart, total);
  }

  // Clear cart
  STATE.adminCart = [];
  renderPosCart();
  renderPosProductList();
  renderStockTable();

  const message = printPDF
    ? 'Venta procesada, impresa y stock actualizado'
    : 'Venta procesada y stock actualizado';
  showToast(message, 'success');
}

// SEARCH PRODUCTS IN POS
document.addEventListener('DOMContentLoaded', function() {
  renderPosCategoryFilters();

  const searchInput = document.getElementById('admin-search-prod');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      renderPosProductList();
    }, 300));
  }
});
