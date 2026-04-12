<?php
$requiresAlpine = true;
$adminShellTitle = 'Pedidos recibidos';
$adminShellSubtitle = 'Seguimiento de pedidos web y estados de entrega.';

ob_start();
?>
<div id="view-admin" class="flex-1">
  <div id="admin-pedidos" class="admin-section active space-y-3" x-data="adminOrdersPilot()" x-init="init()">
    <div class="rounded-admin-md border border-slate-200 bg-white p-4 shadow-admin-card">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input x-model.trim="filters.query" type="text" placeholder="Buscar cliente o dirección" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
        <select x-model="filters.source" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Todos los orígenes</option>
          <option value="web">Web</option>
          <option value="pos">POS</option>
        </select>
        <select x-model="filters.status" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="completed">Completado</option>
        </select>
        <button @click="clearFilters()" class="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Limpiar filtros</button>
      </div>
    </div>

    <?php
    $cardHeader = '<div class="border-b border-slate-200 bg-slate-50 px-4 py-3"><h2 class="text-sm font-semibold uppercase tracking-wide text-slate-600">Listado actualizado</h2></div>';

    ob_start();
    $tableHead = '<tr><th>Fecha/Hora</th><th>Cliente</th><th>Dirección</th><th>Total</th><th>Origen</th><th>Estado</th><th class="text-right">Acción</th></tr>';
    $tableBodyId = 'admin-orders-tbody';
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
