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
  try {
    try {
      if (typeof renderPosClientCombobox === 'function') {
        renderPosClientCombobox();
      }
      renderPosProductList();
      renderPosCart();
    } catch (error) {
      console.error('Error inicializando componentes POS en admin:', error);
    }

    renderOrdersTable();
    renderClientsTable();
    renderStockTable();
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

  generateInvoicePDF(clientData, docType, items, total);
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

  let content = `
    <div style="margin-bottom: 16px;">
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

  tbody.innerHTML = STATE.clients.map(c => `
    <tr>
      <td style="font-weight: bold;">${escapeHtml(c.name)}</td>
      <td style="font-size: 12px;">${escapeHtml(c.client_code || '') || '—'}</td>
      <td style="font-size: 12px;">${c.address || '—'}</td>
      <td style="font-size: 12px;">${c.cuit || '—'}</td>
      <td><span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 11px;">${c.tax}</span></td>
      <td style="text-align: right;">
        <button onclick="editClientForm('${c.id}')" style="background: none; border: none; color: #3b82f6; cursor: pointer; font-size: 11px; font-weight: bold;">Editar</button>
        ${c.id === 'c1' ? '' : `<button onclick="deleteClientWithConfirm('${c.id}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 11px; font-weight: bold; margin-left: 8px;">Eliminar</button>`}
      </td>
    </tr>
  `).join('');
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

  if (idInput) idInput.value = client.id;
  if (nameInput) nameInput.value = client.name;
  if (codeInput) codeInput.value = client.client_code || '';
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
  const codeInput = document.getElementById('c-code');
  const addressInput = document.getElementById('c-address');
  const phoneInput = document.getElementById('c-phone');
  const emailInput = document.getElementById('c-email');
  const cuitInput = document.getElementById('c-cuit');
  const taxSelect = document.getElementById('c-tax');
  const notesInput = document.getElementById('c-notes');

  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (codeInput) codeInput.value = '';
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
  const codeInput = document.getElementById('c-code');
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
    client_code: codeInput?.value.trim() || '',
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
    STATE.products[existingIdx] = {
      ...prev,
      ...productData
    };
  } else {
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
  list.innerHTML = slides.map(slide => `
    <div class="border border-gray-200 rounded-lg p-3 flex items-center gap-3">
      <img src="${normalizeSlideImageUrl(slide.image_url)}" alt="${escapeHtml(slide.title || 'Slide')}" class="w-20 h-14 object-cover rounded bg-gray-100" />
      <div class="flex-1 min-w-0">
        <p class="text-sm font-semibold text-ink truncate">${escapeHtml(slide.title || 'Sin texto')}</p>
        <p class="text-xs text-gray-500 truncate">${escapeHtml(slide.image_url)}</p>
        <p class="text-xs text-gray-500">Orden: ${Number(slide.sort_order || 0)} · ${Number(slide.is_active || 0) ? 'Activo' : 'Inactivo'}</p>
      </div>
      <button onclick="deleteSlide(${Number(slide.id)})" class="text-xs bg-red-100 text-red-700 font-semibold px-3 py-1 rounded">Eliminar</button>
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
