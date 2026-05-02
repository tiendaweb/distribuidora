/* ============================================================
   APP BOOTSTRAP & INITIALIZATION
   Punto de entrada de la aplicación. Orden de init:
   1. loadPersistedData()  — carga STATE desde /api/bootstrap
   2. renderProducts()     — renderiza el catálogo (si aplica)
   3. setupEventListeners() — adjunta handlers a botones/forms
   4. Inicialización por ruta: detecta data-admin-tab en <body>
      y llama al init específico de cada sección.
   5. setInterval(persistData, 30s) — persistencia periódica

   IMPORTANTE: todo init de módulos admin debe ir DENTRO del bloque
   "if (adminTab)" para garantizar que STATE ya está cargado.
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Inicializando aplicación...');

  // Load persisted data
  await loadPersistedData();
  console.log(`Productos cargados: ${STATE.products.length}`);
  console.log(`Clientes cargados: ${STATE.clients.length}`);
  console.log(`Slides cargados: ${STATE.slides.length}`);
  console.log(`Price lists cargados: ${STATE.priceLists.length}`);

  // Disparar evento para indicar que los datos han cargado
  document.dispatchEvent(new CustomEvent('appDataLoaded'));
  console.log('✓ Evento appDataLoaded disparado');

  // Initialize store view (only if elements exist on current page)
  if (document.getElementById('products-grid') && typeof renderProducts === 'function') {
    renderProducts();
    console.log('renderProducts() llamado');
  }

  if (document.getElementById('slider-container') && typeof renderSlider === 'function') {
    renderSlider();
    console.log('renderSlider() llamado');
  }

  if (document.getElementById('cart-items')) {
    updateStoreCartUI();
    resetSliderTimer();
  }

  // Setup event listeners
  setupEventListeners();

  // Setup search
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', debounce(function() {
      searchProducts(this.value);
    }, 300));
  }
  setupStoreSearchInputListeners();

  // Setup category filter buttons
  const catButtons = document.querySelectorAll('.cat-btn');
  catButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const category = this.dataset.category || 'all';
      filterByCategory(category, this);
    });
  });

  // Setup tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab || 'catalogo';
      switchTab(tab);
    });
  });

  // Setup admin tab buttons
  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = this.dataset.tab || 'facturacion';
      switchAdminTab(tab);
      if (tab === 'facturacion' || tab === 'pos') renderPosProductList();
      if (tab === 'pedidos') renderOrdersTable();
      if (tab === 'clientes') initClientsTab();
      if (tab === 'ajustes') {
        if (typeof initPriceListsSection === 'function') initPriceListsSection();
        if (typeof initImagesSection === 'function') initImagesSection();
      }
      if (tab === 'reportes' && document.getElementById('admin-reportes')) generateAllReports();
      if (tab === 'venta-diaria' && typeof initDailySales === 'function') initDailySales();
    });
  });

  // Setup cart drawer
  const cartBtn = document.getElementById('btn-cart-header');
  if (cartBtn) {
    cartBtn.addEventListener('click', function() {
      toggleDrawer('cart-drawer');
    });
  }

  const cartOverlay = document.getElementById('cart-drawer-overlay');
  if (cartOverlay) {
    cartOverlay.addEventListener('click', function() {
      closeDrawer('cart-drawer');
    });
  }

  // Setup modals
  setupModalHandlers();

  // Setup price list selector in POS
  const posListSelector = document.getElementById('pos-price-list');
  if (posListSelector) {
    posListSelector.addEventListener('change', function() {
      STATE.activePriceListId = parseInt(this.value) || null;
      renderPosProductList();
      renderPosCart();
    });
    if (typeof renderPosListSelector === 'function') renderPosListSelector();
  }

  // Setup paste handler for images
  if (typeof setupPasteHandler === 'function') {
    setupPasteHandler();
  }

  // Setup admin mode toggle
  const adminBtn = document.getElementById('btn-admin');
  if (adminBtn) {
    adminBtn.addEventListener('click', toggleAdminMode);
  }

  // Setup cart submit buttons
  const submitWebOrder = document.getElementById('btn-submit-web-order');
  const submitWebOrderWhatsapp = document.getElementById('btn-submit-web-order-whatsapp');

  if (submitWebOrder) {
    submitWebOrder.addEventListener('click', () => submitWebOrder(false));
  }
  if (submitWebOrderWhatsapp) {
    submitWebOrderWhatsapp.addEventListener('click', () => submitWebOrder(true));
  }

  // Setup reports
  const generateReportsBtn = document.getElementById('btn-generate-reports');
  if (generateReportsBtn) {
    generateReportsBtn.addEventListener('click', generateAllReports);
  }

  const exportReportsBtn = document.getElementById('btn-export-reports');
  if (exportReportsBtn) {
    exportReportsBtn.addEventListener('click', exportReportsToCSV);
  }

  // Setup stock table filters
  const bulkEditApplyBtn = document.getElementById('btn-bulk-edit-apply');
  if (bulkEditApplyBtn) {
    bulkEditApplyBtn.addEventListener('click', applyBulkEdit);
  }

  const bulkEditCancelBtn = document.getElementById('btn-bulk-edit-cancel');
  if (bulkEditCancelBtn) {
    bulkEditCancelBtn.addEventListener('click', cancelBulkEdit);
  }

  // Setup order filters
  const ordersFilterBtn = document.getElementById('btn-clear-orders-filters');
  if (ordersFilterBtn) {
    ordersFilterBtn.addEventListener('click', clearOrdersFilters);
  }



  // Initialize route-driven view state
  const route = document.body?.dataset?.route || '/';
  const adminTab = document.body?.dataset?.adminTab || '';
  const storeTab = document.body?.dataset?.storeTab || '';

  if (route.startsWith('/admin')) {
    STATE.isAdminMode = true;

    // Only init POS panel if elements exist (facturación tab)
    if (document.getElementById('admin-prod-list') && document.getElementById('pos-price-list')) {
      initAdminPanel();
    }

    if (adminTab) {
      switchAdminTab(adminTab);
      if (adminTab === 'clientes') initClientsTab();
      if (adminTab === 'pedidos') renderOrdersTable();
      if (adminTab === 'stock') renderStockTable();
      if (adminTab === 'ajustes') {
        if (typeof initSlidesSettings === 'function') initSlidesSettings();
        if (typeof initPriceListsSection === 'function') initPriceListsSection();
        if (typeof initImagesSection === 'function') initImagesSection();
      }
      // Reportes: generar DESPUÉS de loadPersistedData() para evitar race condition
      if (adminTab === 'reportes' && typeof generateAllReports === 'function') {
        generateAllReports();
        if (typeof switchReportTab === 'function') switchReportTab('dashboard');
      }
      if (adminTab === 'listas-precios' && typeof initPriceListsSection === 'function') {
        initPriceListsSection();
        if (typeof renderPriceComparisonTable === 'function') renderPriceComparisonTable();
      }
      if (adminTab === 'venta-diaria' && typeof initDailySales === 'function') {
        initDailySales();
      }
    }
  } else if (storeTab) {
    switchTab(storeTab);
  }

  // Persist data periodically
  setInterval(persistData, 30000); // Every 30 seconds

  console.log('Aplicación inicializada correctamente');
});

function setupEventListeners() {
  // Client form
  const saveClientBtn = document.getElementById('btn-save-client');
  const resetClientBtn = document.getElementById('btn-reset-client');

  if (saveClientBtn) {
    saveClientBtn.addEventListener('click', saveClient);
  }
  if (resetClientBtn) {
    resetClientBtn.addEventListener('click', resetClientForm);
  }

  // Stock/Product edit
  const saveProductBtn = document.getElementById('btn-save-product');
  const cancelProductBtn = document.getElementById('btn-cancel-product-edit');

  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', saveEditedProduct);
  }
  if (cancelProductBtn) {
    cancelProductBtn.addEventListener('click', () => closeModal('edit-product-modal'));
  }

  const costInput = document.getElementById('edit-p-cost');
  const marginInput = document.getElementById('edit-p-margin');
  const saleInput = document.getElementById('edit-p-sale');

  if (costInput) costInput.addEventListener('input', () => recalculatePrice('cost'));
  if (marginInput) marginInput.addEventListener('input', () => recalculatePrice('margin'));
  if (saleInput) saleInput.addEventListener('input', () => recalculatePrice('sale'));

  // POS
  const procesarVentaBtn = document.getElementById('btn-procesar-venta');
  const imprimirPdfBtn = document.getElementById('btn-imprimir-pdf');

  if (procesarVentaBtn) {
    procesarVentaBtn.addEventListener('click', () => procesarVenta(false));
  }
  if (imprimirPdfBtn) {
    imprimirPdfBtn.addEventListener('click', () => procesarVenta(true));
  }

  // Document type selector (POS)
  const docTypeRadios = document.querySelectorAll('input[name="admin-tipo-comp"]');
  docTypeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      setDocumentType(this.value);
    });
  });

  // Reports date filter
  const dateFromInput = document.getElementById('reports-date-from');
  const dateToInput = document.getElementById('reports-date-to');

  if (dateFromInput) {
    dateFromInput.addEventListener('change', generateAllReports);
  }
  if (dateToInput) {
    dateToInput.addEventListener('change', generateAllReports);
  }

  // Orders filter
  const ordersSourceSelect = document.getElementById('orders-filter-source');
  const ordersStatusSelect = document.getElementById('orders-filter-status');

  if (ordersSourceSelect) {
    ordersSourceSelect.addEventListener('change', function() {
      setOrdersFilter('source', this.value);
    });
  }
  if (ordersStatusSelect) {
    ordersStatusSelect.addEventListener('change', function() {
      setOrdersFilter('status', this.value);
    });
  }
}

function setupModalHandlers() {
  // Product modal
  const productModal = document.getElementById('product-modal');
  if (productModal) {
    productModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal('product-modal');
      }
    });
  }

  const closeProductModalBtn = document.getElementById('btn-close-product-modal');
  if (closeProductModalBtn) {
    closeProductModalBtn.addEventListener('click', () => closeModal('product-modal'));
  }

  // Edit product modal
  const editProductModal = document.getElementById('edit-product-modal');
  if (editProductModal) {
    editProductModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal('edit-product-modal');
      }
    });
  }

  // Order detail modal
  const orderModal = document.getElementById('order-detail-modal');
  if (orderModal) {
    orderModal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal('order-detail-modal');
      }
    });
  }

  const closeOrderModalBtn = document.getElementById('btn-close-order-modal');
  if (closeOrderModalBtn) {
    closeOrderModalBtn.addEventListener('click', () => closeModal('order-detail-modal'));
  }
}

// Global error handler
window.addEventListener('error', function(event) {
  console.error('Error:', event.error);
  showToast('Ocurrió un error en la aplicación', 'error');
});

// Prevent accidental page exit with unsaved changes
window.addEventListener('beforeunload', function(e) {
  if (STATE.cart.length > 0 || STATE.adminCart.length > 0) {
    e.preventDefault();
    e.returnValue = '';
  }
});
