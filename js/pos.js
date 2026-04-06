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

// PRODUCT LIST
function renderPosProductList() {
  const searchInput = document.getElementById('admin-search-prod');
  const list = document.getElementById('admin-prod-list');

  if (!list) return;

  const query = searchInput?.value.toLowerCase() || '';
  const filtered = STATE.products.filter(p =>
    p.name.toLowerCase().includes(query) ||
    p.short.toLowerCase().includes(query)
  );

  list.innerHTML = filtered.map(p => `
    <div style="display: flex; align-items: center; justify-content: space-between; background: #f9fafb; padding: 8px; border-radius: 8px; border: 1px solid #e5e7eb; gap: 8px; margin-bottom: 8px;">
      <div style="flex: 1; min-width: 0;">
        <p style="margin: 0; font-weight: bold; font-size: 13px; color: var(--color-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.name)}</p>
        <p style="margin: 3px 0 0; font-size: 11px; color: #666;">Stock: ${p.stock} | ${fmt(p.sale)}</p>
      </div>
      <button onclick="addToAdminCart('${p.id}')" class="btn btn-primary btn-sm" style="${p.stock <= 0 ? 'opacity: 0.5; cursor: not-allowed;' : 'cursor: pointer;'}">
        + Añadir
      </button>
    </div>
  `).join('');
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

  // Save invoice
  const invoice = {
    id: generateId('inv'),
    date: getCurrentDateTime(),
    client: client.name,
    clientId: client.id,
    docType,
    items: deepClone(STATE.adminCart),
    total,
    itemsCount: STATE.adminCart.reduce((s, c) => s + c.qty, 0)
  };

  STATE.adminInvoices.unshift(invoice);

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
  const searchInput = document.getElementById('admin-search-prod');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(() => {
      renderPosProductList();
    }, 300));
  }
});
