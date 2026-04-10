<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-facturacion" class="admin-section w-full active">
    <div class="h-screen flex flex-col lg:flex-row bg-gray-50">
      <div class="flex-1 flex flex-col overflow-hidden border-r border-gray-200">
        <div class="bg-white border-b border-gray-200 p-4 space-y-3 flex-shrink-0">
          <label class="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente</label>
          <input type="search" id="admin-client-search" placeholder="Buscar cliente..." class="w-full border rounded-lg px-3 py-2 text-sm">
          <select id="admin-client-select" class="w-full border rounded-lg px-3 py-2 text-sm"><option value="">Seleccionar cliente...</option></select>
        </div>
        <div class="bg-white border-b border-gray-200 p-3 space-y-2 flex-shrink-0">
          <input type="text" id="admin-search-prod" placeholder="🔍 Buscar por nombre o código..." class="w-full border rounded-lg px-3 py-2 text-sm">
          <div id="admin-pos-categories" class="flex gap-2 flex-wrap"></div>
        </div>
        <div class="flex-1 overflow-y-auto p-3 space-y-2">
          <div id="admin-prod-list" class="space-y-2"></div>
          <div id="admin-pos-no-results" class="hidden text-center py-8 text-gray-400"><p class="text-sm">No se encontraron productos</p></div>
        </div>
      </div>
      <div class="w-full lg:w-[420px] bg-white flex flex-col h-screen lg:h-auto lg:sticky lg:top-0 border-l border-gray-200">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 border-b border-blue-800">
          <h2 class="font-bold text-2xl">CAJA</h2>
          <p class="text-xs text-blue-100 mt-1">Facturación</p>
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
  </div>
</div>
