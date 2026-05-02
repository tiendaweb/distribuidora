<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Gestión de Stock</h1>
          <p class="text-sm text-gray-500">Administra el inventario de tus productos</p>
        </div>
        <div class="flex gap-2">
          <input type="text" id="stock-search" placeholder="Buscar producto..." class="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 md:flex-initial">
          <select id="stock-category-filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Todas las categorías</option>
          </select>
          <button onclick="filterStockList()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap">
            Filtrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-6">

    <!-- Resumen -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Total Productos</div>
        <div class="text-2xl font-bold text-gray-800"><span id="stock-total-products">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Stock Total</div>
        <div class="text-2xl font-bold text-gray-800"><span id="stock-total-units">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Productos Bajo Stock</div>
        <div class="text-2xl font-bold text-red-600"><span id="stock-low-count">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Sin Stock</div>
        <div class="text-2xl font-bold text-orange-600"><span id="stock-zero-count">0</span></div>
      </div>
    </div>

    <!-- Tabla de Stock -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th style="text-align:left; padding:12px; font-weight:600;">Producto</th>
              <th style="text-align:center; padding:12px; font-weight:600;">Categoría</th>
              <th style="text-align:right; padding:12px; font-weight:600;">Stock Actual</th>
              <th style="text-align:center; padding:12px; font-weight:600;">Estado</th>
              <th style="text-align:right; padding:12px; font-weight:600;">Acción</th>
            </tr>
          </thead>
          <tbody id="stock-manage-tbody"></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<!-- Modal para ajustar stock -->
<div id="stock-adjust-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" aria-hidden="true" onclick="closeStockAdjustModal()"></div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-xl font-bold text-gray-800" id="adjust-modal-title">Ajustar Stock</h3>
        <button onclick="closeStockAdjustModal()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-6 space-y-4">
        <input type="hidden" id="adjust-product-id">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Producto</label>
          <div id="adjust-product-name" class="text-gray-800 font-semibold"></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Stock Actual</label>
            <div id="adjust-current-stock" class="text-2xl font-bold text-gray-800"></div>
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Nuevo Stock</label>
            <input type="number" id="adjust-new-stock" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="0" min="0">
          </div>
        </div>
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Motivo del Ajuste</label>
          <textarea id="adjust-reason" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" rows="3" placeholder="Ej: Inventario físico, devolución, pérdida, etc."></textarea>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3">
        <button onclick="saveStockAdjustment()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all text-sm">
          Guardar Cambio
        </button>
        <button onclick="closeStockAdjustModal()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-all text-sm">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    renderStockManageList();
    populateStockCategoryFilter();
  });

  document.getElementById('stock-search').addEventListener('keyup', filterStockList);
</script>
