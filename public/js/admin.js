/* ============================================================
   ADMIN CORE FUNCTIONS
   ============================================================ */

let clientSortState = {
  field: 'name',
  direction: 'asc'
};

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
  try {
    // Only init POS components if they exist on the page
    try {
      if (document.getElementById('admin-client-input') && typeof renderPosClientCombobox === 'function') {
        renderPosClientCombobox();
        console.log('renderPosClientCombobox inicializado');
      }
      if (document.getElementById('pos-price-list') && typeof renderPosListSelector === 'function') {
        renderPosListSelector();
        console.log('renderPosListSelector inicializado');
      }
      if (document.getElementById('admin-prod-list') && typeof renderPosProductList === 'function') {
        renderPosProductList();
        console.log('renderPosProductList inicializado');
      }
      if (document.getElementById('admin-cart-items') && typeof renderPosCart === 'function') {
        renderPosCart();
        console.log('renderPosCart inicializado');
      }
    } catch (error) {
      console.error('Error inicializando componentes POS en admin:', error);
    }

    // Init other tables if they exist
    if (document.getElementById('admin-orders-tbody') && typeof renderOrdersTable === 'function') {
      renderOrdersTable();
      console.log('renderOrdersTable inicializado');
    }
    if (document.getElementById('admin-clients-tbody') && typeof renderClientsTable === 'function') {
      renderClientsTable();
      console.log('renderClientsTable inicializado');
    }
    if (document.getElementById('bulk-edit-tbody') && typeof renderStockTable === 'function') {
      renderStockTable();
      console.log('renderStockTable inicializado');
    }

    console.log('Admin panel inicializado completamente');
  } catch (error) {
    console.error('Error inicializando panel admin:', error);
  }
}

function getOrderInvoice(order) {
  if (!order) return null;

  if (order.invoiceId) {
    const linkedInvoice = STATE.adminInvoices.find(inv => inv.id === order.invoiceId);
    if (linkedInvoice) return linkedInvoice;
  }

  return STATE.adminInvoices.find(inv => inv.orderId === order.id) || null;
}

function buildClientFromOrder(order) {
  const existingClient = STATE.clients.find(c => c.id === order.clientId)
    || STATE.clients.find(c => c.name === order.client);

  return {
    name: order.client || existingClient?.name || 'Cliente',
    address: order.address || existingClient?.address || '—',
    tax: existingClient?.tax || 'Consumidor Final',
    cuit: existingClient?.cuit || ''
  };
}

function createAndStoreOrderInvoice(order) {
  const existingInvoice = getOrderInvoice(order);
  if (existingInvoice) return existingInvoice;

  const invoice = {
    id: generateId('inv'),
    orderId: order.id,
    date: getCurrentDateTime(),
    client: order.client,
    clientId: order.clientId || null,
    docType: 'negro',
    items: deepClone(order.items || []),
    total: order.total || 0,
    itemsCount: (order.items || []).reduce((sum, item) => sum + (item.qty || 0), 0)
  };

  STATE.adminInvoices.unshift(invoice);
  order.invoiceId = invoice.id;
  persistData();

  return invoice;
}

function downloadOrderInvoice(orderId) {
  const order = STATE.adminOrders.find(o => o.id === orderId);
  if (!order) {
    showToast('No se encontró el pedido seleccionado', 'error');
    return;
  }

  let invoice = getOrderInvoice(order);

  if (!invoice && order.source === 'web') {
    invoice = createAndStoreOrderInvoice(order);
  }

  if (!invoice) {
    showToast('Este pedido no tiene factura asociada', 'warning');
    return;
  }

  const clientData = buildClientFromOrder(order);
  const items = deepClone(invoice.items || order.items || []);
  const total = invoice.total || order.total || 0;
  const docType = invoice.docType || (order.source === 'web' ? 'negro' : 'blanco');

  generateInvoicePDF(clientData, docType, items, total, invoice.id);
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
    const invoice = STATE.adminInvoices.find(inv => inv.orderId === o.id);
    const pedidoNumber = invoice ? invoice.id.split('-').pop().substring(0, 8) : '—';

    return `
    <tr>
      <td style="font-size: 12px; color: #666;">${o.date}</td>
      <td style="font-weight: bold; color: #666; font-family: monospace;">${pedidoNumber}</td>
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
}

function viewOrderDetail(orderId) {
  const order = STATE.adminOrders.find(o => o.id === orderId);
  if (!order) return;

  const invoice = STATE.adminInvoices.find(inv => inv.orderId === orderId);
  const pedidoNumber = invoice ? invoice.id.split('-').pop().substring(0, 8) : '—';

  let content = `
    <div style="margin-bottom: 16px;">
      <p style="margin: 4px 0;"><strong style="color: #666;">Número:</strong> <span style="font-weight: bold; font-family: monospace; font-size: 14px;">${pedidoNumber}</span></p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Cliente:</strong> <span style="font-weight: bold; font-size: 16px;">${escapeHtml(order.client)}</span></p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Dirección:</strong> ${order.address}</p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Fecha:</strong> ${order.date}</p>
      <p style="margin: 4px 0;"><strong style="color: #666;">Origen:</strong> ${order.source === 'web' ? 'Web' : 'POS'}</p>
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
  content += `
    <div style="margin-top: 16px; display: flex; justify-content: flex-end;">
      <button onclick="downloadOrderInvoice('${order.id}')" class="btn btn-outline" style="font-size: 12px;">
        ${order.source === 'web' ? 'Descargar presupuesto' : 'Descargar factura'}
      </button>
    </div>
  `;

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

  let clientsToRender = [...STATE.clients];

  // Aplicar ordenamiento
  clientsToRender.sort((a, b) => {
    let aVal = a[clientSortState.field];
    let bVal = b[clientSortState.field];

    // Convertir a minúsculas para comparación alfabética
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    // Manejo de valores vacíos
    if (!aVal) aVal = '';
    if (!bVal) bVal = '';

    if (aVal < bVal) return clientSortState.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return clientSortState.direction === 'asc' ? 1 : -1;
    return 0;
  });

  tbody.innerHTML = clientsToRender.map(c => `
    <tr data-client-id="${c.id}">
      <td style="font-weight: bold;">${escapeHtml(c.name)}</td>
      <td style="font-size: 12px;">${escapeHtml(c.client_code || '') || '—'}</td>
      <td style="font-size: 12px;">
        <div>${c.address || '—'}</div>
        <div style="color: #666; margin-top: 2px;">${c.cuit || '—'}</div>
      </td>
      <td><span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${c.tax}</span></td>
      <td style="text-align: right;">
        <button onclick="editClientForm('${c.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: bold;">Editar</button>
        ${c.id === 'c1' ? '' : `<button onclick="deleteClientWithConfirm('${c.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 11px; font-weight: bold; margin-left: 8px;">Eliminar</button>`}
      </td>
    </tr>
  `).join('');

  updateSortArrows();
}

function sortClientsBy(field) {
  // Si se hace clic en el mismo campo, cambiar la dirección
  if (clientSortState.field === field) {
    clientSortState.direction = clientSortState.direction === 'asc' ? 'desc' : 'asc';
  } else {
    // Si se hace clic en un campo diferente, establecer el campo y dirección ascendente
    clientSortState.field = field;
    clientSortState.direction = 'asc';
  }

  renderClientsTable();
}

function updateSortArrows() {
  const fieldToArrowId = {
    'name': 'sort-name-arrow',
    'client_code': 'sort-code-arrow',
    'address': 'sort-address-arrow',
    'tax': 'sort-tax-arrow'
  };

  // Limpiar todas las flechas
  Object.values(fieldToArrowId).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '⇅';
      el.style.color = '#9ca3af';
    }
  });

  // Actualizar la flecha del campo actual
  const arrowId = fieldToArrowId[clientSortState.field];
  const arrowEl = document.getElementById(arrowId);
  if (arrowEl) {
    arrowEl.textContent = clientSortState.direction === 'asc' ? '↑' : '↓';
    arrowEl.style.color = '#4f46e5';
  }
}

function editClientForm(clientId) {
  const client = STATE.clients.find(c => c.id === clientId);
  if (!client) return;

  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const codeInput = document.getElementById('c-code');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');
  const priceListSelect = document.getElementById('c-price-list');

  if (idInput) idInput.value = client.id;
  if (nameInput) nameInput.value = client.name;
  if (codeInput) codeInput.value = client.client_code || '';
  if (addressInput) addressInput.value = client.address || '';
  if (phoneInput) phoneInput.value = client.phone || '';
  if (emailInput) emailInput.value = client.email || '';
  if (cuitInput) cuitInput.value = client.cuit || '';
  if (taxSelect) taxSelect.value = client.tax;
  if (notesInput) notesInput.value = client.notes || '';
  if (priceListSelect) {
    populatePriceListSelector(priceListSelect);
    priceListSelect.value = client.price_list_id || '';
  }

  const title = document.getElementById('client-form-title');
  if (title) title.textContent = 'Editar Cliente';

  switchAdminTab('clientes');

  // Abrir el modal
  const modal = document.getElementById('client-modal');
  if (modal) modal.classList.remove('hidden');
}

function resetClientForm() {
  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const codeInput = document.getElementById('c-code');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');
  const priceListSelect = document.getElementById('c-price-list');

  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (codeInput) codeInput.value = '';
  if (addressInput) addressInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (emailInput) emailInput.value = '';
  if (cuitInput) cuitInput.value = '';
  if (taxSelect) taxSelect.value = 'Consumidor Final';
  if (notesInput) notesInput.value = '';
  if (priceListSelect) {
    populatePriceListSelector(priceListSelect);
    priceListSelect.value = '';
  }

  const title = document.getElementById('client-form-title');
  if (title) title.textContent = 'Nuevo Cliente';
}

function saveClient() {
  const idInput = document.getElementById('c-id');
  const nameInput = document.getElementById('c-name');
  const codeInput = document.getElementById('c-code');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');
  const priceListSelect = document.getElementById('c-price-list');

  const name = nameInput?.value.trim();
  if (!name) {
    showToast('Por favor ingresa el nombre del cliente', 'warning');
    return;
  }

  const priceListId = priceListSelect?.value ? parseInt(priceListSelect.value) : null;
  const isNewClient = !idInput?.value;
  let clientCode = codeInput?.value.trim() || '';

  // Auto-generar código si es nuevo cliente y no tiene código
  if (isNewClient && !clientCode) {
    clientCode = getNextClientCode();
  }

  const clientData = {
    id: idInput?.value || generateId('c'),
    name,
    client_code: clientCode,
    address: addressInput?.value.trim() || '',
    phone: phoneInput?.value.trim() || '',
    email: emailInput?.value.trim() || '',
    cuit: cuitInput?.value.trim() || '',
    tax: taxSelect?.value || 'Consumidor Final',
    notes: notesInput?.value.trim() || '',
    price_list_id: priceListId
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
  if (typeof renderPosClientCombobox === 'function') renderPosClientCombobox();
  resetClientForm();
  if (typeof loadClientMarkers === 'function') loadClientMarkers();
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
    if (typeof renderPosClientCombobox === 'function') renderPosClientCombobox();
    resetClientForm();
    if (typeof loadClientMarkers === 'function') loadClientMarkers();
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
        <span style="display: flex; flex-direction: column; min-width: 0;">
          <span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;">${escapeHtml(p.name)}</span>
          <span style="font-size: 11px; color: #6b7280;">SKU: ${escapeHtml(p.sku || '') || '—'}</span>
        </span>
      </td>
      <td style="${p.stock <= 5 ? 'color: #ef4444; font-weight: bold;' : 'color: #10b981; font-weight: bold;'}">${p.stock} u.</td>
      <td>${fmt(p.cost)}</td>
      <td>${p.margin.toFixed(1)}%</td>
      <td style="color: var(--color-brand); font-weight: bold;">${fmt(p.sale)}</td>
      <td style="text-align: right;">
        <button onclick="openEditProductModal('${p.id}')" style="background: none; border: none; color: var(--color-brand); cursor: pointer; font-weight: bold; text-decoration: underline;">Ajustar</button>
        <button onclick="deleteProductWithConfirm('${p.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-weight: bold; text-decoration: underline; margin-left: 8px;">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

function openEditProductModal(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  const idInput = document.getElementById('edit-p-id');
  const nameEl = document.getElementById('edit-p-name');
  const productNameInput = document.getElementById('edit-p-product-name');
  const skuInput = document.getElementById('edit-p-sku');
  const categoryInput = document.getElementById('edit-p-cat');
  const imageInput = document.getElementById('edit-p-img');
  const stockInput = document.getElementById('edit-p-stock');
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');
  const deleteBtn = document.getElementById('btn-delete-product');

  if (idInput) idInput.value = product.id;
  if (nameEl) nameEl.textContent = 'Editar Producto';
  if (productNameInput) productNameInput.value = product.name || '';
  if (skuInput) skuInput.value = product.sku || '';
  if (categoryInput) categoryInput.value = product.cat || 'congelados';
  if (imageInput) imageInput.value = product.img || '';
  if (stockInput) stockInput.value = product.stock;
  if (costInput) costInput.value = product.cost;
  if (marginInput) marginInput.value = product.margin;
  if (saleInput) saleInput.value = product.sale;
  if (deleteBtn) deleteBtn.classList.remove('hidden');

  openModal('edit-product-modal');
  openModal('admin-modal-overlay');
}

function openCreateProductModal() {
  const idInput = document.getElementById('edit-p-id');
  const nameEl = document.getElementById('edit-p-name');
  const productNameInput = document.getElementById('edit-p-product-name');
  const skuInput = document.getElementById('edit-p-sku');
  const categoryInput = document.getElementById('edit-p-cat');
  const imageInput = document.getElementById('edit-p-img');
  const stockInput = document.getElementById('edit-p-stock');
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');
  const deleteBtn = document.getElementById('btn-delete-product');

  if (idInput) idInput.value = '';
  if (nameEl) nameEl.textContent = 'Nuevo Producto';
  if (productNameInput) productNameInput.value = '';
  if (skuInput) skuInput.value = '';
  if (categoryInput) categoryInput.value = 'congelados';
  if (imageInput) imageInput.value = '';
  if (stockInput) stockInput.value = 0;
  if (costInput) costInput.value = 0;
  if (marginInput) marginInput.value = 35;
  if (saleInput) saleInput.value = 0;
  if (deleteBtn) deleteBtn.classList.add('hidden');

  recalculatePrice();
  openModal('edit-product-modal');
  openModal('admin-modal-overlay');
}

function recalculatePrice(source = 'margin') {
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');

  if (!costInput || !marginInput || !saleInput) return;

  const cost = Number.parseFloat(costInput.value) || 0;
  let margin = Number.parseFloat(marginInput.value) || 0;
  let sale = Number.parseFloat(saleInput.value) || 0;

  if (source === 'sale') {
    margin = cost > 0 ? ((sale - cost) / cost) * 100 : 0;
    margin = Number(margin.toFixed(2));
    marginInput.value = margin;
    saleInput.value = roundPrice(sale);
    return;
  }

  if (source === 'cost') {
    const currentlyEditingSale = document.activeElement === saleInput;
    if (currentlyEditingSale) {
      margin = cost > 0 ? ((sale - cost) / cost) * 100 : 0;
      marginInput.value = Number(margin.toFixed(2));
      return;
    }
  }

  sale = calculateSalePrice(cost, margin);
  saleInput.value = sale;
  marginInput.value = Number(margin.toFixed(2));
}

function saveEditedProduct() {
  const idInput = document.getElementById('edit-p-id');
  const productId = idInput?.value;
  const productNameInput = document.getElementById('edit-p-product-name');
  const skuInput = document.getElementById('edit-p-sku');
  const categoryInput = document.getElementById('edit-p-cat');
  const imageInput = document.getElementById('edit-p-img');
  const stockInput = document.getElementById('edit-p-stock');
  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');
  const productName = productNameInput?.value.trim();

  if (!productName) {
    showToast('Ingresa el nombre del producto', 'warning');
    return;
  }

  const normalizedImage = imageInput?.value.trim() || 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80';
  const productData = {
    id: productId || generateId('p'),
    sku: skuInput?.value.trim() || '',
    name: productName,
    short: productName,
    desc: productName,
    price: 0,
    sale: 0,
    cat: categoryInput?.value || 'congelados',
    badge: '',
    img: normalizedImage,
    stock: parseInt(stockInput?.value) || 0,
    cost: parseFloat(costInput?.value) || 0,
    margin: Number((parseFloat(marginInput?.value) || 0).toFixed(2))
  };
  productData.sale = parseFloat(saleInput?.value);
  if (!Number.isFinite(productData.sale)) {
    productData.sale = calculateSalePrice(productData.cost, productData.margin);
  } else {
    productData.sale = roundPrice(productData.sale);
  }
  productData.price = productData.sale;

  const existingIdx = STATE.products.findIndex(p => p.id === productData.id);
  if (existingIdx > -1) {
    const prev = STATE.products[existingIdx];
    if (typeof logChange === 'function') {
      if (prev.sale !== productData.sale) {
        logChange({ type: 'precio', productId: productData.id, productName: productData.name, field: 'precio_venta', oldValue: prev.sale, newValue: productData.sale });
      }
      if (prev.stock !== productData.stock) {
        logChange({ type: 'stock', productId: productData.id, productName: productData.name, field: 'stock', oldValue: prev.stock, newValue: productData.stock });
      }
      if (prev.name !== productData.name || prev.cat !== productData.cat) {
        logChange({ type: 'producto', productId: productData.id, productName: productData.name, field: 'datos', oldValue: prev.name, newValue: productData.name, note: `cat: ${productData.cat}` });
      }
    }
    STATE.products[existingIdx] = {
      ...prev,
      ...productData
    };
  } else {
    if (typeof logChange === 'function') {
      logChange({ type: 'producto', productId: productData.id, productName: productData.name, field: 'nuevo', oldValue: null, newValue: productData.name });
    }
    STATE.products.unshift(productData);
  }

  persistData();
  renderStockTable();
  renderPosProductList();
  renderProducts();
  closeModal('edit-product-modal');
  closeModal('admin-modal-overlay');
  showToast(existingIdx > -1 ? 'Producto actualizado' : 'Producto creado', 'success');
}

function deleteProductWithConfirm(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  showConfirmDialog(`¿Eliminar el producto "${product.name}"?`, () => {
    STATE.products = STATE.products.filter(p => p.id !== productId);
    persistData();
    renderStockTable();
    renderPosProductList();
    renderProducts();
    showToast('Producto eliminado', 'success');
  });
}

function deleteProductFromModal() {
  const idInput = document.getElementById('edit-p-id');
  const productId = idInput?.value;
  if (!productId) return;

  closeModal('edit-product-modal');
  closeModal('admin-modal-overlay');
  deleteProductWithConfirm(productId);
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

function renderSlidesList() {
  const list = document.getElementById('slides-list');
  const empty = document.getElementById('slides-empty');
  if (!list || !empty) return;

  const slides = [...(STATE.slides || [])].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));

  if (!slides.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  list.innerHTML = slides.map((slide, index) => `
    <div class="border-2 border-gray-200 rounded-lg p-3 flex items-center gap-3 cursor-move hover:border-brand hover:shadow-md transition group" draggable="true" data-slide-id="${slide.id}" ondragstart="handleSlideDragStart(event)" ondragover="event.preventDefault()" ondrop="handleSlideDrop(event)" ondragend="handleSlideDragEnd()">
      <div class="flex-shrink-0 text-gray-400 opacity-0 group-hover:opacity-100 transition">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M8 5a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z"></path><path d="M14 5a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0zm0 6a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
      </div>
      <img src="${normalizeSlideImageUrl(slide.image_url)}" alt="${escapeHtml(slide.title || 'Slide')}" class="w-20 h-14 object-cover rounded bg-gray-100 flex-shrink-0" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-ink truncate">${escapeHtml(slide.title || 'Sin texto')}</p>
        <p class="text-xs text-gray-500 truncate">${escapeHtml(slide.image_url)}</p>
        <p class="text-xs text-gray-500">Orden: ${Number(slide.sort_order || 0)} · ${Number(slide.is_active || 0) ? 'Activo' : 'Inactivo'}</p>
      </div>
      <div class="flex gap-2 flex-shrink-0">
        <button onclick="openEditSlideModal(${Number(slide.id)})" class="text-xs bg-blue-100 text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-200 transition">Editar</button>
        <button onclick="deleteSlide(${Number(slide.id)})" class="text-xs bg-red-100 text-red-700 font-semibold px-3 py-1 rounded hover:bg-red-200 transition">Eliminar</button>
      </div>
    </div>
  `).join('');
}

async function createSlide(event) {
  event.preventDefault();

  const imageUrlInput = document.getElementById('slide-image-url');
  const titleInput = document.getElementById('slide-title');
  const sortOrderInput = document.getElementById('slide-sort-order');
  const isActiveInput = document.getElementById('slide-is-active');

  const payload = {
    image_url: normalizeSlideImageUrl(imageUrlInput?.value || ''),
    title: titleInput?.value.trim() || '',
    sort_order: parseInt(sortOrderInput?.value || '0', 10) || 0,
    is_active: isActiveInput?.checked ? 1 : 0
  };

  if (!payload.image_url) {
    showToast('Ingresá una URL de imagen válida', 'warning');
    return;
  }

  try {
    const slide = await apiFetch('/api/slides', { method: 'POST', body: JSON.stringify(payload) });
    STATE.slides = [...(STATE.slides || []), slide];
    renderSlidesList();
    renderSlider();

    if (imageUrlInput) imageUrlInput.value = '';
    if (titleInput) titleInput.value = '';
    if (sortOrderInput) sortOrderInput.value = '0';
    if (isActiveInput) isActiveInput.checked = true;

    showToast('Slide agregado', 'success');
  } catch (error) {
    console.error(error);
    showToast('No se pudo guardar el slide', 'error');
  }
}

async function deleteSlide(id) {
  if (!id) return;

  showConfirmDialog('¿Eliminar este slide?', async () => {
    try {
      await apiFetch(`/api/slides/${id}`, { method: 'DELETE' });
      STATE.slides = (STATE.slides || []).filter(slide => Number(slide.id) !== Number(id));
      renderSlidesList();
      renderSlider();
      showToast('Slide eliminado', 'success');
    } catch (error) {
      console.error(error);
      showToast('No se pudo eliminar el slide', 'error');
    }
  });
}

// DRAG & DROP REORDERING
let _draggedSlideElement = null;

function handleSlideDragStart(event) {
  _draggedSlideElement = event.currentTarget;
  event.currentTarget.style.opacity = '0.5';
}

function handleSlideDrop(event) {
  event.preventDefault();

  if (!_draggedSlideElement || _draggedSlideElement === event.currentTarget) {
    return;
  }

  const draggedId = Number(_draggedSlideElement.dataset.slideId);
  const targetId = Number(event.currentTarget.dataset.slideId);

  const draggedSlide = STATE.slides.find(s => s.id === draggedId);
  const targetSlide = STATE.slides.find(s => s.id === targetId);

  if (!draggedSlide || !targetSlide) return;

  const dragged_idx = STATE.slides.indexOf(draggedSlide);
  const target_idx = STATE.slides.indexOf(targetSlide);

  if (dragged_idx < target_idx) {
    draggedSlide.sort_order = targetSlide.sort_order + 1;
  } else {
    draggedSlide.sort_order = targetSlide.sort_order - 1;
  }

  persistData();
  renderSlidesList();
  renderSlider();
}

function handleSlideDragEnd() {
  if (_draggedSlideElement) {
    _draggedSlideElement.style.opacity = '1';
    _draggedSlideElement = null;
  }
}

// EDIT SLIDE MODAL
function openEditSlideModal(slideId) {
  const slide = STATE.slides.find(s => Number(s.id) === Number(slideId));
  if (!slide) return;

  const idInput = document.getElementById('edit-slide-id');
  const imageUrlInput = document.getElementById('edit-slide-image-url');
  const titleInput = document.getElementById('edit-slide-title');
  const sortOrderInput = document.getElementById('edit-slide-sort-order');
  const isActiveInput = document.getElementById('edit-slide-is-active');
  const imagePreview = document.getElementById('edit-slide-image-preview');

  if (idInput) idInput.value = slide.id;
  if (imageUrlInput) imageUrlInput.value = slide.image_url || '';
  if (titleInput) titleInput.value = slide.title || '';
  if (sortOrderInput) sortOrderInput.value = slide.sort_order || 0;
  if (isActiveInput) isActiveInput.checked = slide.is_active ? true : false;
  if (imagePreview) {
    imagePreview.src = normalizeSlideImageUrl(slide.image_url);
    imagePreview.classList.remove('hidden');
  }

  openModal('edit-slide-modal');
  openModal('admin-modal-overlay');
}

async function saveEditedSlide() {
  const idInput = document.getElementById('edit-slide-id');
  const imageUrlInput = document.getElementById('edit-slide-image-url');
  const titleInput = document.getElementById('edit-slide-title');
  const sortOrderInput = document.getElementById('edit-slide-sort-order');
  const isActiveInput = document.getElementById('edit-slide-is-active');

  const slideId = idInput?.value;
  if (!slideId) return;

  const imageUrl = imageUrlInput?.value.trim();
  if (!imageUrl) {
    showToast('Ingresá una URL de imagen válida', 'warning');
    return;
  }

  const payload = {
    id: slideId,
    image_url: normalizeSlideImageUrl(imageUrl),
    title: titleInput?.value.trim() || '',
    sort_order: parseInt(sortOrderInput?.value || '0', 10) || 0,
    is_active: isActiveInput?.checked ? 1 : 0
  };

  try {
    await apiFetch(`/api/slides/${slideId}`, { method: 'PUT', body: JSON.stringify(payload) });

    const slideIdx = STATE.slides.findIndex(s => Number(s.id) === Number(slideId));
    if (slideIdx > -1) {
      STATE.slides[slideIdx] = payload;
    }

    persistData();
    renderSlidesList();
    renderSlider();
    closeModal('edit-slide-modal');
    closeModal('admin-modal-overlay');
    showToast('Slide actualizado', 'success');
  } catch (error) {
    console.error(error);
    showToast('No se pudo guardar el slide', 'error');
  }
}

function initSlidesSettings() {
  const form = document.getElementById('slides-form');
  if (!form || form.dataset.bound === '1') {
    renderSlidesList();
    return;
  }

  form.addEventListener('submit', createSlide);
  form.dataset.bound = '1';
  renderSlidesList();
}

/* ============================================================
   CLIENTE AUTO-CODE Y EDITOR MASIVO
   ============================================================ */

function getNextClientCode() {
  if (!STATE.clients.length) return '001';

  const codes = STATE.clients
    .map(c => parseInt(c.client_code || '0', 10))
    .filter(code => !isNaN(code) && code > 0)
    .sort((a, b) => b - a);

  const nextCode = (codes[0] || 0) + 1;
  return String(nextCode).padStart(3, '0');
}

function autoFillClientCode() {
  const codeInput = document.getElementById('c-code');
  if (codeInput && !codeInput.value) {
    codeInput.value = getNextClientCode();
  }
}

function openBulkClientEditor() {
  // Navegar a la página del editor masivo
  window.location.href = '/admin/clientes/editor-masivo';
}

function renderBulkClientTable() {
  const tbody = document.getElementById('bulk-clients-tbody');
  if (!tbody) return;

  tbody.innerHTML = STATE.clients.map((c, idx) => `
    <tr>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${String(idx + 1).padStart(3, '0')}" class="w-full px-2 py-1 border rounded" disabled></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${escapeHtml(c.name)}" data-client-id="${c.id}" data-field="name" class="w-full px-2 py-1 border rounded bulk-client-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${c.client_code || ''}" data-client-id="${c.id}" data-field="client_code" class="w-full px-2 py-1 border rounded bulk-client-input code-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${c.address || ''}" data-client-id="${c.id}" data-field="address" class="w-full px-2 py-1 border rounded bulk-client-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${c.phone || ''}" data-client-id="${c.id}" data-field="phone" class="w-full px-2 py-1 border rounded bulk-client-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${c.email || ''}" data-client-id="${c.id}" data-field="email" class="w-full px-2 py-1 border rounded bulk-client-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="${c.cuit || ''}" data-client-id="${c.id}" data-field="cuit" class="w-full px-2 py-1 border rounded bulk-client-input"></td>
      <td class="px-4 py-2 text-sm border border-gray-200"><select data-client-id="${c.id}" data-field="tax" class="w-full px-2 py-1 border rounded bulk-client-input"><option value="Consumidor Final" ${c.tax === 'Consumidor Final' ? 'selected' : ''}>Consumidor Final</option><option value="Monotributista" ${c.tax === 'Monotributista' ? 'selected' : ''}>Monotributista</option><option value="Responsable Inscripto" ${c.tax === 'Responsable Inscripto' ? 'selected' : ''}>Responsable Inscripto</option></select></td>
      <td class="px-4 py-2 text-sm border border-gray-200 text-center"><button onclick="deleteBulkClientRow('${c.id}')" class="text-red-600 hover:text-red-800 font-bold text-lg">×</button></td>
    </tr>
  `).join('');

  // Agregar fila vacía al final con código auto-incrementado
  const nextCode = getNextClientCode();
  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="" class="w-full px-2 py-1 border rounded" disabled></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Nombre" data-field="name" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Código" data-field="client_code" class="w-full px-2 py-1 border rounded bulk-client-input-new code-input" value="${nextCode}"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Dirección" data-field="address" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Teléfono" data-field="phone" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Email" data-field="email" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="CUIT" data-field="cuit" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><select data-field="tax" class="w-full px-2 py-1 border rounded bulk-client-input-new"><option value="Consumidor Final">Consumidor Final</option><option value="Monotributista">Monotributista</option><option value="Responsable Inscripto">Responsable Inscripto</option></select></td>
    <td class="px-4 py-2 text-sm border border-gray-200 text-center"><button onclick="addBulkClientRow()" class="text-green-600 hover:text-green-800 font-bold text-lg">+</button></td>
  `;
  tbody.appendChild(newRow);
}

function addBulkClientRow() {
  const tbody = document.getElementById('bulk-clients-tbody');

  // Obtener el código de la última fila (la fila vacía actual)
  const lastCodeInput = tbody.querySelector('tr:last-child [data-field="client_code"]');
  let nextCode = '001';

  if (lastCodeInput) {
    const lastCode = parseInt(lastCodeInput.value || '0', 10);
    if (!isNaN(lastCode) && lastCode > 0) {
      nextCode = String(lastCode + 1).padStart(3, '0');
    }
  }

  const newRow = document.createElement('tr');
  newRow.innerHTML = `
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" value="" class="w-full px-2 py-1 border rounded" disabled></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Nombre" data-field="name" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Código" data-field="client_code" class="w-full px-2 py-1 border rounded bulk-client-input-new code-input" value="${nextCode}"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Dirección" data-field="address" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Teléfono" data-field="phone" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="Email" data-field="email" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><input type="text" placeholder="CUIT" data-field="cuit" class="w-full px-2 py-1 border rounded bulk-client-input-new"></td>
    <td class="px-4 py-2 text-sm border border-gray-200"><select data-field="tax" class="w-full px-2 py-1 border rounded bulk-client-input-new"><option value="Consumidor Final">Consumidor Final</option><option value="Monotributista">Monotributista</option><option value="Responsable Inscripto">Responsable Inscripto</option></select></td>
    <td class="px-4 py-2 text-sm border border-gray-200 text-center"><button onclick="addBulkClientRow()" class="text-green-600 hover:text-green-800 font-bold text-lg">+</button></td>
  `;
  tbody.appendChild(newRow);

  // Auto-focus en el campo de nombre
  const nameInput = newRow.querySelector('[data-field="name"]');
  if (nameInput) nameInput.focus();
}

function deleteBulkClientRow(clientId) {
  if (clientId === 'c1') {
    showToast('No se puede eliminar el cliente por defecto', 'error');
    return;
  }
  showConfirmDialog('¿Eliminar este cliente?', () => {
    STATE.clients = STATE.clients.filter(c => c.id !== clientId);
    persistData();
    renderBulkClientTable();
    showToast('Cliente eliminado', 'success');
  });
}

function saveBulkClients() {
  const rows = document.querySelectorAll('#bulk-clients-tbody tr');
  const existingIds = new Set(STATE.clients.map(c => c.id));

  rows.forEach((row, idx) => {
    const inputs = row.querySelectorAll('input, select');
    if (inputs.length < 2) return;

    const clientIdInput = row.querySelector('[data-client-id]');
    const clientId = clientIdInput?.getAttribute('data-client-id');

    const name = row.querySelector('[data-field="name"]')?.value.trim();
    const client_code = row.querySelector('[data-field="client_code"]')?.value.trim();
    const address = row.querySelector('[data-field="address"]')?.value.trim();
    const phone = row.querySelector('[data-field="phone"]')?.value.trim();
    const email = row.querySelector('[data-field="email"]')?.value.trim();
    const cuit = row.querySelector('[data-field="cuit"]')?.value.trim();
    const tax = row.querySelector('[data-field="tax"]')?.value || 'Consumidor Final';

    // Nueva fila (sin cliente ID)
    if (!clientId && name) {
      const newClientId = generateId('c');
      const finalCode = client_code || getNextClientCode();
      STATE.clients.push({
        id: newClientId,
        name,
        client_code: finalCode,
        address: address || '',
        phone: phone || '',
        email: email || '',
        cuit: cuit || '',
        tax: tax,
        notes: ''
      });
    } else if (clientId && existingIds.has(clientId)) {
      // Actualizar cliente existente
      const client = STATE.clients.find(c => c.id === clientId);
      if (client) {
        if (name) client.name = name;
        if (client_code) client.client_code = client_code;
        client.address = address;
        client.phone = phone;
        client.email = email;
        client.cuit = cuit;
        client.tax = tax;
      }
    }
  });

  persistData();
  renderClientsTable();
  showToast('Clientes guardados correctamente', 'success');
}

function exportClientsCSV() {
  const headers = ['Código', 'Nombre', 'Dirección', 'Teléfono', 'Email', 'CUIT', 'Condición'];
  const rows = STATE.clients.map(c => [
    c.client_code || '',
    c.name,
    c.address || '',
    c.phone || '',
    c.email || '',
    c.cuit || '',
    c.tax || 'Consumidor Final'
  ]);

  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Clientes exportados', 'success');
}

function importClientsCSV(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const csv = e.target?.result;
      const lines = csv.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        showToast('Archivo vacío', 'warning');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
      const importedClients = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const clientObj = {};

        headers.forEach((header, idx) => {
          if (header === 'código') clientObj.client_code = values[idx] || '';
          else if (header === 'nombre') clientObj.name = values[idx] || '';
          else if (header === 'dirección') clientObj.address = values[idx] || '';
          else if (header === 'teléfono') clientObj.phone = values[idx] || '';
          else if (header === 'email') clientObj.email = values[idx] || '';
          else if (header === 'cuit') clientObj.cuit = values[idx] || '';
          else if (header === 'condición') clientObj.tax = values[idx] || 'Consumidor Final';
        });

        if (clientObj.name) {
          clientObj.id = generateId('c');
          clientObj.notes = '';
          importedClients.push(clientObj);
        }
      }

      if (importedClients.length === 0) {
        showToast('No se encontraron clientes válidos', 'warning');
        return;
      }

      STATE.clients.push(...importedClients);
      persistData();
      renderClientsTable();
      document.getElementById('import-clients-input').value = '';
      showToast(`${importedClients.length} clientes importados correctamente`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Error al importar clientes', 'error');
    }
  };
  reader.readAsText(file);
}

function downloadClientTemplate() {
  const template = 'Código,Nombre,Dirección,Teléfono,Email,CUIT,Condición\n"001","Cliente Ejemplo","Calle 1 123","2262345678","cliente@email.com","20123456789","Responsable Inscripto"';
  const blob = new Blob([template], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla_clientes.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function openQuickClientModal() {
  const modal = document.getElementById('quick-client-modal');
  if (!modal) {
    showToast('Modal no encontrado', 'error');
    return;
  }
  document.getElementById('qc-name').value = '';
  document.getElementById('qc-code').value = getNextClientCode();
  document.getElementById('qc-phone').value = '';
  modal.classList.remove('hidden');
  document.getElementById('qc-name').focus();
}

function closeQuickClientModal() {
  const modal = document.getElementById('quick-client-modal');
  if (modal) modal.classList.add('hidden');
}

function saveQuickClient() {
  const name = document.getElementById('qc-name')?.value.trim();
  const code = document.getElementById('qc-code')?.value.trim();
  const phone = document.getElementById('qc-phone')?.value.trim();

  if (!name) {
    showToast('Por favor ingresa el nombre del cliente', 'warning');
    return;
  }

  const newClient = {
    id: generateId('c'),
    name,
    client_code: code || getNextClientCode(),
    address: '',
    phone: phone || '',
    email: '',
    cuit: '',
    tax: 'Consumidor Final',
    notes: ''
  };

  STATE.clients.push(newClient);
  persistData();
  renderPosClientCombobox();
  closeQuickClientModal();

  // Auto-seleccionar el nuevo cliente
  const clientInput = document.getElementById('admin-client-input');
  if (clientInput) {
    clientInput.value = newClient.name;
    STATE.adminSelectedClient = newClient.id;
  }

  showToast('Cliente agregado', 'success');
}
