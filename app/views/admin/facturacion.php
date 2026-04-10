<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-facturacion" class="admin-section w-full active">
    <div class="min-h-screen flex flex-col lg:flex-row bg-gray-50 pb-20 lg:pb-0">
      <div class="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
        <div class="bg-white border-b border-gray-200 p-4 space-y-3 flex-shrink-0">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide">Productos</h2>
            <button
              type="button"
              id="admin-pos-help-btn"
              onclick="openPosShortcutsModal()"
              class="w-7 h-7 rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Abrir ayuda de atajos de caja"
              title="Ver atajos de caja"
            >
              ?
            </button>
          </div>
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
          <div id="admin-client-combobox" class="relative w-full">
            <input
              type="text"
              id="admin-client-input"
              placeholder="Buscar cliente por nombre, CUIT, teléfono o código..."
              class="w-full border rounded-lg px-3 py-2 text-sm"
              autocomplete="off"
            >
            <ul
              id="admin-client-list"
              class="absolute top-full left-0 right-0 border border-t-0 rounded-b-lg bg-white shadow-lg max-h-48 overflow-y-auto hidden z-50"
            ></ul>
          </div>
        </div>
        <div class="bg-white border-b border-gray-200 p-3 space-y-2 flex-shrink-0">
          <input type="text" id="admin-search-prod" placeholder="🔍 Buscar por nombre o código..." class="w-full border rounded-lg px-3 py-2 text-sm">
          <div id="admin-pos-categories" class="flex gap-2 flex-wrap"></div>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div id="admin-prod-list" class="pos-products-grid"></div>
          <div id="admin-pos-no-results" class="hidden text-center py-8 text-gray-400"><p class="text-sm">No se encontraron productos</p></div>
        </div>
      </div>
      <div class="w-full lg:w-[420px] bg-white flex flex-col h-screen lg:h-auto lg:sticky lg:top-0 border-l border-gray-200">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 border-b border-blue-800">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-bold text-2xl">CAJA</h2>
              <p class="text-xs text-blue-100 mt-1">Facturación</p>
            </div>
            <button
              type="button"
              onclick="openPosShortcutsModal()"
              class="w-8 h-8 rounded-full border border-blue-300 text-white font-bold hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label="Abrir ayuda de atajos de caja"
              title="Ver atajos de caja"
            >
              ?
            </button>
          </div>
        </div>
        <div class="px-4 py-3 border-b border-gray-200"><select id="admin-tipo-comp" class="w-full border rounded px-2 py-2 text-xs"><option value="negro">Presupuesto (X)</option><option value="blanco">Factura AFIP</option></select></div>
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2" id="admin-cart-items"><p class="text-center text-gray-400 text-sm py-8">El carrito está vacío</p></div>
        <div class="border-t border-gray-200 px-4 py-4 bg-gray-50 space-y-3">
          <div class="bg-blue-900 text-lime-300 rounded-lg px-4 py-3 text-center"><p class="text-xs text-blue-100">Total a Pagar</p><p class="text-3xl font-mono font-bold" id="admin-cart-total">$0</p></div>
          <div class="grid grid-cols-2 gap-2">
            <button onclick="procesarVenta(false)" class="w-full bg-gray-700 text-white font-bold py-2 rounded-lg text-sm">Guardar</button>
            <button onclick="procesarVenta(true)" class="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">Imprimir</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Navigation Buttons -->
    <div class="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-200 flex gap-3 p-3 z-40">
      <button
        id="btn-back-to-search"
        onclick="document.getElementById('admin-prod-list').scrollIntoView({ behavior: 'smooth', block: 'start' })"
        class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg text-sm transition"
        style="display: none;"
      >
        ← Buscar Productos
      </button>
      <button
        id="btn-go-to-cart"
        onclick="document.getElementById('admin-cart-items').scrollIntoView({ behavior: 'smooth', block: 'end' })"
        class="flex-1 bg-brand hover:bg-brand-dark text-ink font-bold py-3 rounded-lg text-sm transition relative"
      >
        <span>Ver Carrito</span>
        <span id="mobile-cart-count" class="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hidden">0</span>
      </button>
    </div>

    <script>
    function updateMobileNavButtons() {
      const searchBtn = document.getElementById('btn-back-to-search');
      const cartBtn = document.getElementById('btn-go-to-cart');
      const cartCount = document.getElementById('mobile-cart-count');

      if (window.innerWidth >= 1024) {
        searchBtn?.style.display = 'none';
        cartBtn?.style.display = 'none';
        return;
      }

      const cartItems = STATE?.adminCart?.length || 0;
      const isAtSearch = window.scrollY < document.getElementById('admin-cart-items')?.offsetTop - 100;

      searchBtn.style.display = isAtSearch ? 'none' : 'block';
      cartBtn.style.display = isAtSearch ? 'block' : 'none';

      if (cartCount && cartItems > 0) {
        cartCount.textContent = cartItems;
        cartCount.classList.remove('hidden');
      } else {
        cartCount?.classList.add('hidden');
      }
    }

    window.addEventListener('scroll', updateMobileNavButtons);
    document.addEventListener('DOMContentLoaded', updateMobileNavButtons);
    </script>
  </div>
</div>

<div
  id="admin-pos-shortcuts-modal"
  class="hidden fixed inset-0 z-[120] bg-black/50 flex items-center justify-center px-4"
  role="dialog"
  aria-modal="true"
  aria-labelledby="admin-pos-shortcuts-title"
  onclick="handlePosShortcutsOverlayClick(event)"
>
  <div class="w-full max-w-md bg-white rounded-xl shadow-xl p-5" onclick="event.stopPropagation()">
    <div class="flex items-start justify-between gap-3">
      <h3 id="admin-pos-shortcuts-title" class="text-lg font-bold text-gray-900">Atajos rápidos de caja</h3>
      <button
        type="button"
        onclick="closePosShortcutsModal()"
        class="w-8 h-8 rounded-full border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Cerrar ayuda de atajos"
      >
        ×
      </button>
    </div>
    <p class="text-sm text-gray-600 mt-2">
      Para cobrar más rápido en caja, podés usar estos atajos mientras atendés al cliente:
    </p>
    <ul class="mt-4 space-y-2 text-sm text-gray-700">
      <li><span class="inline-block min-w-10 px-2 py-1 rounded bg-gray-100 font-mono font-bold text-center">/</span> Buscar producto</li>
      <li><span class="inline-block min-w-10 px-2 py-1 rounded bg-gray-100 font-mono font-bold text-center">+</span> Agregar producto seleccionado</li>
      <li><span class="inline-block min-w-10 px-2 py-1 rounded bg-gray-100 font-mono font-bold text-center">Enter</span> Finalizar venta</li>
      <li><span class="inline-block min-w-10 px-2 py-1 rounded bg-gray-100 font-mono font-bold text-center">-</span> Deshacer última venta</li>
    </ul>
    <div class="mt-5 flex justify-end">
      <button
        type="button"
        id="admin-pos-shortcuts-close-btn"
        onclick="closePosShortcutsModal()"
        class="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Entendido
      </button>
    </div>
  </div>
</div>
