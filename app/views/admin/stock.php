<?php
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
  <div id="admin-stock" class="admin-section active">
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
