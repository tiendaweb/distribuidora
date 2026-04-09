<nav class="bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200" id="nav-admin">
  <div class="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar py-1">
    <a class="admin-tab text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeAdminTab === 'facturacion' ? 'active text-blue-700 bg-blue-200' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100' ?>" data-tab="facturacion" href="/admin">Facturación</a>
    <a class="admin-tab text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeAdminTab === 'pedidos' ? 'active text-blue-700 bg-blue-200' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100' ?>" data-tab="pedidos" href="/admin/pedidos">Pedidos</a>
    <a class="admin-tab text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= in_array($activeAdminTab, ['stock','productos'], true) ? 'active text-blue-700 bg-blue-200' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100' ?>" data-tab="stock" href="/admin/productos">Stock</a>
    <a class="admin-tab text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeAdminTab === 'clientes' ? 'active text-blue-700 bg-blue-200' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100' ?>" data-tab="clientes" href="/admin/clientes">Clientes</a>
    <a class="admin-tab text-sm px-4 py-2 rounded-lg whitespace-nowrap flex items-center gap-2 font-semibold transition <?= $activeAdminTab === 'ajustes' ? 'active text-blue-700 bg-blue-200' : 'text-gray-700 hover:text-blue-700 hover:bg-blue-100' ?>" data-tab="ajustes" href="/admin/ajustes">Ajustes</a>
  </div>
</nav>
