<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Historial de Movimientos</h1>
          <p class="text-sm text-gray-500">Registro completo de transacciones del negocio</p>
        </div>
        <div class="flex gap-2">
          <input type="date" id="history-date-from" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <input type="date" id="history-date-to" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <select id="history-type-filter" class="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="">Todos los tipos</option>
            <option value="factura">Facturas</option>
            <option value="precio">Cambios de precio</option>
            <option value="producto">Cambios de producto</option>
            <option value="stock">Ajustes de stock</option>
            <option value="bulk">Edición masiva</option>
          </select>
          <button onclick="generateHistoryReport()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap">
            Filtrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-6 space-y-6">

    <!-- Resumen Rápido -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Total Facturas</div>
        <div class="text-2xl font-bold text-gray-800"><span id="history-total-invoices">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Cambios de Precio</div>
        <div class="text-2xl font-bold text-gray-800"><span id="history-price-changes">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Cambios de Producto</div>
        <div class="text-2xl font-bold text-gray-800"><span id="history-product-changes">0</span></div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-sm font-semibold text-gray-600 mb-1">Ajustes de Stock</div>
        <div class="text-2xl font-bold text-gray-800"><span id="history-stock-changes">0</span></div>
      </div>
    </div>

    <!-- Timeline de Movimientos -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Línea de Tiempo</h2>
      <div class="space-y-4" id="history-timeline">
        <div class="text-center text-gray-400 py-8">Cargando historial...</div>
      </div>
    </div>

    <!-- Tabla Detallada -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 class="text-xl font-bold text-gray-800 mb-4">Movimientos Detallados</h2>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th style="text-align:left; padding:12px; font-weight:600;">Fecha</th>
              <th style="text-align:left; padding:12px; font-weight:600;">Tipo</th>
              <th style="text-align:left; padding:12px; font-weight:600;">Descripción</th>
              <th style="text-align:left; padding:12px; font-weight:600;">Detalles</th>
              <th style="text-align:left; padding:12px; font-weight:600; color:#ef4444;">Anterior</th>
              <th style="text-align:left; padding:12px; font-weight:600; color:#10b981;">Nuevo</th>
            </tr>
          </thead>
          <tbody id="history-table-tbody"></tbody>
        </table>
      </div>
    </div>

  </div>
</div>

<script>
  document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    document.getElementById('history-date-from').valueAsDate = thirtyDaysAgo;
    document.getElementById('history-date-to').valueAsDate = today;

    setTimeout(() => {
      if (typeof generateHistoryReport === 'function') {
        generateHistoryReport();
      }
    }, 100);
  });
</script>
