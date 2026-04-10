<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-ajustes" class="admin-section max-w-5xl mx-auto px-4 py-6 active">
    <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h2 class="font-display text-2xl text-ink">Ajustes · Slider</h2>
        <p class="text-sm text-gray-600">Gestioná los slides del carrusel principal del catálogo.</p>
      </div>

      <form id="slides-form" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input id="slide-image-url" type="url" required placeholder="URL de imagen" class="border border-gray-300 rounded-lg px-3 py-2 text-sm md:col-span-2" />
        <input id="slide-title" type="text" placeholder="Texto (opcional)" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <input id="slide-sort-order" type="number" placeholder="Orden" value="0" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <label class="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
          <input id="slide-is-active" type="checkbox" checked>
          Activo
        </label>
        <button type="submit" class="bg-ink text-white font-semibold px-4 py-2 rounded-lg md:col-span-2">Agregar slide</button>
      </form>

      <div>
        <h3 class="font-semibold text-ink mb-3">Slides actuales</h3>
        <div id="slides-empty" class="text-sm text-gray-500 hidden">No hay slides configurados.</div>
        <div id="slides-list" class="space-y-2"></div>
      </div>
    </div>
  </div>
</div>
