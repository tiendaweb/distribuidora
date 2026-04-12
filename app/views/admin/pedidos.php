<?php
$adminShellTitle = 'Pedidos recibidos';
$adminShellSubtitle = 'Seguimiento de pedidos web y estados de entrega.';

ob_start();
?>
<div id="view-admin" class="flex-1">
  <div id="admin-pedidos" class="admin-section active">
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
