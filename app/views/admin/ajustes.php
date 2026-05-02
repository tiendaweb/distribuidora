<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-ajustes" class="admin-section max-w-7xl mx-auto px-4 py-6 active">
    <div class="space-y-6">
      <div>
        <h2 class="font-display text-2xl text-ink">Ajustes · Slider</h2>
        <p class="text-sm text-gray-600">Gestioná los slides del carrusel principal del catálogo.</p>
      </div>

      <form id="slides-form" class="space-y-3">
        <div id="slide-image-field-wrapper" class="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <label class="block text-sm font-semibold text-gray-700 mb-2">Imagen del Slide</label>
          <div id="slide-image-dropzone" class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand hover:bg-brand-pale transition mb-3" ondragover="event.preventDefault()" ondrop="handleImageFieldDrop(event,'slide-image-url')">
            <img id="slide-image-url-preview" src="" alt="" class="h-20 mx-auto object-cover rounded hidden mb-2">
            <p class="text-xs text-gray-400">Arrastrá, pegá o hacé click</p>
          </div>
          <div class="flex gap-2">
            <input type="url" id="slide-image-url" required placeholder="URL de imagen" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" oninput="updateImagePreview('slide-image-url')">
            <button type="button" onclick="openImagePickerFor('slide-image-url')" class="btn btn-secondary btn-sm whitespace-nowrap">Elegir</button>
            <input type="file" id="slide-image-url-file" accept="image/*" class="hidden" onchange="handleImageFieldFileInput(event,'slide-image-url')">
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input id="slide-title" type="text" placeholder="Texto (opcional)" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input id="slide-sort-order" type="number" placeholder="Orden" value="0" class="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>

        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input id="slide-is-active" type="checkbox" checked>
          Activo
        </label>

        <button type="submit" class="w-full bg-ink text-white font-semibold px-4 py-2 rounded-lg">Agregar slide</button>
      </form>

      <div>
        <h3 class="font-semibold text-ink mb-2">Slides actuales</h3>
        <p class="text-xs text-gray-500 mb-3">Arrastrá los slides para reordenarlos. Hacé clic en Editar para cambiar detalles.</p>
        <div id="slides-empty" class="text-sm text-gray-500 hidden">No hay slides configurados.</div>
        <div id="slides-list" class="space-y-2"></div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow-sm p-6">
      <!-- El div anterior se cierr aquí -->

    <!-- SECTION: PRICE LISTS — movido a /admin/listas-precios -->
    <div class="bg-white rounded-xl shadow-sm p-6">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="font-display text-2xl text-ink">Listas de Precios</h2>
          <p class="text-sm text-gray-600 mt-1">Las listas de precios tienen su propia sección dedicada.</p>
        </div>
        <a href="/admin/listas-precios" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all flex items-center gap-2">
          <i class="fas fa-tags"></i> Ir a Listas de Precios
        </a>
      </div>
    </div>

    <!-- SECTION: IMAGES -->
    <div class="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <div>
        <h2 class="font-display text-2xl text-ink">Ajustes · Imágenes</h2>
        <p class="text-sm text-gray-600">Administrá las imágenes subidas para productos y slides.</p>
      </div>

      <div id="images-dropzone"
           class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand hover:bg-brand-pale transition"
           ondragover="event.preventDefault()" ondrop="handleImagesDropzoneDrop(event)">
        <p class="text-sm text-gray-600 mb-2">Arrastrá imágenes aquí o</p>
        <label class="inline-block cursor-pointer text-brand font-semibold underline">
          seleccioná un archivo
          <input type="file" id="images-file-input" accept="image/*" class="hidden">
        </label>
      </div>

      <div>
        <h3 class="font-semibold text-ink mb-3">Imágenes subidas</h3>
        <div id="images-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <!-- JS renderiza aquí -->
        </div>
        <p id="images-empty" class="text-center text-gray-400 text-sm py-8">No hay imágenes subidas aún.</p>
      </div>
    </div>
    </div>
  </div>
</div>
