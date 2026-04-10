<div id="view-store" class="flex-1">
  <div id="tab-catalogo" class="tab-section">
    <section class="relative overflow-hidden bg-ink">
      <div class="slider-shell">
      <div id="slider-container" class="slider-container overflow-hidden">
        <div id="slider-track" class="slider-track"></div>
      </div>
      <button onclick="slideChange(-1)" class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full">‹</button>
      <button onclick="slideChange(1)" class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white w-9 h-9 rounded-full">›</button>
      <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" id="slider-dots"></div>
      </div>
    </section>

    <section class="bg-white border-b border-gray-100 py-3 px-4 sticky top-[108px] z-30 shadow-sm">
      <div class="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar" id="cat-pills">
        <button class="cat-btn active text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="all">Todos</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="helados">Helados</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="pastas">Pastas Frescas</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="congelados">Congelados</button>
      </div>
    </section>

    <section class="bg-white border-b border-gray-100 py-4 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="relative">
          <input id="search-input" type="text" placeholder="🔍 Buscar por nombre o código..." class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50" />
        </div>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <div id="no-results" class="hidden text-center py-16 text-gray-400"><p class="font-semibold">No se encontraron productos</p></div>
      <div id="products-grid" class="store-products-grid"></div>
    </main>
  </div>
</div>
