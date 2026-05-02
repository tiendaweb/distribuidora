<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-24">
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-full mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Edición Masiva</h1>
          <p class="text-sm text-gray-500">Edita precios y stock de todos tus productos en forma directa o por lista</p>
        </div>
        <div class="flex gap-2">
          <button onclick="goBackFromBulkEdit()" class="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition-all">
            ← Volver
          </button>
          <button onclick="saveBulkChanges()" class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
            Guardar Todo
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-full mx-auto px-4 py-6 space-y-4">

    <!-- Filtro de categoría -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <label class="block text-sm font-semibold text-gray-700 mb-3">Filtrar por categoría</label>
      <div id="bulk-category-filters" class="flex flex-wrap gap-2">
        <button type="button" onclick="filterBulkByCategory('all')" class="category-filter-btn active px-4 py-2 rounded-lg font-semibold text-sm transition-all" data-category="all">
          Todos
        </button>
      </div>
    </div>

    <!-- Herramientas de ajuste por lista -->
    <div class="bg-white rounded-xl shadow-sm border border-indigo-200 p-4">
      <div class="text-sm font-semibold text-indigo-700 mb-3">Ajuste masivo por lista de precios</div>
      <div id="bulk-price-tools" class="flex flex-wrap gap-3 items-end"></div>
      <p class="text-xs text-gray-400 mt-2">
        <strong>% ajuste</strong>: aplica el porcentaje sobre el precio actual de la lista (ej: 10 sube 10%).
        <strong>Copiar precio base</strong>: asigna precio base × factor de la lista.
      </p>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
            <tr>
              <th style="text-align:left; padding:12px; font-weight:600; min-width:50px;"></th>
              <th style="text-align:left; padding:12px; font-weight:600; min-width:200px;">Nombre / SKU</th>
              <th style="text-align:left; padding:12px; font-weight:600; min-width:100px;">Categoría</th>
              <th style="text-align:center; padding:12px; font-weight:600; min-width:80px;">Stock</th>
              <th style="text-align:right; padding:12px; font-weight:600; min-width:100px;">Costo</th>
              <th style="text-align:right; padding:12px; font-weight:600; min-width:100px;">P. Venta Base</th>
              <th id="bulk-price-list-headers" style="text-align:center; padding:12px; min-width:200px;">Precios por Lista</th>
            </tr>
          </thead>
          <tbody id="bulk-edit-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>

  <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
    <div class="max-w-full mx-auto px-4 py-4 flex justify-between items-center">
      <div class="text-sm font-semibold text-gray-700">
        <span id="bulk-changes-count">0</span> cambios pendientes
      </div>
      <div class="flex gap-2">
        <button onclick="goBackFromBulkEdit()" class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold transition-all">
          Cancelar
        </button>
        <button onclick="saveBulkChanges()" class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all">
          Guardar Todo
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof initBulkEdit === 'function') {
      initBulkEdit();
    }
  });
</script>
