/* ============================================================
   POS (PUNTO DE VENTA - CAJA REGISTRADORA)
   ============================================================ */

// CLIENT COMBOBOX
let clientComboboxState = {
  highlightedIndex: -1,
  filteredClients: [],
  isOpen: false
};

const POS_UNDO_HISTORY_KEY = 'posUndoHistory';
const POS_UNDO_MAX_ENTRIES = 10;
const POS_UNDO_DEFAULT_WINDOW_MS = 5 * 60 * 1000;
let posUndoHistory = [];

function getPosUndoWindowMs() {
  const configuredWindow = Number(CONFIG?.POS_UNDO_WINDOW_MS);
  if (Number.isFinite(configuredWindow) && configuredWindow > 0) {
    return configuredWindow;
  }
  return POS_UNDO_DEFAULT_WINDOW_MS;
}

function persistPosUndoHistory() {
  try {
    localStorage.setItem(POS_UNDO_HISTORY_KEY, JSON.stringify(posUndoHistory));
  } catch (err) {
    console.warn('No se pudo persistir historial de deshacer POS:', err);
  }
}

function loadPosUndoHistory() {
  try {
    const raw = localStorage.getItem(POS_UNDO_HISTORY_KEY);
    if (!raw) {
      posUndoHistory = [];
      return;
    }
    const parsed = JSON.parse(raw);
    posUndoHistory = Array.isArray(parsed) ? parsed : [];
    purgeExpiredUndoHistory();
  } catch (err) {
    console.warn('No se pudo cargar historial de deshacer POS:', err);
    posUndoHistory = [];
  }
}

function purgeExpiredUndoHistory() {
  const now = Date.now();
  const windowMs = getPosUndoWindowMs();
  posUndoHistory = posUndoHistory.filter(entry => {
    if (!entry || typeof entry !== 'object') return false;
    if (!Array.isArray(entry.cart) || !entry.clientId) return false;
    if (!Number.isFinite(entry.timestamp)) return false;
    return now - entry.timestamp <= windowMs;
  });
  persistPosUndoHistory();
}

function savePosUndoSnapshot() {
  if (!STATE.adminCart.length) return;
  const snapshot = {
    clientId: STATE.adminSelectedClient || 'c1',
    cart: deepClone(STATE.adminCart),
    timestamp: Date.now(),
    consumed: false
  };

  posUndoHistory.push(snapshot);
  if (posUndoHistory.length > POS_UNDO_MAX_ENTRIES) {
    posUndoHistory = posUndoHistory.slice(-POS_UNDO_MAX_ENTRIES);
  }
  purgeExpiredUndoHistory();
}

function getImmediateUndoCandidate(clientId) {
  purgeExpiredUndoHistory();
  const latest = posUndoHistory[posUndoHistory.length - 1];
  if (!latest) return null;
  if (latest.consumed) return null;
  if (latest.clientId !== clientId) return null;
  return latest;
}

function focusLastCartItemQty() {
  if (!STATE.adminCart.length) return;
  const lastItem = STATE.adminCart[STATE.adminCart.length - 1];
  if (!lastItem) return;
  setTimeout(() => {
    const qtyInput = document.getElementById(`admin-qty-${lastItem.id}`);
    if (!qtyInput) return;
    qtyInput.focus();
    qtyInput.select();
  }, 0);
}

function showUndoAppliedFeedback() {
  const container = document.getElementById('admin-cart-items');
  if (container) {
    container.style.transition = 'box-shadow 0.25s ease';
    container.style.boxShadow = '0 0 0 2px #10b981 inset';
    setTimeout(() => {
      container.style.boxShadow = '';
    }, 900);
  }
  showToast('Deshacer aplicado: se recuperó el último pedido del cliente', 'success');
}

function undoLastPosOrder() {
  const clientId = STATE.adminSelectedClient || 'c1';
  const undoCandidate = getImmediateUndoCandidate(clientId);
  if (!undoCandidate) {
    showToast('No hay un pedido inmediato para deshacer para este cliente', 'warning');
    return;
  }

  // 1) Cancelar ticket actual
  STATE.adminCart = [];
  // 2) Recuperar último pedido inmediato del cliente seleccionado
  STATE.adminCart = deepClone(undoCandidate.cart);
  undoCandidate.consumed = true;
  undoCandidate.appliedAt = Date.now();
  persistPosUndoHistory();

  // 3 + 4) Rehidratar carrito y re-render
  renderPosCart();
  renderPosProductList();
  focusLastCartItemQty();
  showUndoAppliedFeedback();
}

function renderPosClientCombobox() {
  const input = document.getElementById('admin-client-input');
  if (!input) return;

  // Initialize with first client (Consumidor Final)
  if (!STATE.adminSelectedClient && STATE.clients.length > 0) {
    STATE.adminSelectedClient = STATE.clients[0].id;
  }

  const selectedClient = STATE.clients.find(c => c.id === STATE.adminSelectedClient);
  if (selectedClient) {
    input.value = selectedClient.name;
  }

  filterAndRenderClientList('');
}

function filterAndRenderClientList(query = '') {
  const list = document.getElementById('admin-client-list');
  if (!list) return;

  const normalized = normalizeText(query);
  clientComboboxState.filteredClients = STATE.clients.filter(client => {
    if (!normalized) return true;
    return [client.name, client.cuit, client.phone, client.client_code]
      .filter(Boolean)
      .some(value => normalizeText(value).includes(normalized));
  });

  clientComboboxState.highlightedIndex = -1;

  if (clientComboboxState.filteredClients.length === 0) {
    list.innerHTML = '<li style="padding: 8px 12px; color: #999; font-size: 12px;">No se encontraron clientes</li>';
    list.classList.remove('hidden');
    return;
  }

  list.innerHTML = clientComboboxState.filteredClients.map((client, index) => {
    const isSelected = client.id === STATE.adminSelectedClient;
    return `
      <li
        data-client-id="${client.id}"
        data-index="${index}"
        style="
          padding: 10px 12px;
          cursor: pointer;
          background-color: ${isSelected ? '#e0e7ff' : 'transparent'};
          border-left: 3px solid ${isSelected ? '#3b82f6' : 'transparent'};
          font-size: 12px;
          user-select: none;
        "
        onclick="selectClient('${client.id}')"
        onmouseover="this.style.backgroundColor='#f3f4f6'; this.style.borderLeft='3px solid #d1d5db';"
        onmouseout="this.style.backgroundColor='${isSelected ? '#e0e7ff' : 'transparent'}'; this.style.borderLeft='3px solid ${isSelected ? '#3b82f6' : 'transparent'}';"
      >
        <div style="font-weight: 600; color: var(--color-ink);">${escapeHtml(client.name)}</div>
        <div style="font-size: 11px; color: #666; margin-top: 2px;">
          ${client.cuit ? '📋 ' + client.cuit + ' · ' : ''}${client.phone ? '📞 ' + client.phone : ''}
        </div>
      </li>
    `;
  }).join('');

  list.classList.remove('hidden');
  clientComboboxState.isOpen = true;
}

function handleClientInputChange(event) {
  const query = event.target.value;
  filterAndRenderClientList(query);
}

function handleClientKeydown(event) {
  const { key } = event;
  const list = document.getElementById('admin-client-list');
  const maxIndex = clientComboboxState.filteredClients.length - 1;

  if (key === 'ArrowDown') {
    event.preventDefault();
    clientComboboxState.highlightedIndex = Math.min(clientComboboxState.highlightedIndex + 1, maxIndex);
    updateClientListHighlight();
  } else if (key === 'ArrowUp') {
    event.preventDefault();
    clientComboboxState.highlightedIndex = Math.max(clientComboboxState.highlightedIndex - 1, -1);
    updateClientListHighlight();
  } else if (key === 'Enter') {
    event.preventDefault();
    if (clientComboboxState.highlightedIndex >= 0) {
      const client = clientComboboxState.filteredClients[clientComboboxState.highlightedIndex];
      selectClient(client.id);
    }
  } else if (key === 'Escape') {
    list.classList.add('hidden');
    clientComboboxState.isOpen = false;
  }
}

function updateClientListHighlight() {
  const items = document.querySelectorAll('#admin-client-list li[data-index]');
  items.forEach((item, index) => {
    if (index === clientComboboxState.highlightedIndex) {
      item.style.backgroundColor = '#dbeafe';
      item.style.borderLeft = '3px solid #3b82f6';
      item.scrollIntoView({ block: 'nearest' });
    } else {
      const client = clientComboboxState.filteredClients[index];
      const isSelected = client.id === STATE.adminSelectedClient;
      item.style.backgroundColor = isSelected ? '#e0e7ff' : 'transparent';
      item.style.borderLeft = isSelected ? '3px solid #3b82f6' : 'transparent';
    }
  });
}

function selectClient(clientId) {
  STATE.adminSelectedClient = clientId;
  const client = STATE.clients.find(c => c.id === clientId);
  if (client) {
    const input = document.getElementById('admin-client-input');
    const list = document.getElementById('admin-client-list');
    if (input) input.value = client.name;
    if (list) list.classList.add('hidden');
    clientComboboxState.isOpen = false;
  }
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
  STATE.posSearchActiveIndex = -1;

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
function getFilteredPosProducts() {
  const searchInput = document.getElementById('admin-search-prod');
  const query = searchInput?.value.toLowerCase() || '';
  const activeCategory = STATE.adminPosCategory || 'all';

  return STATE.products.filter(p => {
    const productName = (p.name || '').toLowerCase();
    const productShort = (p.short || '').toLowerCase();
    const productSku = (p.sku || '').toLowerCase();
    const productId = (p.id || '').toLowerCase();
    const categoryMatches = activeCategory === 'all' || p.cat === activeCategory;
    const searchMatches = productName.includes(query) || productShort.includes(query) || productSku.includes(query) || productId.includes(query);

    return categoryMatches && searchMatches;
  });
}

function renderPosProductList() {
  const list = document.getElementById('admin-prod-list');
  const noResults = document.getElementById('admin-pos-no-results');

  if (!list) return;

  const filtered = getFilteredPosProducts();
  const lastIndex = filtered.length - 1;
  if (lastIndex < 0) {
    STATE.posSearchActiveIndex = -1;
  } else if (STATE.posSearchActiveIndex > lastIndex) {
    STATE.posSearchActiveIndex = lastIndex;
  }

  renderPosCategoryFilters();

  list.innerHTML = filtered.map((p, index) => `
    <div
      class="admin-pos-product-card ${index === STATE.posSearchActiveIndex ? 'search-active' : ''} cursor-pointer hover:shadow-md transition-all"
      onclick="addToAdminCart('${p.id}', { focusQtyInput: true })"
      style="display: flex; flex-direction: column; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; gap: 8px; ${p.stock <= 0 ? 'opacity: 0.6; cursor: not-allowed;' : ''}"
    >
      <img
        class="admin-pos-product-thumb"
        src="${escapeHtml(p.img || '')}"
        alt="${escapeHtml(p.name)}"
        loading="lazy"
        style="width: 100%; aspect-ratio: 1 / 1; object-fit: contain; border-radius: 6px; background: #f9fafb;"
        onerror="this.src='https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80'; this.onerror=null;"
      >
      <div class="admin-pos-product-info" style="flex: 1;">
        <p class="admin-pos-product-name" style="margin: 0; font-weight: 600; font-size: 14px; color: #1f2937; line-height: 1.3;">${escapeHtml(p.name)}</p>
        <p class="admin-pos-product-meta" style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">SKU: ${escapeHtml(p.sku || '') || '—'}</p>
        <p style="margin: 2px 0 0; font-size: 12px; color: #6b7280;">Stock: ${p.stock}</p>
      </div>
      <div style="padding-top: 8px; border-top: 1px solid #f3f4f6;">
        <span style="font-weight: bold; font-size: 16px; color: #f59e0b;">${fmt(p.sale)}</span>
      </div>
    </div>
  `).join('');

  if (noResults) {
    noResults.classList.toggle('hidden', filtered.length > 0);
  }
}

function handlePosSearchKeydown(event) {
  const { key } = event;
  if (!['ArrowDown', 'ArrowUp'].includes(key)) return;

  const filtered = getFilteredPosProducts();
  if (!filtered.length) return;

  event.preventDefault();
  const lastIndex = filtered.length - 1;
  if (key === 'ArrowDown') {
    STATE.posSearchActiveIndex = Math.min(STATE.posSearchActiveIndex + 1, lastIndex);
  } else {
    STATE.posSearchActiveIndex = Math.max(STATE.posSearchActiveIndex - 1, 0);
  }

  renderPosProductList();
}

// ADMIN CART
function addToAdminCart(productId, options = {}) {
  const { focusQtyInput = true } = options;
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

  if (focusQtyInput) {
    // Focus and select the quantity input for the new/updated item
    setTimeout(() => {
      const qtyInput = document.getElementById(`admin-qty-${productId}`);
      if (qtyInput) {
        qtyInput.focus();
        qtyInput.select();
      }
    }, 0);
  }
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

function handleQuantityKeypress(event, productId) {
  if (event.key === 'Escape') {
    document.getElementById(`admin-qty-${productId}`).blur();
  }
}

function isPosBillingViewActive() {
  return Boolean(document.getElementById('admin-search-prod'));
}

function isTextEditingTarget(target) {
  if (!target) return false;
  const tagName = (target.tagName || '').toLowerCase();
  const isTextInput = tagName === 'input' || tagName === 'textarea' || tagName === 'select';
  return isTextInput || target.isContentEditable;
}

function getActivePosProduct() {
  const filtered = getFilteredPosProducts();
  if (!filtered.length || STATE.posSearchActiveIndex < 0) return null;
  return filtered[STATE.posSearchActiveIndex] || null;
}

function isPosShortcutsModalOpen() {
  return isModalOpen('admin-pos-shortcuts-modal');
}

function openPosShortcutsModal() {
  openModal('admin-pos-shortcuts-modal');
  setTimeout(() => {
    const closeBtn = document.getElementById('admin-pos-shortcuts-close-btn');
    closeBtn?.focus();
  }, 20);
}

function closePosShortcutsModal() {
  closeModal('admin-pos-shortcuts-modal');
  const helpBtn = document.getElementById('admin-pos-help-btn');
  setTimeout(() => {
    helpBtn?.focus();
  }, 260);
}

function handlePosShortcutsOverlayClick(event) {
  if (event.target?.id === 'admin-pos-shortcuts-modal') {
    closePosShortcutsModal();
  }
}

function handlePosGlobalShortcuts(event) {
  if (!isPosBillingViewActive()) return;
  const { key, target } = event;

  if (isPosShortcutsModalOpen()) {
    if (key === 'Escape') {
      event.preventDefault();
      closePosShortcutsModal();
    }
    return;
  }

  const searchInput = document.getElementById('admin-search-prod');
  if (!searchInput) return;

  if (key === '/') {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
    return;
  }

  if (key === '+') {
    event.preventDefault();
    const selected = getActivePosProduct();
    if (selected) {
      addToAdminCart(selected.id, { focusQtyInput: true });
      setTimeout(() => {
        const qtyInput = document.getElementById(`admin-qty-${selected.id}`);
        const cartItem = STATE.adminCart.find(item => item.id === selected.id);
        if (qtyInput) {
          if (cartItem && cartItem.qty === 1) {
            qtyInput.value = '1';
          }
          qtyInput.focus();
          qtyInput.select();
        }
      }, 0);
    } else {
      searchInput.focus();
      searchInput.select();
    }
    return;
  }

  if (key === '-') {
    if (isTextEditingTarget(target)) return;
    event.preventDefault();
    undoLastPosOrder();
    return;
  }

  if (key === 'Enter') {
    if (isTextEditingTarget(target)) return;
    event.preventDefault();
    procesarVenta(false);
  }
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
          <p style="margin: 2px 0 0; font-size: 11px; color: #666;">${fmt(c.price)} × <input type="number" id="admin-qty-${c.id}" value="${c.qty}" min="1" max="${c.stock}" onchange="updateAdminCartQty('${c.id}', this.value)" onkeypress="handleQuantityKeypress(event, '${c.id}')" style="width: 35px; padding: 2px; border: 1px solid #ddd; border-radius: 3px; text-align: center;"></p>
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

  const clientId = STATE.adminSelectedClient || 'c1';
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

  // Snapshot para deshacer: carrito + cliente + timestamp (historial en memoria + localStorage)
  savePosUndoSnapshot();

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

  // Show appropriate feedback
  if (printPDF) {
    showToast('Venta procesada, impresa y stock actualizado', 'success');
  } else {
    // Show actionable toast with download option
    showActionableToast(
      'Venta procesada. Stock actualizado.',
      'success',
      {
        label: 'Descargar Factura',
        action: () => downloadOrderInvoice(invoice.orderId)
      }
    );
  }

  return { invoiceId: invoice.id, orderId: invoice.orderId };
}

// SEARCH PRODUCTS IN POS
document.addEventListener('DOMContentLoaded', function() {
  loadPosUndoHistory();
  renderPosCategoryFilters();

  // Initialize client combobox
  renderPosClientCombobox();

  const clientInput = document.getElementById('admin-client-input');
  const clientList = document.getElementById('admin-client-list');

  if (clientInput) {
    clientInput.addEventListener('input', handleClientInputChange);
    clientInput.addEventListener('keydown', handleClientKeydown);
    clientInput.addEventListener('focus', () => {
      // Show list with all clients on focus
      filterAndRenderClientList('');
    });
    clientInput.addEventListener('blur', () => {
      // Hide list after brief delay to allow click on list items
      setTimeout(() => {
        if (document.activeElement !== clientList && !clientList?.contains(document.activeElement)) {
          clientList?.classList.add('hidden');
          clientComboboxState.isOpen = false;
        }
      }, 200);
    });
  }

  // Click outside combobox to close
  document.addEventListener('click', (e) => {
    const combobox = document.getElementById('admin-client-combobox');
    if (combobox && !combobox.contains(e.target)) {
      if (clientList) {
        clientList.classList.add('hidden');
        clientComboboxState.isOpen = false;
      }
    }
  });

  const searchInput = document.getElementById('admin-search-prod');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      STATE.posSearchActiveIndex = -1;
      renderPosProductList();
    });
    searchInput.addEventListener('keydown', handlePosSearchKeydown);
  }

  document.addEventListener('keydown', handlePosGlobalShortcuts);
});
