<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen">
  <div class="bg-white border-b sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between py-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Editor Masivo de Clientes</h1>
          <p class="text-sm text-gray-500">Edita múltiples clientes como en una hoja de cálculo</p>
        </div>
        <a href="/admin/clientes" class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all">
          ← Volver
        </a>
      </div>
    </div>
  </div>

  <div class="max-w-full mx-auto px-4 py-6">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="p-4 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 class="font-bold text-gray-800">Clientes</h2>
          <p class="text-xs text-gray-500 mt-1">Edita los datos directamente en la tabla. Haz clic en <span class="font-bold">+</span> para agregar nuevas filas.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="downloadClientTemplate()" class="px-3 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-all">
            📋 Plantilla
          </button>
          <button onclick="document.getElementById('import-file-bulk').click()" class="px-3 py-2 text-sm font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-all">
            📥 Importar
          </button>
          <button onclick="exportClientsCSV()" class="px-3 py-2 text-sm font-semibold bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all">
            📤 Exportar
          </button>
          <input type="file" id="import-file-bulk" accept=".csv" onchange="importClientsCSV(event)" style="display: none;">
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-200">
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">#</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Nombre</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Código</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Dirección</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Teléfono</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Email</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">CUIT</th>
              <th class="px-4 py-3 text-xs font-bold text-left text-gray-700">Condición</th>
              <th class="px-4 py-3 text-xs font-bold text-center text-gray-700">Acción</th>
            </tr>
          </thead>
          <tbody id="bulk-clients-tbody" class="divide-y divide-gray-200"></tbody>
        </table>
      </div>

      <div class="p-4 border-t bg-gray-50 flex justify-between items-center">
        <p class="text-sm text-gray-600">
          Total: <span id="bulk-total-count" class="font-bold">0</span> clientes
        </p>
        <div class="flex gap-3">
          <a href="/admin/clientes" class="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-all text-center">
            Cancelar
          </a>
          <button onclick="saveBulkClientsAndReturn()" class="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-sm transition-all">
            ✓ Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
console.log('✓ Script del editor masivo cargado');

// Escuchar el evento appDataLoaded de app.js
document.addEventListener('appDataLoaded', () => {
  console.log('✓ Evento appDataLoaded recibido');
  console.log('STATE.clients:', STATE?.clients?.length);

  if (typeof renderBulkClientTable === 'function') {
    renderBulkClientTable();
    updateBulkClientCount();
    console.log('✓ Tabla renderizada');
  } else {
    console.error('renderBulkClientTable no está definida');
  }
});

// Fallback: si appDataLoaded no se dispara, intentar después de 2 segundos
setTimeout(() => {
  if (!document.getElementById('bulk-clients-tbody').hasChildNodes() ||
      document.getElementById('bulk-clients-tbody').children.length === 0) {
    console.log('Fallback: renderizando tabla manualmente');
    if (typeof STATE !== 'undefined' && STATE.clients && typeof renderBulkClientTable === 'function') {
      renderBulkClientTable();
      updateBulkClientCount();
    }
  }
}, 2000);

function updateBulkClientCount() {
  if (typeof STATE !== 'undefined' && STATE.clients) {
    const count = STATE.clients.length;
    const countEl = document.getElementById('bulk-total-count');
    if (countEl) countEl.textContent = count;
  }
}

function saveBulkClientsAndReturn() {
  saveBulkClients();
  setTimeout(() => {
    window.location.href = '/admin/clientes';
  }, 500);
}
</script>

<style>
  #bulk-clients-tbody td {
    padding: 8px;
    border: 1px solid #e5e7eb;
    vertical-align: middle;
  }

  #bulk-clients-tbody input {
    width: 100%;
    padding: 8px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
  }

  #bulk-clients-tbody input:focus {
    outline: none;
    ring: 2px;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  #bulk-clients-tbody input:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  #bulk-clients-tbody button {
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
  }

  #bulk-clients-tbody .delete-btn:hover {
    color: #dc2626;
    transform: scale(1.2);
  }

  #bulk-clients-tbody .add-btn:hover {
    color: #16a34a;
    transform: scale(1.2);
  }

  #bulk-clients-tbody tr:hover {
    background-color: #f9fafb;
  }
</style>
