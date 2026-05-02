<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 py-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Reportes</h1>
          <p class="text-sm text-gray-500">Análisis completo de tu negocio</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="flex flex-wrap gap-2 items-center">
            <input type="date" id="reports-date-from" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <input type="date" id="reports-date-to" class="border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <button onclick="resetReportDateRange()" class="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap">
              Todo el historial
            </button>
            <button onclick="generateReports()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap">
              Generar
            </button>
          </div>
          <div class="flex gap-2">
            <button onclick="downloadReportsAsExcel()" class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap">
              <i class="fas fa-file-excel"></i> Excel
            </button>
            <button onclick="downloadReportsAsPDF()" class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 whitespace-nowrap">
              <i class="fas fa-file-pdf"></i> PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
      <div class="flex flex-wrap border-b border-gray-200">
        <button onclick="switchReportTab('dashboard')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-tachometer-alt mr-2"></i> Dashboard
        </button>
        <button onclick="switchReportTab('resumen')" class="reports-tab-btn active flex-1 py-3 px-4 text-sm font-semibold border-b-2 border-indigo-600 text-indigo-600 transition-all whitespace-nowrap">
          <i class="fas fa-chart-pie mr-2"></i> Resumen
        </button>
        <button onclick="switchReportTab('productos')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-box mr-2"></i> Productos
        </button>
        <button onclick="switchReportTab('clientes')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-users mr-2"></i> Clientes
        </button>
        <button onclick="switchReportTab('analisis')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-chart-line mr-2"></i> Análisis
        </button>
        <button onclick="switchReportTab('comparativas')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-exchange-alt mr-2"></i> Comparativas
        </button>
        <button onclick="switchReportTab('historico')" class="reports-tab-btn flex-1 py-3 px-4 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all border-b-2 border-transparent whitespace-nowrap">
          <i class="fas fa-history mr-2"></i> Histórico
        </button>
      </div>
    </div>

    <!-- TAB: DASHBOARD -->
    <div id="report-tab-dashboard" class="report-tab-content hidden space-y-6">
      <!-- Metric Cards -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" id="dashboard-metrics">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-1">Productos</div>
          <div class="text-2xl font-bold text-gray-800" id="dash-total-products">—</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-amber-600 mb-1">Stock Bajo</div>
          <div class="text-2xl font-bold text-amber-600" id="dash-low-stock">—</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-red-600 mb-1">Sin Stock</div>
          <div class="text-2xl font-bold text-red-600" id="dash-zero-stock">—</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-1">Clientes</div>
          <div class="text-2xl font-bold text-gray-800" id="dash-total-clients">—</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-1">Ventas del Mes</div>
          <div class="text-xl font-bold text-indigo-600" id="dash-month-sales">—</div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-xs font-semibold text-gray-500 mb-1">Listas Activas</div>
          <div class="text-2xl font-bold text-gray-800" id="dash-active-lists">—</div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Stock Status -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 class="text-base font-bold text-gray-800 mb-3">Estado del Stock</h2>
          <div id="dash-stock-status"></div>
        </div>
        <!-- Listas de Precios -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 class="text-base font-bold text-gray-800 mb-3">Listas de Precios</h2>
          <div id="dash-price-lists"></div>
        </div>
      </div>

      <!-- Últimos Cambios -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 class="text-base font-bold text-gray-800 mb-3">Últimos Cambios del Sistema</h2>
        <div id="dash-recent-changes"></div>
      </div>
    </div>

    <!-- TAB: RESUMEN -->
    <div id="report-tab-resumen" class="report-tab-content space-y-6">
      <div id="reports-summary" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-sm font-semibold text-gray-600 mb-1">Ventas Totales</div>
          <div class="text-2xl font-bold text-gray-800">$<span id="report-total-sales">0</span></div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-sm font-semibold text-gray-600 mb-1">Pedidos</div>
          <div class="text-2xl font-bold text-gray-800"><span id="report-total-orders">0</span></div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-sm font-semibold text-gray-600 mb-1">Ticket Promedio</div>
          <div class="text-2xl font-bold text-gray-800">$<span id="report-avg-ticket">0</span></div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div class="text-sm font-semibold text-gray-600 mb-1">Margen Total</div>
          <div class="text-2xl font-bold text-gray-800">$<span id="report-total-margin">0</span></div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Stock Bajo (≤ 5 unidades)</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th style="text-align:left; padding:12px; font-weight:600;">Producto</th>
                <th style="text-align:center; padding:12px; font-weight:600;">Stock Actual</th>
              </tr>
            </thead>
            <tbody id="reports-low-stock"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: PRODUCTOS -->
    <div id="report-tab-productos" class="report-tab-content hidden space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Top 10 Productos por Ingresos</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th style="text-align:left; padding:12px; font-weight:600;">Producto</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Cantidad Vendida</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Ingresos</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Costo</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Margen</th>
              </tr>
            </thead>
            <tbody id="reports-top-products"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: CLIENTES -->
    <div id="report-tab-clientes" class="report-tab-content hidden space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Top 10 Clientes por Monto</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th style="text-align:left; padding:12px; font-weight:600;">Cliente</th>
                <th style="text-align:center; padding:12px; font-weight:600;">Pedidos</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Total Gastado</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Promedio por Pedido</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Margen Ganado</th>
              </tr>
            </thead>
            <tbody id="reports-top-clients"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: ANÁLISIS -->
    <div id="report-tab-analisis" class="report-tab-content hidden space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Márgenes por Producto</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th style="text-align:left; padding:12px; font-weight:600;">Producto</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Costo Total</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Ingresos</th>
                <th style="text-align:right; padding:12px; font-weight:600;">Margen Ganado</th>
                <th style="text-align:right; padding:12px; font-weight:600;">% Margen</th>
              </tr>
            </thead>
            <tbody id="reports-margins"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: COMPARATIVAS -->
    <div id="report-tab-comparativas" class="report-tab-content hidden space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Comparativa de Listas de Precios</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
              <tr id="reports-price-lists-header">
                <th style="text-align:left; padding:12px; font-weight:600;">Producto</th>
              </tr>
            </thead>
            <tbody id="reports-price-lists"></tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB: HISTÓRICO -->
    <div id="report-tab-historico" class="report-tab-content hidden space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Histórico Completo del Sistema</h2>
        <div id="reports-history"></div>
      </div>
    </div>

  </div>
</div>

<style>
  .report-tab-content {
    display: none;
  }
  .report-tab-content.active {
    display: block;
  }
</style>

<script>
  /* Los reportes se generan desde app.js DESPUÉS de loadPersistedData()
     para evitar la race condition con el bootstrap de datos. */
  function resetReportDateRange() {
    document.getElementById('reports-date-from').value = '';
    document.getElementById('reports-date-to').value = '';
    if (typeof generateAllReports === 'function') generateAllReports();
  }
</script>
