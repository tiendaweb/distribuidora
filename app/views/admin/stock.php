<?php
$requiresAlpine = true;
$adminShellTitle = 'Inventario y precios';
$adminShellSubtitle = 'Control de stock, costos y márgenes por producto.';

ob_start();
$buttonLabel = '+ Nuevo producto';
$buttonOnclick = 'openCreateProductModal()';
$buttonVariant = 'primary';
$buttonClass = '';
include __DIR__ . '/../partials/admin/components/button.php';
$adminShellActions = ob_get_clean();

ob_start();
?>
<div id="view-admin" class="flex-1">
  <div
    id="admin-stock"
    class="admin-section active space-y-3"
    x-data="adminStockPilot()"
    x-init="init()"
    @admin-stock-ui.window="handleEvent($event.detail)"
  >
    <div class="rounded-admin-md border border-slate-200 bg-white p-4 shadow-admin-card space-y-3">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input x-model.trim="filters.query" type="text" placeholder="Buscar por nombre o SKU" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
        <select x-model="filters.category" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Todas las categorías</option>
          <option value="helados">Helados</option>
          <option value="pastas">Pastas</option>
          <option value="congelados">Congelados</option>
        </select>
        <label class="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
          <input x-model="filters.onlyLowStock" type="checkbox" class="rounded border-slate-300">
          <span>Solo stock bajo (≤ 5)</span>
        </label>
        <button @click="clearFilters()" class="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Limpiar filtros</button>
      </div>

      <div x-cloak x-show="feedback.message" class="rounded border px-3 py-2 text-sm"
           :class="feedback.type === 'loading' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'">
        <span x-text="feedback.message"></span>
      </div>

      <p x-cloak x-show="isModalOpen" class="text-xs font-semibold text-slate-500">Modal de edición activo.</p>
    </div>

    <?php
    ob_start();
    $tableHead = '<tr><th>Producto</th><th>Stock</th><th>Costo ($)</th><th>Ganancia (%)</th><th>P. Venta ($)</th><th class="text-right">Acción</th></tr>';
    $tableBodyId = 'admin-stock-tbody';
    include __DIR__ . '/../partials/admin/components/table.php';
    $cardContent = ob_get_clean();

    $cardBodyClass = '';
    include __DIR__ . '/../partials/admin/components/card.php';
    ?>
  </div>
</div>
<?php
$adminShellContent = ob_get_clean();
include __DIR__ . '/../partials/admin_shell.php';
