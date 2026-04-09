<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-clientes" class="admin-section max-w-7xl mx-auto px-4 py-6 active">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-xl shadow-sm p-5 h-fit">
        <h2 class="font-display text-2xl text-ink mb-4" id="client-form-title">Nuevo Cliente</h2>
        <input type="hidden" id="c-id">
        <div class="space-y-3">
          <input type="text" id="c-name" placeholder="Nombre / Negocio" class="w-full border rounded p-2 text-sm">
          <input type="text" id="c-address" placeholder="Dirección" class="w-full border rounded p-2 text-sm">
          <input type="text" id="c-phone" placeholder="Teléfono" class="w-full border rounded p-2 text-sm">
          <input type="text" id="c-cuit" placeholder="CUIT / DNI" class="w-full border rounded p-2 text-sm">
          <select id="c-tax" class="w-full border rounded p-2 text-sm"><option value="Consumidor Final">Consumidor Final</option><option value="Monotributista">Monotributista</option><option value="Responsable Inscripto">Responsable Inscripto</option></select>
          <button onclick="saveClient()" class="w-full bg-brand text-ink font-bold py-2 rounded mt-2">Guardar Cliente</button>
          <button onclick="resetClientForm()" class="w-full bg-gray-200 text-gray-700 font-bold py-2 rounded text-xs mt-1">Limpiar / Cancelar</button>
        </div>
      </div>
      <div class="md:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden">
        <div class="p-4 border-b bg-gray-50"><h2 class="font-display text-2xl text-ink">Listado de Clientes</h2></div>
        <div class="overflow-x-auto"><table class="w-full admin-table"><thead><tr><th>Nombre</th><th>Dirección</th><th>CUIT</th><th>Condición</th><th class="text-right">Acción</th></tr></thead><tbody id="admin-clients-tbody"></tbody></table></div>
      </div>
      <div class="md:col-span-3 bg-white rounded-xl shadow-sm p-4">
        <h3 class="font-display text-xl text-ink mb-3">Mapa de Clientes</h3>
        <div id="clients-map" class="w-full rounded-lg border border-gray-200" style="height: 420px;"></div>
        <div id="clients-geocode-pending" class="hidden mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><ul id="clients-geocode-pending-list" class="list-disc pl-5 text-xs text-amber-900 space-y-1"></ul></div>
      </div>
    </div>
  </div>
</div>
