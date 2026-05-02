<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">

  <!-- Header con filtro de fecha -->
  <div class="bg-white border-b sticky top-0 z-20 shadow-sm">
    <div class="max-w-4xl mx-auto px-4 py-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Venta Diaria</h1>
          <p class="text-sm text-gray-500">Resumen consolidado de todas las unidades vendidas en el día</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <input type="date" id="daily-sales-date" class="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                 onchange="renderDailySales(this.value)">
          <button onclick="setDailySalesToday()" class="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all">
            Hoy
          </button>
          <button onclick="downloadDailySalesPDF()" id="btn-daily-pdf"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
            <i class="fas fa-file-pdf"></i> Descargar PDF
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-4xl mx-auto px-4 py-6 space-y-6">

    <!-- Tarjetas resumen -->
    <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="daily-summary-cards">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-xs font-semibold text-gray-500 mb-1">Total Vendido</div>
        <div class="text-2xl font-bold text-indigo-600" id="daily-total-amount">—</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div class="text-xs font-semibold text-gray-500 mb-1">Facturas/Pedidos</div>
        <div class="text-2xl font-bold text-gray-800" id="daily-total-invoices">—</div>
      </div>
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 col-span-2 md:col-span-1">
        <div class="text-xs font-semibold text-gray-500 mb-1">Unidades Totales</div>
        <div class="text-2xl font-bold text-gray-800" id="daily-total-units">—</div>
      </div>
    </div>

    <!-- Tabla de productos vendidos (estilo pedido) -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" id="daily-sales-card">

      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="font-semibold text-gray-800" id="daily-sales-title">Detalle del día</h2>
        <span class="text-xs text-gray-400" id="daily-sales-subtitle"></span>
      </div>

      <!-- Sin ventas -->
      <div id="daily-sales-empty" class="py-16 text-center text-gray-400 hidden">
        <i class="fas fa-receipt text-4xl mb-3 opacity-30"></i>
        <p class="font-medium">Sin ventas registradas para este día</p>
        <p class="text-sm mt-1">Seleccioná otra fecha o registrá ventas desde Facturación</p>
      </div>

      <!-- Tabla -->
      <div id="daily-sales-table-wrapper" class="overflow-x-auto hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="text-left px-6 py-3 font-semibold text-gray-600">Producto</th>
              <th class="text-right px-6 py-3 font-semibold text-gray-600">Unidades</th>
              <th class="text-right px-6 py-3 font-semibold text-gray-600">Precio Prom.</th>
              <th class="text-right px-6 py-3 font-semibold text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody id="daily-sales-tbody"></tbody>
          <tfoot class="border-t-2 border-gray-300 bg-gray-50">
            <tr>
              <td class="px-6 py-4 font-bold text-gray-800" colspan="2">
                TOTAL DEL DÍA
              </td>
              <td class="text-right px-6 py-4 text-sm text-gray-500" id="daily-footer-units"></td>
              <td class="text-right px-6 py-4 font-bold text-lg text-indigo-600" id="daily-footer-total"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

  </div>
</div>
