/* ============================================================
   ADMIN CORE FUNCTIONS
   ============================================================ */

function toggleAdminMode() {
  STATE.isAdminMode = !STATE.isAdminMode;

  const viewStore = document.getElementById('view-store');
  const viewAdmin = document.getElementById('view-admin');
  const navStore = document.getElementById('nav-store');
  const navAdmin = document.getElementById('nav-admin');
  const headerSearch = document.getElementById('header-search');
  const cartBtn = document.getElementById('btn-cart-header');

  if (STATE.isAdminMode) {
    if (viewStore) viewStore.classList.add('hidden');
    if (navStore) navStore.classList.add('hidden');
    if (headerSearch) headerSearch.classList.add('hidden');
    if (cartBtn) cartBtn.classList.add('hidden');

    if (viewAdmin) viewAdmin.classList.remove('hidden');
    if (navAdmin) navAdmin.classList.remove('hidden');

    switchAdminTab('facturacion');
    initAdminPanel();
    showToast('Modo Admin activado', 'info');
  } else {
    if (viewAdmin) viewAdmin.classList.add('hidden');
    if (navAdmin) navAdmin.classList.add('hidden');

    if (viewStore) viewStore.classList.remove('hidden');
    if (navStore) navStore.classList.remove('hidden');
    if (headerSearch) headerSearch.classList.remove('hidden');
    if (cartBtn) cartBtn.classList.remove('hidden');

    renderProducts();
    showToast('Modo Tienda activado', 'info');
  }
}

function initAdminPanel() {
  renderPosClientSelect();
  renderPosProductList();
  renderPosCart();
  renderOrdersTable();
  renderClientsTable();
  renderStockTable();
}

// ORDERS
function renderOrdersTable() {
  const tbody = document.getElementById('admin-orders-tbody');
  if (!tbody) return;

  if (!STATE.adminOrders.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 32px; color: #999; font-weight: bold;">No hay pedidos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = STATE.adminOrders.map(o => {
    const isWeb = o.source === 'web';
    const statusColor = o.status === 'pending' ? 'background: #fef3c7; color: #92400e;' : 'background: #d1fae5; color: #065f46;';

    return `
    <tr>
      <td style="font-size: 12px; color: #666;">${o.date}</td>
      <td style="font-weight: bold; color: var(--color-ink);">${escapeHtml(o.client)}</td>
      <td>${o.address}</td>
      <td style="font-weight: bold; color: var(--color-brand);">${fmt(o.total)}</td>
      <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; ${isWeb ? 'background: #dbeafe; color: #1e40af;' : 'background: #f3e8ff; color: #6b21a8;'}">${isWeb ? 'Web' : 'Admin'}</span></td>
      <td><span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 600; ${statusColor}">${o.status === 'pending' ? 'Pendiente' : 'Completado'}</span></td>
      <td style="text-align: right;">
        <button onclick="viewOrderDetail('${o.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline;">Ver</button>
        ${o.status === 'pending' ? `<button onclick="markOrderCompleted('${o.id}')" style="background: none; border: none; color: #10b981; cursor: pointer; font-size: 11px; font-weight: bold; text-decoration: underline; margin-left: 8px;">Completar</button>` : ''}
      </td>
    </tr>
    `;
  }).join('');
}

function viewOrderDetail(orderId) {
  const order = STATE.adminOrders.find(o => o.id === orderId);
  if (!order) return;

  let content = `
    <div style="margin-bottom: 16px;">
      <p style="margin: 4px 0;"><strong style="color: #666;">Cliente:</strong> <span style="font-weight: bold; font-size: 16px;">${escapeHtml(order.client)}</span></p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Dirección:</strong> ${order.address}</p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Fecha:</strong> ${order.date}</p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Origen:</strong> ${order.source === 'web' ? 'Web' : 'Admin'}</p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Estado:</strong> ${order.status === 'pending' ? 'Pendiente' : 'Completado'}</p>
    </div>
    <h4 style="font-weight: bold; margin: 12px 0 8px; border-bottom: 2px solid #f5c000; padding-bottom: 4px; color: #666;">Productos:</h4>
    <ul style="list-style: none; padding: 0; margin: 0;">
  `;

  order.items.forEach(item => {
    content += `
      <li style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #eee;">
        <span><strong>${item.qty}x</strong> ${escapeHtml(item.name)}</span>
        <span style="font-weight: bold;">${fmt(item.price * item.qty)}</span>
      </li>
    `;
  });

  content += `</ul>`;

  const modal = document.getElementById('order-detail-modal') || document.getElementById('admin-order-modal');
  const modalContent = document.getElementById('order-detail-content') || document.getElementById('order-modal-content');
  const modalTotal = document.getElementById('order-detail-total') || document.getElementById('order-modal-total');

  if (modalContent) modalContent.innerHTML = content;
  if (modalTotal) modalTotal.textContent = fmt(order.total);
  if (modal) openModal(modal.id);
}

function markOrderCompleted(orderId) {
  const order = STATE.adminOrders.find(o => o.id === orderId);
  if (!order) return;

  showConfirmDialog('¿Marcar este pedido como completado?', () => {
    order.status = 'completed';
    persistData();
    renderOrdersTable();
    closeModal('order-detail-modal');
    closeModal('admin-order-modal');
    showToast('Pedido marcado como completado', 'success');
  });
}

// CLIENTS (básico, extendido en clients.js)
function renderClientsTable() {
  const tbody = document.getElementById('admin-clients-tbody');
  if (!tbody) return;

  tbody.innerHTML = STATE.clients.map(c => `
    <tr>
      <td style="font-weight: bold;">${escapeHtml(c.name)}</td>
      <td style="font-size: 12px;">${c.address || '—'}</td>
      <td style="font-size: 12px;">${c.phone || '—'}</td>
      <td><span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${c.tax}</span></td>
      <td style="text-align: right;">
        <button onclick="editClientForm('${c.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: bold;">Editar</button>
      </td>
    </tr>
  `).join('');
}

function editClientForm(clientId) {
  const client = STATE.clients.find(c => c.id === clientId);
  if (!client) return;

  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');

  if (idInput) idInput.value = client.id;
  if (nameInput) nameInput.value = client.name;
  if (addressInput) addressInput.value = client.address || '';
  if (phoneInput) phoneInput.value = client.phone || '';
  if (emailInput) emailInput.value = client.email || '';
  if (cuitInput) cuitInput.value = client.cuit || '';
  if (taxSelect) taxSelect.value = client.tax;
  if (notesInput) notesInput.value = client.notes || '';

  const title = document.getElementById('client-form-title');
  if (title) title.textContent = 'Editar Cliente';

  switchAdminTab('clientes');
}

function resetClientForm() {
  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');

  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (addressInput) addressInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (cuitInput) cuitInput.value = '';
  if (taxSelect) taxSelect.value = 'Consumidor Final';
  if (notesInput) notesInput.value = '';

  const title = document.getElementById('client-form-title');
  if (title) title.textContent = 'Nuevo Cliente';
}

function saveClient() {
  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');

  const name = nameInput?.value.trim();
  if (!name) {
    showToast('Por favor ingresa el nombre del cliente', 'warning');
    return;
  }

  const clientData = {
    id: idInput?.value || generateId('c'),
    name,
    address: addressInput?.value.trim() || '',
    phone: phoneInput?.value.trim() || '',
    email: emailInput?.value.trim() || '',
    cuit: cuitInput?.value.trim() || '',
    tax: taxSelect?.value || 'Consumidor Final',
    notes: notesInput?.value.trim() || ''
  };

  const existingIdx = STATE.clients.findIndex(c => c.id === clientData.id);
  if (existingIdx > -1) {
    STATE.clients[existingIdx] = clientData;
    showToast('Cliente actualizado', 'success');
  } else {
    STATE.clients.push(clientData);
    showToast('Cliente agregado', 'success');
  }

  persistData();
  renderClientsTable();
  renderPosClientSelect();
  resetClientForm();
}

function deleteClient(clientId) {
  if (clientId === 'c1') {
    showToast('No se puede eliminar el cliente por defecto', 'error');
    return;
  }

  showConfirmDialog('¿Eliminar este cliente?', () => {
    STATE.clients = STATE.clients.filter(c => c.id !== clientId);
    persistData();
    renderClientsTable();
    renderPosClientSelect();
    resetClientForm();
    showToast('Cliente eliminado', 'success');
  });
}

// STOCK
function renderStockTable() {
  const tbody = document.getElementById('admin-stock-tbody');
  if (!tbody) return;

  tbody.innerHTML = STATE.products.map(p => `
    <tr>
      <td style="font-weight: bold; display: flex; align-items: center; gap: 8px;">
        <img src="${p.img}" alt="${p.name}" style="width: 32px; height: 32px; border-radius: 4px; object-fit: cover; border: 1px solid #ddd;">
        <span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(p.name)}</span>
      </td>
      <td style="${p.stock <= 5 ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;'}">${p.stock} u.</td>
      <td>${fmt(p.cost)}</td>
      <td>${p.margin.toFixed(1)}%</td>
      <td style="color: var(--color-brand); font-weight: bold;">${fmt(p.sale)}</td>
      <td style="text-align: right;">
        <button onclick="openEditProductModal('${p.id}')" style="background: none; border: none; color: var(--color-brand); cursor: pointer; font-weight: bold; text-decoration: underline;">Ajustar</button>
      </td>
    </tr>
  `).join('');
}

function openEditProductModal(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  const idInput = document.getElementById('edit-p-id');
  const nameEl = document.getElementById('edit-p-name');
  const stockInput = document.getElementById('edit-p-stock');
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');

  if (idInput) idInput.value = product.id;
  if (nameEl) nameEl.textContent = escapeHtml(product.name);
  if (stockInput) stockInput.value = product.stock;
  if (costInput) costInput.value = product.cost;
  if (marginInput) marginInput.value = product.margin;
  if (saleInput) saleInput.value = product.sale;

  openModal('edit-product-modal');
  openModal('admin-modal-overlay');
}

function recalculatePrice() {
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');

  const cost = parseFloat(costInput?.value) || 0;
  const margin = parseFloat(marginInput?.value) || 0;
  const sale = calculateSalePrice(cost, margin);

  if (saleInput) saleInput.value = sale;
}

function saveEditedProduct() {
  const idInput = document.getElementById('edit-p-id');
  const productId = idInput?.value;
  const product = STATE.products.find(p => p.id === productId);

  if (!product) return;

  const stockInput = document.getElementById('edit-p-stock');
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');

  product.stock = parseInt(stockInput?.value) || 0;
  product.cost = parseFloat(costInput?.value) || 0;
  product.margin = parseFloat(marginInput?.value) || 0;
  product.sale = calculateSalePrice(product.cost, product.margin);

  persistData();
  renderStockTable();
  renderPosProductList();
  closeModal('edit-product-modal');
  closeModal('admin-modal-overlay');
  showToast('Producto actualizado', 'success');
}

// Legacy compatibility for inline handlers in index.html
function renderAdminProdList() {
  renderPosProductList();
}

function procesarFactura(printPDF = false) {
  procesarVenta(printPDF);
}

function recalcPrice() {
  recalculatePrice();
}

function saveAdminProduct() {
  saveEditedProduct();
}

function closeAdminModal() {
  closeModal('edit-product-modal');
  closeModal('admin-modal-overlay');
}

function closeOrderModal() {
  closeModal('order-detail-modal');
  closeModal('admin-order-modal');
}
