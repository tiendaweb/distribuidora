/* ============================================================
   APP BOOTSTRAP & INITIALIZATION
   ============================================================ */

document.addEventListener('DOMContentLoaded', async function() {
  console.log('Inicializando aplicación...');

  // Load persisted data
  await loadPersistedData();
  console.log(`Productos cargados: ${STATE.products.length}`);
  console.log(`Clientes cargados: ${STATE.clients.length}`);

  // Initialize store view
  renderProducts();
  renderSlider();
  updateStoreCartUI();
  resetSliderTimer();

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
      if (tab === 'reportes' && document.getElementById('admin-reportes')) generateAllReports();
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

  // Initialize route-driven view state
  const route = document.body?.dataset?.route || '/';
  const adminTab = document.body?.dataset?.adminTab || '';
  const storeTab = document.body?.dataset?.storeTab || '';

  if (route.startsWith('/admin')) {
    STATE.isAdminMode = true;
    initAdminPanel();
    if (adminTab) {
      switchAdminTab(adminTab);
      if (adminTab === 'clientes') initClientsTab();
      if (adminTab === 'pedidos') renderOrdersTable();
      if (adminTab === 'stock') renderStockTable();
      if (adminTab === 'ajustes' && typeof initSlidesSettings === 'function') initSlidesSettings();
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
