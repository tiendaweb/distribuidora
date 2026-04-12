<?php
$requiresAlpine = true;
ob_start();
?>
<div id="view-admin" class="flex-1 bg-gray-100">
  <div id="admin-clientes" class="admin-section max-w-7xl mx-auto px-4 py-6 active space-y-4" x-data="adminClientsPilot()" x-init="init()">
    <div class="rounded-admin-md border border-slate-200 bg-white p-4 shadow-admin-card">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-4">
        <input x-model.trim="filters.query" type="text" placeholder="Buscar por nombre, código o CUIT" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
        <select x-model="filters.tax" class="w-full rounded border border-slate-300 px-3 py-2 text-sm">
          <option value="all">Todas las condiciones</option>
          <option value="Consumidor Final">Consumidor Final</option>
          <option value="Monotributista">Monotributista</option>
          <option value="Responsable Inscripto">Responsable Inscripto</option>
        </select>
        <label class="inline-flex items-center gap-2 rounded border border-slate-300 px-3 py-2 text-sm">
          <input x-model="filters.withAddress" type="checkbox" class="rounded border-slate-300">
          <span>Solo con dirección</span>
        </label>
        <button @click="clearFilters()" class="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Limpiar filtros</button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <?php
      ob_start();
      ?>
      <h2 class="font-display text-2xl text-ink mb-4" id="client-form-title">Nuevo Cliente</h2>
      <input type="hidden" id="c-id">
      <div class="space-y-3">
        <?php
        $fieldTag = 'input';
        $fieldType = 'text';
        $fieldClass = 'w-full border rounded p-2 text-sm';

        $fieldId = 'c-name';
        $fieldPlaceholder = 'Nombre / Negocio';
        include __DIR__ . '/../partials/admin/components/field.php';

        $fieldId = 'c-code';
        $fieldPlaceholder = 'Código de cliente';
        include __DIR__ . '/../partials/admin/components/field.php';

        $fieldId = 'c-address';
        $fieldPlaceholder = 'Dirección';
        include __DIR__ . '/../partials/admin/components/field.php';

        $fieldId = 'c-phone';
        $fieldPlaceholder = 'Teléfono';
        include __DIR__ . '/../partials/admin/components/field.php';

        $fieldId = 'c-cuit';
        $fieldPlaceholder = 'CUIT / DNI';
        include __DIR__ . '/../partials/admin/components/field.php';

        $fieldTag = 'select';
        $fieldId = 'c-tax';
        $fieldOptions = [
          ['value' => 'Consumidor Final', 'label' => 'Consumidor Final'],
          ['value' => 'Monotributista', 'label' => 'Monotributista'],
          ['value' => 'Responsable Inscripto', 'label' => 'Responsable Inscripto'],
        ];
        include __DIR__ . '/../partials/admin/components/field.php';

        $buttonLabel = 'Guardar Cliente';
        $buttonOnclick = 'saveClient()';
        $buttonVariant = 'primary';
        $buttonClass = 'w-full mt-2 py-2';
        include __DIR__ . '/../partials/admin/components/button.php';

        $buttonLabel = 'Limpiar / Cancelar';
        $buttonOnclick = 'resetClientForm()';
        $buttonVariant = 'secondary';
        $buttonClass = 'w-full mt-1 py-2';
        include __DIR__ . '/../partials/admin/components/button.php';
        ?>
      </div>
      <?php
      $cardContent = ob_get_clean();
      $cardClass = 'h-fit p-5';
      $cardHeader = '';
      $cardBodyClass = '';
      include __DIR__ . '/../partials/admin/components/card.php';
      ?>

      <?php
      $cardHeader = '<div class="p-4 border-b bg-gray-50"><h2 class="font-display text-2xl text-ink">Listado de Clientes</h2></div>';
      ob_start();
      $tableHead = '<tr><th>Nombre</th><th>Código</th><th>Dirección</th><th>CUIT</th><th>Condición</th><th class="text-right">Acción</th></tr>';
      $tableBodyId = 'admin-clients-tbody';
      include __DIR__ . '/../partials/admin/components/table.php';
      $cardContent = ob_get_clean();
      $cardClass = 'md:col-span-2';
      $cardBodyClass = '';
      include __DIR__ . '/../partials/admin/components/card.php';
      ?>

      <div class="md:col-span-3 bg-white rounded-xl shadow-sm p-4">
        <h3 class="font-display text-xl text-ink mb-3">Mapa de Clientes</h3>
        <div id="clients-map" class="w-full rounded-lg border border-gray-200" style="height: 420px;"></div>
        <div id="clients-geocode-pending" class="hidden mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"><ul id="clients-geocode-pending-list" class="list-disc pl-5 text-xs text-amber-900 space-y-1"></ul></div>
      </div>
    </div>
  </div>
</div>
<?php
$adminShellTitle = 'Clientes';
$adminShellSubtitle = 'Alta, edición y consulta de clientes.';
$adminShellContent = ob_get_clean();
include __DIR__ . '/../partials/admin_shell.php';
