<nav class="bg-gradient-to-r from-amber-50 to-yellow-50 border-t border-amber-200" id="nav-store">
  <div class="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar py-1">
    <a class="tab-btn text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeStoreTab === 'catalogo' ? 'active text-amber-700 bg-amber-100' : 'text-gray-700 hover:text-amber-700 hover:bg-amber-50' ?>" data-tab="catalogo" href="/">
      Catálogo
    </a>
    <a class="tab-btn text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeStoreTab === 'categorias' ? 'active text-amber-700 bg-amber-100' : 'text-gray-700 hover:text-amber-700 hover:bg-amber-50' ?>" data-tab="categorias" href="/categorias">
      Categorías
    </a>
  </div>
</nav>
