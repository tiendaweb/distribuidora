# Componentes reutilizables (Admin)

Ubicación: `app/views/partials/admin/components/`

## `button.php`
Renderiza botones primario/secundario/ghost manteniendo `id`, `onclick` y clases extras.

```php
<?php
$buttonLabel = 'Guardar';
$buttonId = 'btn-save-client';
$buttonOnclick = 'saveClient()';
$buttonVariant = 'primary';
include __DIR__ . '/button.php';
?>
```

## `card.php`
Contenedor visual con borde, fondo blanco y sombra. Acepta header opcional y contenido libre.

```php
<?php
$cardHeader = '<div class="border-b px-4 py-3">Título</div>';
$cardContent = '<p class="p-4">Contenido</p>';
include __DIR__ . '/card.php';
?>
```

## `table.php`
Wrapper responsive para tablas admin (`overflow-x-auto + admin-table`).

```php
<?php
$tableHead = '<tr><th>Nombre</th></tr>';
$tableBodyId = 'admin-stock-tbody';
include __DIR__ . '/table.php';
?>
```

## `field.php`
Campo de formulario reutilizable para `<input>` y `<select>`.

```php
<?php
$fieldTag = 'input';
$fieldId = 'c-name';
$fieldPlaceholder = 'Nombre / Negocio';
include __DIR__ . '/field.php';
?>
```

```php
<?php
$fieldTag = 'select';
$fieldId = 'c-tax';
$fieldOptions = [
  ['value' => 'Consumidor Final', 'label' => 'Consumidor Final'],
  ['value' => 'Monotributista', 'label' => 'Monotributista'],
];
include __DIR__ . '/field.php';
?>
```

## `badge.php`
Badge de estado con variantes (`success`, `warning`, `danger`, `info`, `neutral`).

```php
<?php
$badgeLabel = 'Pendiente';
$badgeStatus = 'warning';
include __DIR__ . '/badge.php';
?>
```
