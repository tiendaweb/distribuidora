<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-pedidos" class="admin-section max-w-7xl mx-auto px-4 py-6 active">
    <div class="bg-white rounded-xl shadow-sm overflow-hidden">
      <div class="p-4 border-b bg-gray-50">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-display text-2xl text-ink">Pedidos Recibidos</h2>
        </div>

        <!-- Filtros de Fecha -->
        <div class="flex flex-wrap gap-2 items-center">
          <span class="text-xs font-semibold text-gray-600 uppercase">Filtrar por fecha:</span>
          <button onclick="filterOrdersByDate('today')" id="filter-today" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50">Hoy</button>
          <button onclick="filterOrdersByDate('yesterday')" id="filter-yesterday" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50">Ayer</button>
          <button onclick="filterOrdersByDate('day_before_yesterday')" id="filter-day-before-yesterday" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50">Hace 2 días</button>
          <button onclick="filterOrdersByDate('all')" id="filter-all" class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all border border-gray-300 hover:border-indigo-500 hover:bg-indigo-50">Todos</button>

          <div class="border-l border-gray-300 h-6 mx-2"></div>

          <span class="text-xs font-semibold text-gray-600 uppercase">Rango:</span>
          <input type="date" id="filter-date-from" class="px-2 py-1.5 text-xs border border-gray-300 rounded-md" onchange="filterOrdersByDate('range')">
          <span class="text-xs text-gray-500">hasta</span>
          <input type="date" id="filter-date-to" class="px-2 py-1.5 text-xs border border-gray-300 rounded-md" onchange="filterOrdersByDate('range')">
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full admin-table">
          <thead>
            <tr>
              <th>Fecha/Hora</th>
              <th>Número</th>
              <th class="cursor-pointer hover:bg-gray-100 transition-colors" onclick="sortOrdersBy('client')">
                Cliente <span id="sort-orders-name-arrow" class="text-gray-400 ml-1">⇅</span>
              </th>
              <th>Dirección</th>
              <th>Total</th>
              <th>Origen</th>
              <th>Estado</th>
              <th class="text-right">Acción</th>
            </tr>
          </thead>
          <tbody id="admin-orders-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>
