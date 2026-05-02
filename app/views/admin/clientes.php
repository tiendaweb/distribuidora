<div id="view-admin" class="flex-1 bg-gray-50 min-h-screen pb-10">
  
  <div class="bg-white border-b sticky top-0 z-20">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between py-4 gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Administración de Clientes</h1>
          <p class="text-sm text-gray-500">Gestiona tu base de datos y ubicaciones</p>
        </div>
        
        <div class="flex items-center gap-2">
          <nav class="flex bg-gray-100 p-1 rounded-lg mr-2">
            <button onclick="switchTab('list')" id="tab-btn-list" class="tab-btn active px-4 py-2 text-sm font-medium rounded-md transition-all">
              Lista
            </button>
            <button onclick="switchTab('map')" id="tab-btn-map" class="tab-btn px-4 py-2 text-sm font-medium rounded-md transition-all text-gray-600 hover:text-gray-900">
              Mapa
            </button>
          </nav>

          <button onclick="downloadClientTemplate()" class="px-3 py-2 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-all" title="Descargar plantilla">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> Plantilla
          </button>

          <label class="px-3 py-2 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-all cursor-pointer" title="Importar clientes">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Importar
            <input type="file" id="import-clients-input" accept=".csv" onchange="importClientsCSV(event)" style="display: none;">
          </label>

          <button onclick="exportClientsCSV()" class="px-3 py-2 text-xs font-semibold rounded-md border border-gray-300 hover:bg-gray-50 transition-all" title="Exportar clientes">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg> Exportar
          </button>

          <button onclick="openBulkClientEditor()" class="px-3 py-2 text-xs font-semibold rounded-md border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all" title="Editor masivo">
            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6M9 8h6M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg> Editor Masivo
          </button>

          <button onclick="openClientModal()" class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 py-6">
    
    <div id="tab-list" class="admin-tab-content">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onclick="sortClientsBy('name')">
                  Cliente <span id="sort-name-arrow" class="text-gray-400 ml-1">⇅</span>
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onclick="sortClientsBy('client_code')">
                  Código <span id="sort-code-arrow" class="text-gray-400 ml-1">⇅</span>
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onclick="sortClientsBy('address')">
                  Dirección / CUIT <span id="sort-address-arrow" class="text-gray-400 ml-1">⇅</span>
                </th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors" onclick="sortClientsBy('tax')">
                  Condición <span id="sort-tax-arrow" class="text-gray-400 ml-1">⇅</span>
                </th>
                <th class="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody id="admin-clients-tbody" class="divide-y divide-gray-100">
              </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="tab-map" class="admin-tab-content hidden">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative">
        <div id="clients-map" class="w-full rounded-lg bg-gray-100" style="height: 600px;"></div>
        
        <div id="clients-geocode-pending" class="hidden absolute bottom-8 left-8 right-8 mx-auto max-w-lg rounded-lg border border-amber-200 bg-amber-50/95 backdrop-blur p-3 shadow-lg">
           <p class="text-xs font-bold text-amber-800 mb-1">Direcciones pendientes de ubicación:</p>
           <ul id="clients-geocode-pending-list" class="list-disc pl-5 text-xs text-amber-900 space-y-1"></ul>
        </div>
      </div>
    </div>

  </div>
</div>

<div id="client-modal" class="fixed inset-0 z-50 hidden overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-50 backdrop-blur-sm" aria-hidden="true" onclick="closeClientModal()"></div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 class="text-xl font-bold text-gray-800" id="client-form-title">Nuevo Cliente</h3>
        <button onclick="closeClientModal()" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-6">
        <input type="hidden" id="c-id">
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Información General</label>
            <input type="text" id="c-name" placeholder="Nombre / Negocio" class="w-full border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg p-3 text-sm border">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <input type="text" id="c-code" placeholder="Código" class="w-full border-gray-200 rounded-lg p-3 text-sm border">
            <input type="text" id="c-cuit" placeholder="CUIT / DNI" class="w-full border-gray-200 rounded-lg p-3 text-sm border">
          </div>
          <input type="text" id="c-address" placeholder="Dirección Completa" class="w-full border-gray-200 rounded-lg p-3 text-sm border">
          <div class="grid grid-cols-2 gap-3">
            <input type="text" id="c-phone" placeholder="Teléfono" class="w-full border-gray-200 rounded-lg p-3 text-sm border">
            <select id="c-tax" class="w-full border-gray-200 rounded-lg p-3 text-sm border bg-white">
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Monotributista">Monotributista</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Lista de Precios</label>
            <select id="c-price-list" class="w-full border-gray-200 rounded-lg p-3 text-sm border bg-white">
              <option value="">Sin asignar</option>
            </select>
          </div>
        </div>
      </div>

      <div class="px-6 py-4 bg-gray-50 flex flex-row-reverse gap-3">
        <button onclick="saveClient()" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-sm transition-all text-sm">
          Guardar Cliente
        </button>
        <button onclick="closeClientModal()" class="bg-white border border-gray-300 text-gray-700 font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-50 transition-all text-sm">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .tab-btn.active { @apply bg-white text-indigo-600 shadow-sm; }
  .admin-table th { @apply px-6 py-4; }
  /* Clases extra para mejorar visualización */
  input:focus, select:focus { outline: none !important; ring: 2px; ring-color: #4f46e5; }
</style>

<script>
    
    // 1. Manejo de Tabs
function switchTab(tab) {
  document.querySelectorAll('.admin-tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-white', 'text-indigo-600', 'shadow-sm');
    btn.classList.add('text-gray-600');
  });

  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`tab-btn-${tab}`);
  activeBtn.classList.add('active', 'bg-white', 'text-indigo-600', 'shadow-sm');
  
  if(tab === 'map') {
    // Forzar redibujado si usas Leaflet o Google Maps
    setTimeout(() => { map.invalidateSize(); centerMapOnMarkers(); }, 100);
  }
}

// 2. Manejo de Modal
function openClientModal(clientId = null) {
  if (!clientId) {
    resetClientForm();
    document.getElementById('client-form-title').innerText = "Nuevo Cliente";
    autoFillClientCode();
    document.getElementById('client-modal').classList.remove('hidden');
  } else {
    editClientForm(clientId);
  }
}

function closeClientModal() {
  document.getElementById('client-modal').classList.add('hidden');
}

// 3. Centrado Automático del Mapa (Ejemplo con Leaflet)
function centerMapOnMarkers() {
  if (markersLayer.getLayers().length > 0) {
    const group = new L.featureGroup(markersLayer.getLayers());
    map.fitBounds(group.getBounds().pad(0.1)); // pad añade un margen para que no toquen los bordes
  }
}
</script>