<?php
$adminShellTitle = 'Inventario y precios';
$adminShellSubtitle = 'Control de stock, costos y márgenes por producto.';
$adminShellActions = '<button onclick="openCreateProductModal()" class="inline-flex items-center gap-2 rounded-admin-md bg-brand px-3 py-2 text-xs font-bold text-ink transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark">+ Nuevo producto</button>';

ob_start();
?>
<div id="view-admin" class="flex-1">
  <div id="admin-stock" class="admin-section active">
    <div class="overflow-hidden rounded-admin-lg border border-slate-200 bg-white shadow-admin-card">
      <div class="overflow-x-auto">
        <table class="w-full admin-table">
          <thead>
            <tr>
              <th>Producto</th><th>Stock</th><th>Costo ($)</th><th>Ganancia (%)</th><th>P. Venta ($)</th><th class="text-right">Acción</th>
            </tr>
          </thead>
          <tbody id="admin-stock-tbody"></tbody>
        </table>
      </div>
    </div>
  </div>
</div>
<?php
$adminShellContent = ob_get_clean();
include __DIR__ . '/../partials/admin_shell.php';
