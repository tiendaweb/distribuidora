<div id="view-admin" class="flex-1 bg-gray-100 font-sans antialiased">
  <div id="admin-facturacion" class="admin-section w-full active">
    <div class="h-screen flex flex-col lg:flex-row overflow-hidden bg-gray-100">
      
      <div class="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-sm">
        <div class="p-4 space-y-4 border-b border-gray-100">
          <div class="flex items-center justify-between">
            <h2 class="text-xs font-black text-gray-400 uppercase tracking-widest">Panel de Ventas</h2>
            <button type="button" onclick="openPosShortcutsModal()" class="group flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
              <span class="flex items-center justify-center w-5 h-5 rounded-full border border-blue-200 bg-blue-50 group-hover:bg-blue-100">?</span>
              Atajos (F1)
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="relative">
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Cliente</label>
              <div class="flex gap-2">
                <div id="admin-client-combobox" class="relative flex-1">
                  <input type="text" id="admin-client-input" placeholder="Nombre, CUIT o Tel..." class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" autocomplete="off">
                  <ul id="admin-client-list" class="absolute top-full left-0 right-0 mt-1 border rounded-xl bg-white shadow-2xl max-h-60 overflow-y-auto hidden z-[60]"></ul>
                </div>
                <button type="button" onclick="openQuickClientModal()" title="Agregar nuevo cliente" class="flex items-center justify-center w-10 h-10 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-bold text-lg">+</button>
              </div>
            </div>
            <div class="relative">
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Lista de Precios</label>
              <select id="pos-price-list" class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
                <!-- JS renderiza aquí -->
              </select>
            </div>
            <div class="relative">
              <label class="block text-[10px] font-bold text-gray-500 uppercase mb-1 ml-1">Buscador de Productos</label>
              <input type="text" id="admin-search-prod" placeholder="🔍 Escribe nombre o escanea código..." class="w-full bg-gray-50 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            </div>
          </div>

          <div id="admin-pos-categories" class="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/50">
          <div id="admin-prod-list" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            </div>
          <div id="admin-pos-no-results" class="hidden flex flex-col items-center justify-center py-20 text-gray-400">
             <svg class="w-12 h-12 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-width="2" stroke-linecap="round"/></svg>
             <p class="text-sm">No encontramos productos con ese criterio</p>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-[400px] bg-white flex flex-col shadow-2xl z-10">
        <div class="bg-slate-900 text-white p-5">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-xl font-black tracking-tight">MI CAJA</h2>
              <p class="text-[10px] text-slate-400 uppercase tracking-widest">Terminal de Cobro #01</p>
            </div>
            <div class="text-right">
              <select
                id="admin-tipo-comp"
                onchange="setDocumentType(this.value)"
                class="bg-slate-800 border-none text-white text-xs rounded-lg focus:ring-blue-500 py-1.5 pl-3 pr-8 cursor-pointer">
                <option value="x" selected>Presupuesto (X)</option>
                <option value="a">Factura A</option>
                <option value="b">Factura B</option>
                <option value="c">Factura C</option>
              </select>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-2" id="admin-cart-items">
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="2"/></svg>
              </div>
              <p class="text-gray-400 text-sm font-medium">El carrito está vacío</p>
            </div>
          </div>
        </div>

        <div class="p-4 bg-gray-50 border-t border-gray-200 space-y-4">
          <div class="bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-inner">
            <div class="flex justify-between items-center mb-1">
              <span class="text-[10px] font-bold text-gray-400 uppercase">Total Bruto</span>
              <span class="text-xs font-bold text-gray-500" id="cart-subtotal">$0.00</span>
            </div>
            <div class="flex justify-between items-end">
              <span class="text-sm font-black text-slate-700">A PAGAR</span>
              <span class="text-3xl font-black text-blue-600 tracking-tighter" id="admin-cart-total">$0</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button onclick="procesarVenta(false)" class="flex flex-col items-center justify-center bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl transition-all active:scale-95">
              <span class="text-xs font-bold">Guardar</span>
              <span class="text-[9px] opacity-60">F8</span>
            </button>
            <button onclick="procesarVenta(true)" class="flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-95">
              <span class="text-xs font-bold">Cobrar e Imprimir</span>
              <span class="text-[9px] text-blue-200">F9 o Enter</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 lg:hidden z-50 w-[90%] max-w-sm">
        <button id="btn-toggle-cart" class="w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex justify-between items-center">
            <div class="flex items-center gap-3">
                <div class="relative">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-width="2"/></svg>
                    <span id="mobile-cart-count" class="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-900">0</span>
                </div>
                <span class="text-sm font-bold">Ver Carrito</span>
            </div>
            <span id="mobile-total" class="text-lg font-black text-lime-400">$0</span>
        </button>
    </div>
  </div>
</div>

<!-- Modal Cliente Rápido (desde Facturación) -->
<div id="quick-client-modal" class="fixed inset-0 z-50 hidden overflow-y-auto bg-gray-900 bg-opacity-50 backdrop-blur-sm">
  <div class="flex items-center justify-center min-h-screen px-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-lg font-bold text-gray-800">Nuevo Cliente Rápido</h3>
        <button onclick="closeQuickClientModal()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Nombre del Cliente*</label>
          <input type="text" id="qc-name" placeholder="Ej: Juan Pérez" class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Código</label>
            <input type="text" id="qc-code" placeholder="001" class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-600 uppercase mb-2">Teléfono</label>
            <input type="text" id="qc-phone" placeholder="2262345678" class="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent">
          </div>
        </div>

        <p class="text-xs text-gray-500">Los datos adicionales puedes completarlos después en Administración.</p>
      </div>

      <div class="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
        <button onclick="closeQuickClientModal()" class="flex-1 bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-all text-sm">
          Cancelar
        </button>
        <button onclick="saveQuickClient()" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg shadow-sm transition-all text-sm">
          Crear Cliente
        </button>
      </div>
    </div>
  </div>
</div>

<script>
    
    // Manejo de visibilidad del modal y scroll
function updateMobileNavButtons() {
    const cartToggle = document.getElementById('btn-toggle-cart');
    const cartSection = document.getElementById('admin-cart-items');
    
    if (window.innerWidth >= 1024) {
        cartToggle?.classList.add('hidden');
        return;
    } else {
        cartToggle?.classList.remove('hidden');
    }

    const cartItems = STATE?.adminCart?.length || 0;
    const countBadge = document.getElementById('mobile-cart-count');
    
    if (countBadge) {
        countBadge.textContent = cartItems;
        countBadge.classList.toggle('hidden', cartItems === 0);
    }
}

// Atajos de teclado globales
document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
        e.preventDefault();
        openPosShortcutsModal();
    }
    if (e.key === 'Escape') {
        closePosShortcutsModal();
    }
    // El "/" para buscar es excelente, asegúrate de hacer focus al input
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('admin-search-prod').focus();
    }
});

// Animación suave para el carrito en móvil
document.getElementById('btn-toggle-cart')?.addEventListener('click', () => {
    const cart = document.getElementById('admin-cart-items');
    cart.scrollIntoView({ behavior: 'smooth' });
});
</script>