<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-stock" class="admin-section max-w-7xl mx-auto px-4 py-6 active">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
        <h2 class="font-display text-2xl text-ink">Inventario y Precios</h2>
        <div class="flex items-center gap-2">
          <button onclick="openCreateProductModal()" class="bg-brand hover:bg-brand-dark text-ink font-bold text-xs px-3 py-2 rounded-lg">+ Nuevo Producto</button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full admin-table"><thead><tr><th>Producto</th><th>Stock</th><th>Costo ($)</th><th>Ganancia (%)</th><th>P. Venta ($)</th><th class="text-right">Acción</th></tr></thead><tbody id="admin-stock-tbody"></tbody></table>
      </div>
    </div>
  </div>
</div>
